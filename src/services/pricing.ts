import { ethers } from 'ethers';
import {
  PRICING_API_URL, PROMO_CONFIG, PROTOCOL_FEE_BPS,
  LOAN_ASSETS, STRIKE_DECIMALS, HOURS_PER_YEAR,
  type AssetKey,
} from './constants';
import type {
  DeribitPricingMap, StrikeOption, StrikeOptionGroup,
  LoanCalculation, UserSettings,
} from '../types';

// ─── Fetch ───

export async function fetchDeribitPricing(): Promise<DeribitPricingMap> {
  // Use local API proxy to avoid CORS issues with the external pricing API
  const url = typeof window !== 'undefined' ? '/api/pricing' : PRICING_API_URL;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pricing API error: ${response.status}`);
  const data = await response.json();
  if (!data || !data.data) throw new Error('Invalid pricing data format');
  return data.data;
}

// ─── Parsing ───

const MONTH_MAP: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

export function parseExpiryTimestamp(expiryStr: string): number {
  const day = parseInt(expiryStr.slice(0, -5));
  const month = expiryStr.slice(-5, -2);
  const year = '20' + expiryStr.slice(-2);
  const date = new Date(Date.UTC(parseInt(year), MONTH_MAP[month], day, 8, 0, 0));
  return Math.floor(date.getTime() / 1000);
}

export function formatExpiryDate(expiryStr: string): string {
  const day = parseInt(expiryStr.slice(0, -5));
  const month = expiryStr.slice(-5, -2);
  const year = '20' + expiryStr.slice(-2);
  const date = new Date(Date.UTC(parseInt(year), MONTH_MAP[month], day, 8, 0, 0));
  return date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export function parseDeribitKey(key: string): { asset: string; expiry: string; strike: number; type: string } | null {
  const parts = key.split('-');
  if (parts.length !== 4) return null;
  return { asset: parts[0], expiry: parts[1], strike: parseInt(parts[2]), type: parts[3] };
}

// ─── Promo ───

export function isPromoOption(
  strike: number, underlyingPrice: number,
  expiryTimestamp: number, loanAmountUsd: number = 0
): boolean {
  if (!PROMO_CONFIG.enabled) return false;
  const now = Math.floor(Date.now() / 1000);
  const daysToExpiry = (expiryTimestamp - now) / 86400;
  const ltvPercent = (strike / underlyingPrice) * 100;
  if (daysToExpiry <= PROMO_CONFIG.minDaysToExpiry || ltvPercent >= PROMO_CONFIG.maxLtvPercent) return false;
  if (loanAmountUsd > 0 && loanAmountUsd > PROMO_CONFIG.maxPerPersonUsd) return false;
  return true;
}

// ─── Filtering ───

export function getFilteredStrikeOptions(
  pricingData: DeribitPricingMap,
  assetKey: AssetKey,
  settings: UserSettings
): StrikeOptionGroup[] {
  const lookupKey = assetKey === 'WETH' ? 'ETH' : 'BTC';
  const assetData = pricingData[lookupKey];
  if (!assetData) return [];

  const now = Math.floor(Date.now() / 1000);
  const minDurationSeconds = settings.minDurationDays * 86400;

  // Extract underlying price from any option
  let underlyingPrice = 0;
  for (const optData of Object.values(assetData)) {
    if (optData?.underlying_price > 0) {
      underlyingPrice = optData.underlying_price;
      break;
    }
  }
  if (underlyingPrice === 0) return [];

  // Collect valid options grouped by expiry
  const groups = new Map<string, { expiryTimestamp: number; options: StrikeOption[] }>();

  for (const [key, optData] of Object.entries(assetData)) {
    if (!key.endsWith('-P')) continue; // Only put options
    const parsed = parseDeribitKey(key);
    if (!parsed) continue;

    const expiryTimestamp = parseExpiryTimestamp(parsed.expiry);

    // Filter: minimum duration
    if (expiryTimestamp - now < minDurationSeconds) continue;

    // Filter: ITM only (strike < underlying price)
    if (parsed.strike >= underlyingPrice) continue;

    // Filter: valid market data
    if (!optData || optData.mark_price <= 0) continue;

    const hoursToExpiry = (expiryTimestamp - now) / 3600;
    const promo = isPromoOption(parsed.strike, underlyingPrice, expiryTimestamp);

    // Calculate rough APR for display (full calculation happens when user selects)
    const askPriceUsdc = (optData.ask_price || 0) * underlyingPrice;
    const owePerUnit = parsed.strike; // in USDC per unit of collateral
    const optionCostPerUnit = promo && PROMO_CONFIG.optionPremiumWaived ? 0 : askPriceUsdc;
    const apr = promo ? PROMO_CONFIG.promoBorrowingFeePercent : settings.maxApr;
    const durationYears = (expiryTimestamp - now) / (365.25 * 86400);
    const capitalCostPerUnit = owePerUnit * (apr / 100) * durationYears;
    const protocolFeePerUnit = owePerUnit * PROTOCOL_FEE_BPS / 10000;
    const totalCostsPerUnit = optionCostPerUnit + capitalCostPerUnit + protocolFeePerUnit;
    const receivePerUnit = owePerUnit - totalCostsPerUnit;

    if (receivePerUnit <= 0) continue;

    // Calculate effective APR
    const effectiveApr = (totalCostsPerUnit / receivePerUnit) * (31536000 / (expiryTimestamp - now)) * 100;

    if (!promo && effectiveApr > settings.maxApr) continue;

    const option: StrikeOption = {
      strike: parsed.strike,
      strikeFormatted: '$' + parsed.strike.toLocaleString(),
      expiry: expiryTimestamp,
      expiryFormatted: formatExpiryDate(parsed.expiry),
      expiryLabel: parsed.expiry,
      underlyingPrice,
      askPrice: optData.ask_price,
      impliedLoanAmount: receivePerUnit,
      effectiveApr: Math.round(effectiveApr * 100) / 100,
      isPromo: promo,
    };

    if (!groups.has(parsed.expiry)) {
      groups.set(parsed.expiry, { expiryTimestamp, options: [] });
    }
    groups.get(parsed.expiry)!.options.push(option);
  }

  // Sort within each group and limit
  const result: StrikeOptionGroup[] = [];
  for (const [label, group] of groups) {
    let opts = group.options;

    // Sort strikes lowest first, take maxStrikes
    opts.sort((a, b) => a.strike - b.strike);
    opts = opts.slice(0, settings.maxStrikes);

    // Re-sort for display
    if (settings.sortOrder === 'highestStrike') {
      opts.sort((a, b) => b.strike - a.strike);
    }

    result.push({
      expiryLabel: label,
      expiryFormatted: formatExpiryDate(label),
      expiryTimestamp: group.expiryTimestamp,
      options: opts,
    });
  }

  // Sort groups by expiry
  if (settings.sortOrder === 'furthestExpiry') {
    result.sort((a, b) => b.expiryTimestamp - a.expiryTimestamp);
  } else {
    result.sort((a, b) => a.expiryTimestamp - b.expiryTimestamp);
  }

  return result;
}

// ─── Loan Calculation ───

export function calculateLoanParams(params: {
  depositAmount: string;
  assetKey: AssetKey;
  strike: number;
  expiryTimestamp: number;
  expiryLabel: string;
  askPrice: number;
  underlyingPrice: number;
  maxApr: number;
}): LoanCalculation | null {
  const { depositAmount, assetKey, strike, expiryTimestamp, expiryLabel, askPrice, underlyingPrice, maxApr } = params;

  const asset = LOAN_ASSETS[assetKey];
  const deposit = parseFloat(depositAmount);
  if (!deposit || deposit <= 0 || !strike || !expiryTimestamp) return null;

  // Parse deposit to BigInt with proper decimals
  const depositBN = ethers.parseUnits(depositAmount, asset.decimals);
  const strikeBN = ethers.parseUnits(strike.toString(), STRIKE_DECIMALS);

  // OWE = depositAmount * strike / 10^(decimals + STRIKE_DECIMALS - 6)
  const owe = (depositBN * strikeBN) / (10n ** BigInt(asset.decimals + STRIKE_DECIMALS - 6));

  const now = Math.floor(Date.now() / 1000);
  const durationInSeconds = expiryTimestamp - now;
  const durationInYears = durationInSeconds / (365.25 * 86400);

  // Option cost: askPrice * underlyingPrice * depositAmount / 10^decimals
  let optionCost = 0n;
  if (askPrice > 0 && underlyingPrice > 0) {
    const askPriceInUsdc = askPrice * underlyingPrice;
    const askPriceBN = ethers.parseUnits(askPriceInUsdc.toFixed(6), 6);
    optionCost = (askPriceBN * depositBN) / (10n ** BigInt(asset.decimals));
  }

  // Check promo eligibility
  // First estimate under promo conditions to check $250k limit
  const promoCapitalCost = (owe * BigInt(Math.floor(PROMO_CONFIG.promoBorrowingFeePercent / 100 * durationInYears * 1e6))) / 1000000n;
  const promoProtocolFee = (owe * BigInt(PROTOCOL_FEE_BPS)) / 10000n;
  const estimatedBorrowed = owe - promoCapitalCost - promoProtocolFee;
  const estimatedBorrowedUsd = parseFloat(ethers.formatUnits(estimatedBorrowed, 6));
  const isPromo = underlyingPrice > 0 && isPromoOption(strike, underlyingPrice, expiryTimestamp, estimatedBorrowedUsd);

  // Apply promo
  if (isPromo && PROMO_CONFIG.optionPremiumWaived) {
    optionCost = 0n;
  }

  // Capital cost
  const loanCostAPR = isPromo ? PROMO_CONFIG.promoBorrowingFeePercent / 100 : maxApr / 100;
  let capitalCost = (owe * BigInt(Math.floor(loanCostAPR * durationInYears * 1e6))) / 1000000n;
  if (capitalCost < 10000n) capitalCost = 10000n; // min 0.01 USDC

  // Protocol fee (4 bps)
  const protocolFee = (owe * BigInt(PROTOCOL_FEE_BPS)) / 10000n;

  // Final
  const totalCosts = optionCost + capitalCost + protocolFee;
  const finalLoanAmount = owe - totalCosts;

  if (finalLoanAmount <= 0n) return null;

  // Effective APR
  const effectiveApr = (Number(totalCosts) / Number(finalLoanAmount)) * (31536000 / durationInSeconds) * 100;

  return {
    owe,
    optionCost,
    capitalCost,
    protocolFee,
    totalCosts,
    finalLoanAmount,
    effectiveApr,
    isPromo,
    receiveFormatted: parseFloat(ethers.formatUnits(finalLoanAmount, 6)).toFixed(2),
    repayFormatted: parseFloat(ethers.formatUnits(owe, 6)).toFixed(2),
    optionCostFormatted: parseFloat(ethers.formatUnits(optionCost, 6)).toFixed(4),
    capitalCostFormatted: parseFloat(ethers.formatUnits(capitalCost, 6)).toFixed(4),
    protocolFeeFormatted: parseFloat(ethers.formatUnits(protocolFee, 6)).toFixed(4),
    aprFormatted: effectiveApr.toFixed(2),
  };
}
