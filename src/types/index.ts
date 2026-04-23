// ZendFi type definitions

export interface LoanAsset {
  key: string;
  collateral: string;
  decimals: number;
  symbol: string;
  icon: string;
  priceFeed: string;
}

export type LoanStatus =
  | 'requested'
  | 'competing'
  | 'limitOrder'
  | 'settled'
  | 'active'
  | 'exercised'
  | 'declined'
  | 'expired'
  | 'cancelled';

export interface Loan {
  quotationId: bigint;
  requester: string;
  collateralToken: string;
  collateralAmount: bigint;
  settlementToken: string;
  strike: bigint;
  expiryTimestamp: number;
  offerEndTimestamp: number;
  minSettlementAmount: bigint;
  netLoanAmount?: bigint;
  status: LoanStatus;
  optionAddress?: string;
  buyer?: string;
  seller?: string;
  createdAt: number;
  offers: OfferInfo[];
}

export interface OfferInfo {
  offeror: string;
  encryptedAmount: string;
  signingKey: string;
  decryptedAmount?: bigint;
  nonce?: string;
  revealedAmount?: bigint;
  calculatedApr?: number;
}

export interface BorrowParams {
  collateralAsset: string; // 'WETH' | 'CBBTC'
  collateralAmount: string; // human-readable amount
  strike: number; // human-readable strike price
  expiryTimestamp: number;
  maxApr: number;
  keepOrderOpen: boolean;
}

export interface LoanReviewData {
  collateralAsset: string;
  collateralAmount: string;
  collateralSymbol: string;
  receiveAmount: string;
  strike: number;
  expiryDate: string;
  repayAmount: string;
  effectiveApr: string;
  borrowingFee: string;
  optionPremium: string;
  protocolFee: string;
}

export interface UserSettings {
  minDurationDays: number;
  maxStrikes: number;
  sortOrder: 'highestStrike' | 'lowestStrike' | 'nearestExpiry' | 'furthestExpiry';
  maxApr: number;
  keepOrderOpen: boolean;
}

export interface StrikeOption {
  strike: number;
  strikeFormatted: string;
  expiry: number;
  expiryFormatted: string;
  expiryLabel: string;          // "28MAR25"
  underlyingPrice: number;       // current underlying price
  askPrice: number;              // option ask price
  impliedLoanAmount: number;
  effectiveApr: number;
  isPromo: boolean;
}

export interface DeribitOptionData {
  underlying_price: number;
  ask_price: number;
  mark_price: number;
}

export type DeribitPricingMap = Record<string, Record<string, DeribitOptionData>>;

export interface StrikeOptionGroup {
  expiryLabel: string;
  expiryFormatted: string;
  expiryTimestamp: number;
  options: StrikeOption[];
}

export interface LoanCalculation {
  owe: bigint;
  optionCost: bigint;
  capitalCost: bigint;
  protocolFee: bigint;
  totalCosts: bigint;
  finalLoanAmount: bigint;
  effectiveApr: number;
  isPromo: boolean;
  receiveFormatted: string;
  repayFormatted: string;
  optionCostFormatted: string;
  capitalCostFormatted: string;
  protocolFeeFormatted: string;
  aprFormatted: string;
}

export type TabId = 'borrow' | 'loans' | 'history' | 'lend';
