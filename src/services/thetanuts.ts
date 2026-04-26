// ThetanutsService - wraps the Thetanuts SDK for ZendFi loan operations
//
// All contract interactions now go through the SDK modules:
// - client.loan: LoanCoordinator + Physical Option operations
// - client.erc20: Token balances, allowances, approvals
// - client.optionFactory: RFQ settlement
// - client.events: Historical event queries
// - client.ws: Real-time WebSocket subscriptions
// - client.rfqKeys: ECDH key management
// - client.api: Indexer data, market data
// - client.mmPricing: Market maker pricing

import { ThetanutsClient, LocalStorageProvider } from '@thetanuts-finance/thetanuts-client';
import { JsonRpcSigner, JsonRpcProvider } from 'ethers';
import { CHAIN_ID } from './constants';
import type { DeribitPricingMap, StrikeOptionGroup, UserSettings } from '../types';
import { fetchDeribitPricing, getFilteredStrikeOptions } from './pricing';
import type { AssetKey } from './constants';

export class ThetanutsService {
  private client: ThetanutsClient;
  private userAddress: string | null = null;
  private pricingCache: { data: DeribitPricingMap; fetchedAt: number } | null = null;
  private readonly PRICING_CACHE_TTL = 30_000;

  constructor(provider: JsonRpcProvider) {
    this.client = new ThetanutsClient({
      chainId: CHAIN_ID,
      provider: provider as any,
      keyStorageProvider: typeof window !== 'undefined' ? new LocalStorageProvider() : undefined,
    });
  }

  /** Attach a signer for write operations */
  setSigner(signer: JsonRpcSigner, address: string) {
    this.userAddress = address;
    this.client = new ThetanutsClient({
      chainId: CHAIN_ID,
      provider: signer.provider as any,
      signer: signer as any,
      keyStorageProvider: typeof window !== 'undefined' ? new LocalStorageProvider() : undefined,
    });
  }

  getClient(): ThetanutsClient {
    return this.client;
  }

  // ─── ECDH Key Management (via SDK rfqKeys module) ───

  async getOrCreateKeyPair() {
    return this.client.rfqKeys.getOrCreateKeyPair();
  }

  async loadKeyPair() {
    return this.client.rfqKeys.loadKeyPair();
  }

  async decryptOffer(encryptedData: string, signingKey: string) {
    return this.client.rfqKeys.decryptOffer(encryptedData, signingKey);
  }

  // ─── Market Data (via SDK api + mmPricing modules) ───

  async getMarketData() {
    return this.client.api.getMarketData();
  }

  async getPricing(underlying: 'ETH' | 'BTC') {
    return this.client.mmPricing.getAllPricing(underlying);
  }

  async getMarketPrices() {
    return this.client.api.getMarketPrices();
  }

  // ─── Loan Operations (via SDK loan module) ───

  async requestLoan(params: {
    assetKey: AssetKey;
    collateralAmount: bigint;
    strike: number;
    expiryTimestamp: number;
    minSettlementAmount: bigint;
    keepOrderOpen: boolean;
  }) {
    const underlying = params.assetKey === 'WETH' ? 'ETH' as const : 'BTC' as const;
    return this.client.loan.requestLoan({
      underlying,
      collateralAmount: params.collateralAmount,
      strike: params.strike,
      expiryTimestamp: params.expiryTimestamp,
      minSettlementAmount: params.minSettlementAmount,
      keepOrderOpen: params.keepOrderOpen,
    });
  }

  async acceptOffer(quotationId: bigint, offerAmount: bigint, nonce: bigint, offeror: string) {
    return this.client.loan.acceptOffer(quotationId, offerAmount, nonce, offeror);
  }

  async cancelLoan(quotationId: bigint) {
    return this.client.loan.cancelLoan(quotationId);
  }

  async lend(quotationId: bigint) {
    return this.client.loan.lend(quotationId);
  }

  // ─── Option Exercise (via SDK loan module) ───

  async exerciseOption(optionAddress: string) {
    return this.client.loan.exerciseOption(optionAddress);
  }

  async swapAndExercise(optionAddress: string, aggregator: string, swapData: string) {
    return this.client.loan.swapAndExercise(optionAddress, aggregator, swapData);
  }

  async doNotExercise(optionAddress: string) {
    return this.client.loan.doNotExercise(optionAddress);
  }

  // ─── Option Queries (via SDK loan module) ───

  async getOptionInfo(optionAddress: string) {
    return this.client.loan.getOptionInfo(optionAddress);
  }

  async isOptionITM(optionAddress: string): Promise<boolean> {
    return this.client.loan.isOptionITM(optionAddress);
  }

  // ─── Loan Query (via SDK loan module) ───

  async getLoanRequest(quotationId: bigint) {
    return this.client.loan.getLoanRequest(quotationId);
  }

  async getLendingOpportunities() {
    return this.client.loan.getLendingOpportunities();
  }

  async getUserLoans() {
    if (!this.userAddress) return [];
    return this.client.loan.getUserLoans(this.userAddress);
  }

  // ─── User Positions (via SDK api module) ───

  async getUserRfqs() {
    if (!this.userAddress) return [];
    return this.client.api.getUserRfqs(this.userAddress);
  }

  async getUserPositions() {
    if (!this.userAddress) return [];
    return this.client.api.getUserPositionsFromIndexer(this.userAddress);
  }

  async getUserHistory() {
    if (!this.userAddress) return [];
    return this.client.api.getUserHistoryFromIndexer(this.userAddress);
  }

  // ─── Token Operations (via SDK erc20 module) ───

  async getBalance(tokenAddress: string, owner?: string): Promise<bigint> {
    const addr = owner || this.userAddress;
    if (!addr) return 0n;
    return this.client.erc20.getBalance(tokenAddress, addr);
  }

  async getAllowance(tokenAddress: string, spender: string): Promise<bigint> {
    if (!this.userAddress) return 0n;
    return this.client.erc20.getAllowance(tokenAddress, this.userAddress, spender);
  }

  async ensureAllowance(tokenAddress: string, spender: string, amount: bigint) {
    return this.client.erc20.ensureAllowance(tokenAddress, spender, amount);
  }

  // ─── Event Queries (via SDK events module) ───

  async getOfferMadeEvents(filters?: { fromBlock?: number; toBlock?: number }) {
    return this.client.events.getOfferMadeEvents(filters);
  }

  async getQuotationSettledEvents(filters?: { fromBlock?: number; toBlock?: number }) {
    return this.client.events.getQuotationSettledEvents(filters);
  }

  async getQuotationCancelledEvents(filters?: { fromBlock?: number; toBlock?: number }) {
    return this.client.events.getQuotationCancelledEvents(filters);
  }

  async getRfqHistory(quotationId: bigint) {
    return this.client.events.getRfqHistory(quotationId);
  }

  // ─── Real-time Subscriptions (via SDK ws module) ───

  subscribeToRfq(quotationId: bigint, callbacks: {
    onOfferMade?: (event: any) => void;
    onSettled?: (event: any) => void;
    onCancelled?: (event: any) => void;
  }) {
    return this.client.ws.subscribeToRfq(quotationId, callbacks);
  }

  subscribeOrders(callback: (update: any) => void) {
    return this.client.ws.subscribeOrders(callback);
  }

  subscribePrices(callback: (update: any) => void, asset?: string) {
    return this.client.ws.subscribePrices(callback, asset);
  }

  subscribeToFactory(callbacks: {
    onQuotationRequested?: (event: any) => void;
    onOfferMade?: (event: any) => void;
    onSettled?: (event: any) => void;
    onCancelled?: (event: any) => void;
  }) {
    return this.client.ws.subscribeToFactory(callbacks);
  }

  // ─── SDK State API (factory data) ───

  async getFactoryRfqs(status?: 'settled' | 'active' | 'cancelled') {
    return this.client.api.getFactoryRfqs(status);
  }

  async getFactoryOffers() {
    return this.client.api.getFactoryOffers();
  }

  async getFactoryOptions() {
    return this.client.api.getFactoryOptions();
  }

  async getProtocolStats() {
    return this.client.api.getStatsFromIndexer();
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

  async getStrikeOptions(
    assetKey: AssetKey,
    minDays: number,
    maxStrikes: number,
    maxApr: number
  ) {
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

  // ─── Loan Calculations (via SDK loan module) ───

  calculateLoan(params: {
    depositAmount: string;
    underlying: 'ETH' | 'BTC';
    strike: number;
    expiryTimestamp: number;
    askPrice: number;
    underlyingPrice: number;
    maxApr?: number;
  }) {
    return this.client.loan.calculateLoan({
      depositAmount: params.depositAmount,
      underlying: params.underlying,
      strike: params.strike,
      expiryTimestamp: params.expiryTimestamp,
      askPrice: params.askPrice,
      underlyingPrice: params.underlyingPrice,
      maxApr: params.maxApr ?? 10,
    });
  }

  // ─── SDK Utilities ───

  get utils() {
    return this.client.utils;
  }

  get chainConfig() {
    return this.client.chainConfig;
  }
}
