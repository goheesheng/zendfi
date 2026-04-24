// ZendFi constants - contract addresses and configuration

export const CHAIN_ID = 8453; // Base Mainnet

// ZendFi custom contracts (wrapper layer on top of Thetanuts V4)
export const LOAN_COORDINATOR_ADDRESS = '0x6278B8B09Df960599fb19EBa4b79aed0ED6B077b';
export const LOAN_HANDLER_ADDRESS = '0x6e0019bF9a44B60d57435a032Cb86b716629C08E';

// Thetanuts V4 core contracts (provided by SDK's chainConfig)
export const OPTION_FACTORY_ADDRESS = '0x1aDcD391CF15Fb699Ed29B1D394F4A64106886e5';
export const PHYSICALLY_SETTLED_CALL_OPTION_ADDRESS = '0x72fc2920137E42473935D511B4AD29Efa34164C8';

// Tokens on Base
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
export const CBBTC_ADDRESS = '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf';

// Price feeds (Chainlink)
export const ETH_CHAINLINK_ADDRESS = '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70';
export const BTC_CHAINLINK_ADDRESS = '0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F';

// Other
export const STRIKE_DECIMALS = 8;
export const HOURS_PER_YEAR = 8760;
export const DEFAULT_MARKET_MAKER = '0xf1711ba7e74435032aa103ef20a4cbece40b6df5';
export const DEFAULT_OFFER_DURATION_SECONDS = 30;

// Loan assets configuration
export const LOAN_ASSETS = {
  WETH: {
    key: 'WETH',
    collateral: WETH_ADDRESS,
    decimals: 18,
    symbol: 'ETH',
    icon: '\u27e0', // ⟠
    priceFeed: ETH_CHAINLINK_ADDRESS,
  },
  CBBTC: {
    key: 'CBBTC',
    collateral: CBBTC_ADDRESS,
    decimals: 8,
    symbol: 'BTC',
    icon: '\u20bf', // ₿
    priceFeed: BTC_CHAINLINK_ADDRESS,
  },
} as const;

export type AssetKey = keyof typeof LOAN_ASSETS;

export const PRICING_API_URL = 'https://pricing.thetanuts.finance/all';
export const LOAN_INDEXER_URL = 'https://zendfi-loan-indexer-v1.devops-118.workers.dev';

export const PROMO_CONFIG = {
  enabled: true,
  minDaysToExpiry: 90,
  maxLtvPercent: 50,
  optionPremiumWaived: true,
  promoBorrowingFeePercent: 5.68,
  maxPerPersonUsd: 250000,
  maxTotalUsd: 2000000,
} as const;

export const PROTOCOL_FEE_BPS = 4;
