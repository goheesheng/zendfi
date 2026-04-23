// ThetanutsService - wraps the Thetanuts SDK for ZendFi loan operations
//
// ZendFi uses a two-layer architecture:
// 1. LoanCoordinator (ZendFi custom) - manages loan requests and collateral
// 2. Thetanuts V4 OptionFactory (via SDK) - handles the RFQ auction + option creation
//
// The LoanCoordinator.requestLoan() internally calls OptionFactory.requestForQuotation().
// Early settlement goes through LoanCoordinator.settleQuotationEarly().
// Exercise/settlement happens directly on the PhysicallySettledCallOption contract.

import { ThetanutsClient } from '@thetanuts-finance/thetanuts-client';
import { ethers, Contract, JsonRpcSigner, JsonRpcProvider } from 'ethers';
import { LOAN_COORDINATOR_ABI, PHY_OPTION_ABI, ERC20_ABI, OPTION_FACTORY_EVENTS_ABI } from './abis';
import {
  CHAIN_ID,
  LOAN_COORDINATOR_ADDRESS,
  USDC_ADDRESS,
  LOAN_ASSETS,
  STRIKE_DECIMALS,
  HOURS_PER_YEAR,
  DEFAULT_OFFER_DURATION_SECONDS,
  type AssetKey,
} from './constants';
import type { Loan, OfferInfo, LoanStatus, StrikeOption, DeribitPricingMap, StrikeOptionGroup, UserSettings } from '../types';
import { fetchDeribitPricing, getFilteredStrikeOptions } from './pricing';

export class ThetanutsService {
  private client: ThetanutsClient;
  private coordinatorRead: Contract;
  private coordinatorWrite: Contract | null = null;
  private factoryRead: Contract;
  private signer: JsonRpcSigner | null = null;
  private userAddress: string | null = null;
  private pricingCache: { data: DeribitPricingMap; fetchedAt: number } | null = null;
  private readonly PRICING_CACHE_TTL = 30_000;

  constructor(provider: JsonRpcProvider) {
    // Initialize read-only Thetanuts client
    this.client = new ThetanutsClient({
      chainId: CHAIN_ID,
      provider: provider as any, // SDK expects ethers v6 provider
    });

    // LoanCoordinator for read operations
    this.coordinatorRead = new Contract(LOAN_COORDINATOR_ADDRESS, LOAN_COORDINATOR_ABI, provider);

    // OptionFactory event interface (for listening to events)
    this.factoryRead = new Contract(
      this.client.chainConfig.contracts.optionFactory,
      OPTION_FACTORY_EVENTS_ABI,
      provider
    );
  }

  /** Attach a signer for write operations */
  setSigner(signer: JsonRpcSigner, address: string) {
    this.signer = signer;
    this.userAddress = address;
    this.coordinatorWrite = new Contract(LOAN_COORDINATOR_ADDRESS, LOAN_COORDINATOR_ABI, signer);

    // Update SDK client with signer
    this.client = new ThetanutsClient({
      chainId: CHAIN_ID,
      provider: signer.provider as any,
      signer: signer as any,
    });
  }

  getClient(): ThetanutsClient {
    return this.client;
  }

  // ─── ECDH Key Management (via SDK) ───

  async getOrCreateKeyPair() {
    return this.client.rfqKeys.getOrCreateKeyPair();
  }

  async loadKeyPair() {
    return this.client.rfqKeys.loadKeyPair();
  }

  async decryptOffer(encryptedData: string, signingKey: string) {
    return this.client.rfqKeys.decryptOffer(encryptedData, signingKey);
  }

  // ─── Market Data (via SDK) ───

  async getMarketData() {
    return this.client.api.getMarketData();
  }

  async getPricing(underlying: 'ETH' | 'BTC') {
    return this.client.mmPricing.getAllPricing(underlying);
  }

  // ─── Loan Request (via LoanCoordinator) ───

  async requestLoan(params: {
    assetKey: AssetKey;
    collateralAmount: bigint;
    strike: bigint;
    expiryTimestamp: number;
    minSettlementAmount: bigint;
    keepOrderOpen: boolean;
  }) {
    if (!this.coordinatorWrite || !this.signer) throw new Error('Wallet not connected');

    const asset = LOAN_ASSETS[params.assetKey];
    const keyPair = await this.getOrCreateKeyPair();

    const offerEndTimestamp = Math.floor(Date.now() / 1000) + DEFAULT_OFFER_DURATION_SECONDS;

    // Approve collateral transfer to LoanCoordinator
    await this.ensureAllowance(asset.collateral, LOAN_COORDINATOR_ADDRESS, params.collateralAmount);

    // Submit loan request
    const tx = await this.coordinatorWrite.requestLoan({
      collateralToken: asset.collateral,
      priceFeed: asset.priceFeed,
      settlementToken: USDC_ADDRESS,
      collateralAmount: params.collateralAmount,
      strike: params.strike,
      expiryTimestamp: params.expiryTimestamp,
      offerEndTimestamp,
      minSettlementAmount: params.minSettlementAmount,
      convertToLimitOrder: params.keepOrderOpen,
      requesterPublicKey: keyPair.compressedPublicKey,
    });

    const receipt = await tx.wait();
    return { tx, receipt, keyPair };
  }

  // ─── Accept Offer (Early Settlement via LoanCoordinator) ───

  async acceptOffer(quotationId: bigint, offerAmount: bigint, nonce: string, offeror: string) {
    if (!this.coordinatorWrite) throw new Error('Wallet not connected');

    const tx = await this.coordinatorWrite.settleQuotationEarly(
      quotationId,
      offerAmount,
      nonce,
      offeror
    );
    return tx.wait();
  }

  // ─── Cancel Loan ───

  async cancelLoan(quotationId: bigint) {
    if (!this.coordinatorWrite) throw new Error('Wallet not connected');

    const tx = await this.coordinatorWrite.cancelLoan(quotationId);
    return tx.wait();
  }

  // ─── Option Exercise (direct on PhysicallySettledCallOption) ───

  async exerciseOption(optionAddress: string) {
    if (!this.signer) throw new Error('Wallet not connected');

    const option = new Contract(optionAddress, PHY_OPTION_ABI, this.signer);
    const tx = await option.exercise();
    return tx.wait();
  }

  async swapAndExercise(optionAddress: string, aggregator: string, swapData: string) {
    if (!this.signer) throw new Error('Wallet not connected');

    const option = new Contract(optionAddress, PHY_OPTION_ABI, this.signer);
    const tx = await option.swapAndExercise(aggregator, swapData);
    return tx.wait();
  }

  async doNotExercise(optionAddress: string) {
    if (!this.signer) throw new Error('Wallet not connected');

    const option = new Contract(optionAddress, PHY_OPTION_ABI, this.signer);
    const tx = await option.doNotExercise();
    return tx.wait();
  }

  // ─── Option Queries ───

  async getOptionInfo(optionAddress: string) {
    const option = new Contract(optionAddress, PHY_OPTION_ABI, this.coordinatorRead.runner);
    const [buyer, seller, collateralToken, collateralAmount, expiryTimestamp, strikes, isSettled, twap, deliveryAmount, exerciseWindow] =
      await Promise.all([
        option.buyer(),
        option.seller(),
        option.collateralToken(),
        option.collateralAmount(),
        option.expiryTimestamp(),
        option.getStrikes(),
        option.optionSettled(),
        option.getTWAP().catch(() => 0n),
        option.calculateDeliveryAmount().catch(() => 0n),
        option.EXERCISE_WINDOW(),
      ]);

    return {
      buyer,
      seller,
      collateralToken,
      collateralAmount,
      expiryTimestamp: Number(expiryTimestamp),
      strikes: strikes.map((s: bigint) => Number(s) / 10 ** STRIKE_DECIMALS),
      isSettled,
      twap: Number(twap),
      deliveryAmount,
      exerciseWindow: Number(exerciseWindow),
    };
  }

  async isOptionITM(optionAddress: string): Promise<boolean> {
    const option = new Contract(optionAddress, PHY_OPTION_ABI, this.coordinatorRead.runner);
    const twap = await option.getTWAP();
    return option.isITM(twap);
  }

  // ─── Loan Query (from LoanCoordinator) ───

  async getLoanRequest(quotationId: bigint) {
    const result = await this.coordinatorRead.loanRequests(quotationId);
    return {
      requester: result.requester as string,
      collateralAmount: result.collateralAmount as bigint,
      strike: result.strike as bigint,
      expiryTimestamp: Number(result.expiryTimestamp),
      collateralToken: result.collateralToken as string,
      settlementToken: result.settlementToken as string,
      isSettled: result.isSettled as boolean,
      settledOptionContract: result.settledOptionContract as string,
    };
  }

  // ─── User Positions (via SDK Indexer) ───

  async getUserRfqs() {
    if (!this.userAddress) return [];
    return this.client.api.getUserRfqs(this.userAddress);
  }

  async getUserPositions() {
    if (!this.userAddress) return [];
    return this.client.api.getUserPositionsFromIndexer(this.userAddress);
  }

  // ─── Token Operations ───

  async getBalance(tokenAddress: string, owner?: string): Promise<bigint> {
    const addr = owner || this.userAddress;
    if (!addr) return 0n;

    const token = new Contract(tokenAddress, ERC20_ABI, this.coordinatorRead.runner);
    return token.balanceOf(addr);
  }

  async getAllowance(tokenAddress: string, spender: string): Promise<bigint> {
    if (!this.userAddress) return 0n;

    const token = new Contract(tokenAddress, ERC20_ABI, this.coordinatorRead.runner);
    return token.allowance(this.userAddress, spender);
  }

  async ensureAllowance(tokenAddress: string, spender: string, amount: bigint) {
    if (!this.signer || !this.userAddress) throw new Error('Wallet not connected');

    const current = await this.getAllowance(tokenAddress, spender);
    if (current >= amount) return; // Already sufficient

    const token = new Contract(tokenAddress, ERC20_ABI, this.signer);
    const tx = await token.approve(spender, amount);
    await tx.wait();
  }

  // ─── Event Subscriptions ───

  onLoanRequested(callback: (quotationId: bigint, requester: string, event: any) => void) {
    this.coordinatorRead.on('LoanRequested', callback);
    return () => this.coordinatorRead.off('LoanRequested', callback);
  }

  onOfferMade(callback: (quotationId: bigint, offeror: string, ...args: any[]) => void) {
    this.factoryRead.on('OfferMade', callback);
    return () => this.factoryRead.off('OfferMade', callback);
  }

  onQuotationSettled(callback: (quotationId: bigint, requester: string, winner: string, optionAddress: string) => void) {
    this.factoryRead.on('QuotationSettled', callback);
    return () => this.factoryRead.off('QuotationSettled', callback);
  }

  onQuotationCancelled(callback: (quotationId: bigint) => void) {
    this.factoryRead.on('QuotationCancelled', callback);
    return () => this.factoryRead.off('QuotationCancelled', callback);
  }

  // ─── Pricing Helpers ───

  async fetchPricing(): Promise<DeribitPricingMap> {
    if (this.pricingCache && Date.now() - this.pricingCache.fetchedAt < this.PRICING_CACHE_TTL) {
      return this.pricingCache.data;
    }
    const data = await fetchDeribitPricing();
    this.pricingCache = { data, fetchedAt: Date.now() };
    return data;
  }

  async getGroupedStrikeOptions(
    assetKey: AssetKey,
    settings: UserSettings
  ): Promise<StrikeOptionGroup[]> {
    const pricing = await this.fetchPricing();
    return getFilteredStrikeOptions(pricing, assetKey, settings);
  }

  /** Get available strike options for an asset, filtering by user settings */
  async getStrikeOptions(
    assetKey: AssetKey,
    minDays: number,
    maxStrikes: number,
    maxApr: number
  ): Promise<StrikeOption[]> {
    const settings: UserSettings = {
      minDurationDays: minDays,
      maxStrikes,
      sortOrder: 'highestStrike',
      maxApr,
      keepOrderOpen: true,
    };
    const groups = await this.getGroupedStrikeOptions(assetKey, settings);
    return groups.flatMap((g) => g.options);
  }

  // ─── WebSocket (via SDK) ───

  async subscribeOrders(callback: (update: any) => void) {
    return this.client.ws.subscribeOrders(callback);
  }

  async subscribePrices(callback: (update: any) => void, asset?: string) {
    return this.client.ws.subscribePrices(callback, asset);
  }

}
