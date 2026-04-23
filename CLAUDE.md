# CLAUDE.md - ZendFi with Thetanuts SDK

Claude Code guidance for this project.

## What This Is

ZendFi rebuilt as a Next.js app on top of the `@thetanuts-finance/thetanuts-client` SDK. Non-liquidatable crypto lending on Base (chain 8453) using physically-settled call options via Thetanuts V4 RFQ.

Original codebase: `/Users/eesheng_eth/Desktop/thetaverse/zendfi_v1/` (vanilla JS, no build step, ethers v5, jQuery).
Live reference: `https://zend-finance-production.up.railway.app/` (landing page design reference).

## Technology Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** with `next-themes` for dark/light toggle
- **RainbowKit + wagmi + viem** for wallet connection
- **ethers.js v6** for SDK compatibility and contract calls
- **@thetanuts-finance/thetanuts-client** SDK for RFQ, pricing, keys, positions
- **React Context** for state management with localStorage persistence
- **@headlessui/react** for accessible modals and accordions

## Commands

```bash
npm run dev      # Next.js dev server on http://localhost:3000
npm run build    # Next.js production build
npm start        # Start production server
```

## Routes

```
/                   → Landing page (light theme default)
/app                → Borrow tab (dark theme default)
/app/loans          → Active loans
/app/history        → Loan history
/app/lend           → Lending opportunities
```

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: ThemeProvider, fonts, metadata
│   ├── page.tsx                # Landing page (composes all landing sections)
│   ├── globals.css             # Tailwind base + CSS variables
│   ├── providers.tsx           # WagmiProvider, QueryClient, RainbowKitProvider
│   └── app/
│       ├── layout.tsx          # App layout: providers, Header, TabNav
│       ├── page.tsx            # Borrow tab (SwapInterface + modals)
│       ├── loans/page.tsx      # Active loans list
│       ├── history/page.tsx    # Loan history list
│       └── lend/page.tsx       # Lending opportunities table
├── components/
│   ├── landing/                # Navbar, Hero, Features, HowItWorks, Comparison, FAQ, TrustBar, CTA, Footer
│   ├── app/
│   │   ├── Header.tsx          # Wallet connect (RainbowKit), theme toggle, settings gear
│   │   ├── TabNav.tsx          # Pill-style tabs using pathname
│   │   ├── SwapInterface.tsx   # Deposit → Receive → Payback → Review button
│   │   ├── DepositPanel.tsx    # Amount input + collateral selector
│   │   ├── ReceivePanel.tsx    # USDC receive amount + strike selector
│   │   ├── PaybackPanel.tsx    # Expiry, repayment, APR
│   │   ├── LoanCard.tsx        # Active loan with exercise/decline actions
│   │   ├── HistoryCard.tsx     # Historical loan with status badge
│   │   ├── LendTable.tsx       # Lending opportunities table
│   │   └── modals/             # ReviewModal, SettingsModal, CollateralModal, StrikeModal
│   └── ui/                     # Modal, Button, Badge, ThemeToggle
├── context/
│   ├── LoanContext.tsx         # Loan state: useReducer + localStorage persistence
│   └── ThetanutsContext.tsx    # SDK client instance, auto-attaches wagmi signer
├── services/
│   ├── constants.ts            # Contract addresses, asset config, chain config
│   ├── abis.ts                 # Human-readable ethers v6 ABIs
│   ├── thetanuts.ts            # ThetanutsService: SDK wrapper + LoanCoordinator calls
│   └── formatting.ts           # formatStrike, formatUsdc, calculateEffectiveApr, formatDate
├── hooks/                      # (reserved for future custom hooks)
└── types/
    └── index.ts                # Loan, OfferInfo, UserSettings, StrikeOption, etc.
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

- **LoanCoordinator** (`0x6278...077b`): Manages loan requests, holds collateral, orchestrates the RFQ flow.
- **LoanHandler** (`0x6e00...c08E`): Custom option type registered with OptionFactory.
- **OptionFactory** (`0x1aDc...86e5`): Thetanuts V4 core - runs the sealed-bid auction.
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

- `fs` and `crypto` warnings during build are expected. The SDK has Node.js key storage code that Next.js externalizes for browser via `next.config.js` webpack fallbacks.
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
- Lending tab full implementation (UI scaffold only, needs fill-order logic)
- LoanProgress component (4-step animation during MM competition)
- TransactionCompleteModal
- Historic event loading from indexer for existing loans
- WebSocket real-time offer decryption during competition phase
- Promo configuration (launch promo with waived option premium)
- Chatbot integration (original had Groq-powered AI assistant)
