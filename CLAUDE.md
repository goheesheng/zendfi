# CLAUDE.md - ZendFi with Thetanuts SDK

Claude Code guidance for this project.

## What This Is

ZendFi rebuilt on top of the `@thetanuts-finance/thetanuts-client` SDK. Non-liquidatable crypto lending on Base (chain 8453) using physically-settled call options via Thetanuts V4 RFQ.

Original codebase: `/Users/eesheng_eth/Desktop/thetaverse/zendfi_v1/` (vanilla JS, no build step, ethers v5, jQuery).
Live reference: `https://zend-finance-production.up.railway.app/` (Next.js landing page, app at `/loan.html` in v1 only).

## Technology Stack

- **TypeScript** (strict mode)
- **ethers.js v6** (not v5 - the API is different)
- **@thetanuts-finance/thetanuts-client** SDK for RFQ, pricing, keys, positions
- **Vite** for dev server and bundling
- **No framework** - vanilla TS with DOM API

## Commands

```bash
npm run dev      # Vite dev server on http://localhost:3000
npm run build    # tsc + vite build -> dist/
npm run preview  # Preview production build
```

## Directory Structure

```
src/
├── main.ts                  # App entry: wires UI events to service + state
├── types/index.ts           # All TypeScript interfaces and types
├── styles/main.css          # Full stylesheet (dark theme, CSS variables)
└── services/
    ├── constants.ts         # Chain ID, contract addresses, asset config
    ├── abis.ts              # Human-readable ABIs for ZendFi custom contracts
    ├── wallet.ts            # WalletService: MetaMask connect, Base chain switch
    ├── thetanuts.ts         # ThetanutsService: wraps SDK + LoanCoordinator
    └── state.ts             # StateManager: loan tracking, localStorage persistence
```

## Architecture: Two-Layer Contract System

ZendFi wraps Thetanuts V4 with two custom contracts:

```
User  ──►  LoanCoordinator  ──►  OptionFactory (Thetanuts V4)
               │                        │
               │ requestLoan()          │ requestForQuotation()
               │ settleQuotationEarly() │ sealed-bid auction
               │ cancelLoan()           │ deploys option proxy
               │                        │
               ▼                        ▼
         LoanHandler            PhysicallySettledCallOption
         (custom option type)   (exercise / doNotExercise / swapAndExercise)
```

- **LoanCoordinator** (`0x6278...077b`): Manages loan requests, holds collateral, orchestrates the RFQ flow. This is the contract users interact with for borrowing.
- **LoanHandler** (`0x6e00...c08E`): Custom option type registered with OptionFactory. Created at settlement to bridge collateral into the final call option.
- **OptionFactory** (`0x1aDc...86e5`): Thetanuts V4 core - runs the sealed-bid auction, deploys option contracts.
- **PhysicallySettledCallOption** (`0x72fc...87D`): The actual option contract borrowers exercise at expiry.

## What the SDK Handles vs What We Handle Directly

**SDK (`client.*`):**
- `rfqKeys` - ECDH keypair generation, storage, offer decryption
- `mmPricing` - Market maker pricing for strikes/expiries
- `api` - Indexer queries (getUserRfqs, getUserPositions, getMarketData)
- `ws` - WebSocket subscriptions for real-time order/price updates
- `chainConfig` - Contract addresses, token configs, price feeds
- `erc20` - Token balance/allowance/approve helpers

**Direct contract calls (not via SDK):**
- `LoanCoordinator.requestLoan()` - ZendFi-specific, not a standard RFQ
- `LoanCoordinator.settleQuotationEarly()` - Early settlement through coordinator
- `LoanCoordinator.cancelLoan()` - Cancel through coordinator
- `PhysicallySettledCallOption.exercise()` - Exercise at expiry
- `PhysicallySettledCallOption.swapAndExercise()` - Swap collateral to USDC and exercise
- `PhysicallySettledCallOption.doNotExercise()` - Walk away, lender keeps collateral
- Event listeners on both LoanCoordinator and OptionFactory

## Key Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| LoanCoordinator | `0x6278B8B09Df960599fb19EBa4b79aed0ED6B077b` |
| LoanHandler | `0x6e0019bF9a44B60d57435a032Cb86b716629C08E` |
| OptionFactory | `0x1aDcD391CF15Fb699Ed29B1D394F4A64106886e5` |
| PhysicalCallOption | `0x72fc2920137E42473935D511B4AD29Efa34164C8` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| WETH | `0x4200000000000000000000000000000000000006` |
| cbBTC | `0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf` |
| ETH/USD Feed | `0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70` |
| BTC/USD Feed | `0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F` |
| Default MM | `0xf1711ba7e74435032aa103ef20a4cbece40b6df5` |

## Decimal Conventions

- **Strikes**: 8 decimals (Chainlink convention). `strike / 1e8` for display.
- **USDC**: 6 decimals. `amount / 1e6` for display.
- **WETH**: 18 decimals.
- **cbBTC**: 8 decimals.
- **Effective APR**: `((repay/receive - 1) * 8760) / hoursToExpiry * 100`

## Loan Lifecycle

1. **Borrow**: User deposits ETH/BTC collateral via `LoanCoordinator.requestLoan()`
2. **Competition**: Market makers submit encrypted offers (30s window by default)
3. **Settlement**: User accepts an offer via `settleQuotationEarly()`, or it auto-settles after reveal
4. **Active**: Loan is live - borrower has USDC, lender holds a physically-settled call option
5. **At Expiry** (European, 1-hour exercise window):
   - **Exercise**: Pay USDC strike price, get collateral back
   - **Swap & Exercise**: Sell portion of collateral to cover USDC, get remainder back
   - **Walk Away**: Keep USDC, lender keeps collateral

## State Persistence

- `localStorage['zendfi_state']` - Loan data (BigInts serialized as strings)
- `localStorage['zendfi_settings']` - User preferences (APR cap, duration filter, etc.)
- SDK stores ECDH keys in `localStorage` (browser) or `.thetanuts-keys/` (Node)

## Build Notes

- `fs/promises` and `crypto` warnings during Vite build are expected. The SDK has Node.js key storage code that Vite externalizes for browser. The SDK falls back to localStorage in-browser.
- Bundle is ~500KB (SDK + ethers). Consider code splitting if this grows.
- ABIs use ethers v6 human-readable format (not JSON ABI arrays).

## SDK Reference

Docs: https://docs.thetanuts.finance/sdk

Key SDK modules used:
- `client.rfqKeys.getOrCreateKeyPair()` / `decryptOffer()`
- `client.mmPricing.getAllPricing('ETH' | 'BTC')`
- `client.api.getUserRfqs()` / `getUserPositionsFromIndexer()`
- `client.api.getMarketData()`
- `client.ws.subscribeOrders()` / `subscribePrices()`
- `client.chainConfig.contracts` / `tokens` / `priceFeeds`

## Incomplete / TODO

- Swap & Exercise flow (needs KyberSwap or similar DEX aggregator integration)
- Lending tab (fill limit orders as a lender)
- Historic event loading from indexer for existing loans
- WebSocket real-time offer decryption during competition phase
- Promo configuration (launch promo with waived option premium)
- Chatbot integration (original had Groq-powered AI assistant)
