# CLAUDE.md - ZendFi with Thetanuts SDK

Claude Code guidance for this project.

## What This Is

ZendFi rebuilt as a Next.js app on top of the `@thetanuts-finance/thetanuts-client` SDK. Non-liquidatable crypto lending on Base (chain 8453) using physically-settled call options via Thetanuts V4 RFQ.

Original codebase: `/Users/eesheng_eth/Desktop/thetaverse/zendfi_v1/` (vanilla JS, no build step, ethers v5, jQuery).
Live reference: `https://zend-finance-production.up.railway.app/` (landing page design reference).
Knowledge base: `/Users/eesheng_eth/Desktop/thetaverse/zendfi_v1/zend.md` (519-line product knowledge base).

## Technology Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** with `next-themes` for dark/light toggle
- **RainbowKit + wagmi + viem** for wallet connection
- **ethers.js v6** for SDK compatibility and contract calls
- **@thetanuts-finance/thetanuts-client** SDK for RFQ, keys, positions
- **React Context** for state management with localStorage persistence
- **@headlessui/react** for accessible modals and accordions
- **EB Garamond** (serif) for headings, **Inter** (sans) for body — via `next/font/google`

## Commands

```bash
npm run dev      # Next.js dev server on http://localhost:3000
npm run build    # Next.js production build
npm start        # Start production server
```

## Routes

```
/                   -> Landing page (light theme default)
/app                -> Borrow tab (dark theme default)
/app/loans          -> Active loans
/app/history        -> Loan history
/app/lend           -> Lending opportunities
/api/pricing        -> CORS proxy for pricing.thetanuts.finance/all
```

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: ThemeProvider, fonts, metadata
│   ├── page.tsx                # Landing page (composes all landing sections)
│   ├── globals.css             # Tailwind base + CSS variables + keyframes
│   ├── providers.tsx           # WagmiProvider, QueryClient, RainbowKitProvider
│   ├── api/pricing/route.ts    # CORS proxy for pricing API
│   └── app/
│       ├── layout.tsx          # App layout: providers, Header, TabNav, ToastProvider
│       ├── page.tsx            # Borrow tab (SwapInterface + modals)
│       ├── loans/page.tsx      # Active loans list
│       ├── history/page.tsx    # Loan history list
│       └── lend/page.tsx       # Lending opportunities table
├── components/
│   ├── landing/                # Navbar, Hero, Features, HowItWorks, Comparison, FAQ, TrustBar, CTA, Footer, ScrollReveal
│   ├── app/
│   │   ├── Header.tsx          # Wallet connect (RainbowKit), theme toggle, settings gear
│   │   ├── TabNav.tsx          # Pill-style tabs using pathname
│   │   ├── SwapInterface.tsx   # Deposit -> Receive -> Payback -> Review button
│   │   ├── DepositPanel.tsx    # Amount input + collateral selector + MAX button
│   │   ├── ReceivePanel.tsx    # USDC receive amount + strike selector
│   │   ├── PaybackPanel.tsx    # Expiry, repayment, APR
│   │   ├── LoanProgress.tsx    # 4-step progress during MM competition
│   │   ├── LoanCard.tsx        # Active loan with exercise/decline actions
│   │   ├── HistoryCard.tsx     # Historical loan with status badge
│   │   ├── LendTable.tsx       # Lending opportunities table with APR calc
│   │   └── modals/             # ReviewModal, SettingsModal, CollateralModal, StrikeModal
│   └── ui/                     # Modal, Toast, Badge, ThemeToggle
├── context/
│   ├── LoanContext.tsx         # Loan state: useReducer + localStorage persistence
│   └── ThetanutsContext.tsx    # SDK client instance, auto-attaches wagmi signer
├── hooks/
│   ├── useBalances.ts          # Wallet + MM USDC balance polling (60s interval)
│   └── useContractEvents.ts    # On-chain event subscriptions during active loan
├── services/
│   ├── constants.ts            # Contract addresses, asset config, promo config
│   ├── abis.ts                 # Human-readable ethers v6 ABIs
│   ├── thetanuts.ts            # ThetanutsService: SDK wrapper + LoanCoordinator calls
│   ├── pricing.ts              # Deribit pricing API fetch, strike filtering, loan cost calculation
│   └── formatting.ts           # formatStrike, formatUsdc, calculateEffectiveApr, formatDate
└── types/
    └── index.ts                # Loan, OfferInfo, UserSettings, StrikeOption, LoanCalculation, etc.
```

## Pricing API

- Strike options come from `https://pricing.thetanuts.finance/all` (Deribit-style data)
- **CORS:** This API blocks browser requests. Must proxy via `src/app/api/pricing/route.ts`
- Do NOT use `client.mmPricing.getAllPricing()` — the SDK response lacks required fields
- Options are put options only (keys ending `-P`), filtered: ITM (strike < underlyingPrice), min duration, valid mark_price
- `maxApr` setting controls borrowing interest rate only, NOT a filter on total effective APR
- Effective APR = interest + option premium + protocol fee (annualized)

## Architecture: Two-Layer Contract System

```
User  -->  LoanCoordinator  -->  OptionFactory (Thetanuts V4)
               |                        |
               | requestLoan()          | requestForQuotation()
               | settleQuotationEarly() | sealed-bid auction
               | cancelLoan()           | deploys option proxy
               |                        |
               v                        v
         LoanHandler            PhysicallySettledCallOption
         (custom option type)   (exercise / doNotExercise / swapAndExercise)
```

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
| Default MM | `0xf1711ba7e74435032aa103ef20a4cbece40b6df5` |

## Gotchas

- **CORS:** Pricing API blocks browser requests. Use `/api/pricing` proxy.
- **RPC filters:** Base RPC drops `eth_newFilter`. Use `staticNetwork: true` + `polling: true` on JsonRpcProvider. Only subscribe during active loan requests.
- **Hydration:** Don't create `JsonRpcProvider` at module scope — lazy-init inside component.
- **LoanCoordinator events:** Contract does NOT emit events. Listen on OptionFactory for `OfferMade`, `QuotationSettled`, `QuotationCancelled`.
- **Fonts:** Use `next/font/google`, not `@import`.
- **No Co-Authored-By:** Do not add co-author lines to git commits.
- **Ankr RPC:** `https://rpc.ankr.com/base/5e9458e4bf5a4f8893ad36e5422b9e2289cf89f4b5142312bd9b65ea1162234b` for higher rate limits.

## Decimal Conventions

- **Strikes**: 8 decimals (Chainlink). `strike / 1e8` for display.
- **USDC**: 6 decimals. `amount / 1e6` for display.
- **WETH**: 18 decimals. **cbBTC**: 8 decimals.

## Loan Lifecycle

1. **Borrow**: User deposits ETH/BTC collateral via `LoanCoordinator.requestLoan()`
2. **Competition**: Market makers submit encrypted offers (30s window)
3. **Settlement**: User accepts an offer via `settleQuotationEarly()`
4. **Active**: Loan is live — borrower has USDC, lender holds a call option
5. **At Expiry** (European, 1-hour window): Exercise / Swap & Exercise / Walk Away

## Documentation

- `docs/user-guide/` — User-facing guides (borrowing, settlement, lending, FAQ, risks)
- `docs/developer/` — Developer reference (services, state management, pricing, gotchas)
- `docs/architecture/` — Architecture overview and contract reference

## Incomplete / TODO

- Swap & Exercise flow (needs KyberSwap or similar DEX aggregator)
- Lending tab fill-order logic (UI exists, backend stub)
- TransactionCompleteModal
- Historic event loading from indexer
- WebSocket real-time offer decryption
- USDC pre-approval flow before exercise window
- Chatbot integration
