# ZendFi Next.js Migration — Design Spec

## Overview

Rebuild ZendFi as a Next.js application with two sections:
1. **Landing page** (`/`) — marketing site matching the live Railway deployment aesthetic
2. **App interface** (`/app`) — DeFi lending interface matching the v1 `loan.html` functionality

Reference projects:
- Current SDK project: `/Users/eesheng_eth/Desktop/zendfi-with-sdk/` (TypeScript services, types, ABIs)
- Original v1: `/Users/eesheng_eth/Desktop/thetaverse/zendfi_v1/` (full UI, jQuery, ethers v5)
- Live landing: `https://zend-finance-production.up.railway.app/`

## Technology Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Theming | `next-themes` (dark/light toggle, `darkMode: 'class'`) |
| Wallet | RainbowKit + wagmi + viem |
| Contracts | ethers.js v6 (SDK compat) + viem (wagmi native) |
| SDK | `@thetanuts-finance/thetanuts-client` |
| State | React Context + localStorage persistence |
| Modals | `@headlessui/react` |
| Chain | Base Mainnet (8453) |

## Route Structure

```
/                   → Landing page (defaults to light theme)
/app                → Borrow tab (defaults to dark theme)
/app/loans          → Active loans
/app/history        → Loan history
/app/lend           → Lending opportunities
```

Tabs are routes (not client-side state) so they're deep-linkable and browser back/forward works.

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: ThemeProvider, fonts, metadata
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Tailwind base + custom CSS variables
│   ├── app/
│   │   ├── layout.tsx          # App layout: WagmiProvider, RainbowKit, Header, TabNav
│   │   ├── page.tsx            # Borrow tab (SwapInterface)
│   │   ├── loans/page.tsx      # Active loans list
│   │   ├── history/page.tsx    # Loan history list
│   │   └── lend/page.tsx       # Lending opportunities table
├── components/
│   ├── landing/
│   │   ├── Hero.tsx            # Gradient bg, headline, CTA button
│   │   ├── Features.tsx        # 4-card grid (No Liquidations, Fixed Terms, etc.)
│   │   ├── HowItWorks.tsx      # 4 numbered steps
│   │   ├── Comparison.tsx      # Zend vs Traditional DeFi table
│   │   ├── FAQ.tsx             # Accordion with 6 questions
│   │   ├── TrustBar.tsx        # Audited, Non-custodial, Thetanuts V4, 24/7
│   │   ├── CTA.tsx             # "Ready for peace of mind?" section
│   │   ├── Navbar.tsx          # Landing page nav (Zend Finance logo + Launch App)
│   │   └── Footer.tsx          # Logo, docs link, social links, copyright
│   ├── app/
│   │   ├── Header.tsx          # Wallet connect (RainbowKit), theme toggle, settings gear
│   │   ├── TabNav.tsx          # Pill-style tabs: Borrow/Loans/History/Lend (uses pathname)
│   │   ├── SwapInterface.tsx   # Deposit → Receive → Payback → Review button
│   │   ├── DepositPanel.tsx    # Amount input + collateral selector trigger
│   │   ├── ReceivePanel.tsx    # Calculated USDC amount + strike selector trigger
│   │   ├── PaybackPanel.tsx    # Expiry date, repayment amount, effective APR
│   │   ├── LoanProgress.tsx    # 4-step progress animation during MM competition
│   │   ├── OfferCard.tsx       # Individual offer during competition (APR, amount, accept btn)
│   │   ├── LoanCard.tsx        # Active loan card with exercise/decline actions
│   │   ├── HistoryCard.tsx     # Historical loan with status badge
│   │   ├── LendTable.tsx       # Table of lending opportunities with filters
│   │   └── modals/
│   │       ├── ReviewModal.tsx         # Loan review: deposit, receive, fees, confirm
│   │       ├── SettingsModal.tsx       # Duration, strikes, sort, APR slider, toggle
│   │       ├── CollateralModal.tsx     # ETH/BTC selector
│   │       ├── StrikeModal.tsx         # Strike/expiry combinations list
│   │       └── TransactionCompleteModal.tsx  # Success: amounts, lender rankings, share
│   └── ui/
│       ├── Button.tsx          # Primary, secondary, ghost variants
│       ├── Modal.tsx           # Headless UI Dialog wrapper
│       ├── Toast.tsx           # Notification toasts (success/error/pending)
│       ├── ThemeToggle.tsx     # Dark/light switcher
│       └── Badge.tsx           # Status badges (active, settled, expired, etc.)
├── context/
│   ├── LoanContext.tsx         # Loan state: Map<quotationId, Loan>, settings, persistence
│   └── ThetanutsContext.tsx    # SDK client instance, contract references, event subscriptions
├── services/
│   ├── constants.ts            # Contract addresses, asset config, chain config
│   ├── abis.ts                 # Human-readable ethers v6 ABIs
│   ├── thetanuts.ts            # ThetanutsService: SDK wrapper + LoanCoordinator contract calls
│   └── formatting.ts           # formatStrike(), formatUsdc(), calculateEffectiveApr()
├── hooks/
│   ├── useLoanState.ts         # CRUD for loan context + localStorage sync
│   ├── useBalances.ts          # Wallet balances + MM USDC liquidity (polling)
│   ├── useStrikeOptions.ts     # Filter/sort strikes from SDK mmPricing
│   ├── useContractEvents.ts    # Subscribe to LoanCoordinator + OptionFactory events
│   └── useLoanActions.ts       # requestLoan, settleQuotationEarly, cancelLoan, exercise
└── types/
    └── index.ts                # Loan, OfferInfo, UserSettings, StrikeOption, BorrowParams, etc.
```

## Landing Page Sections

Matches the live site at `https://zend-finance-production.up.railway.app/`:

1. **Navbar** — "Zend Finance" left, logo center, "Launch App" button right (links to `/app`)
2. **Hero** — Gradient background (soft blue/purple/peach), Zend logo icon, "Borrow Without Liquidation Risk" headline, subtitle, "Launch App" CTA, "Backed by" logos (Polychain, Deribit, QCP, Jump) with infinite scroll
3. **Features** — "Borrowing, reimagined" heading, 2x2 card grid:
   - No Liquidations (shield icon)
   - Fixed Terms (clock icon)
   - Competitive Rates (chart icon)
   - Options Protection (cube icon)
4. **How It Works** — 4 numbered steps on gray bg:
   - 01: Deposit Collateral
   - 02: Request a Quote
   - 03: Accept & Borrow
   - 04: Repay & Reclaim
   - Footer text: "Built on Thetanuts V4 RFQ"
5. **Comparison** — Table: Zend vs Others across 6 dimensions (Liquidation Risk, Repayment Terms, Rate Certainty, Margin Calls, Price Protection, Custody)
6. **FAQ** — 6 expandable accordion items
7. **Trust Bar** — 4 badges: Audited, Non-custodial, Built on Thetanuts V4, 24/7 Access
8. **CTA** — "Ready for peace of mind?" + "Start Borrowing" button
9. **Footer** — Logo, Docs link, Twitter/Discord icons, copyright

## App Interface

### Layout (`/app/layout.tsx`)

- Max-width container (480px, matching v1)
- Header row: spacer | wallet connect (RainbowKit) | settings gear + theme toggle
- TabNav: pill-style tabs linking to `/app`, `/app/loans`, `/app/history`, `/app/lend`
- Children rendered below tabs

### Borrow Tab (`/app/page.tsx`)

**SwapInterface** (visible when no active loan request):
- **DepositPanel**: "Deposit" label, amount input (default 0.001), collateral selector button (icon + "ETH" + chevron), USD value + wallet balance
- **Arrow down** divider (circular icon)
- **ReceivePanel**: "Receive" label, calculated USDC amount, strike selector button ($ + "USDC" + chevron), USD value
- **Arrow down** divider
- **PaybackPanel** (blue-tinted): Payback date + amount row, Effective APR row
- **Review button** (full-width, accent gradient)

**LoanProgress** (visible during active loan request):
- Progress animation card (loan icon → competition number → check icon)
- 4 progress steps:
  1. "Preparing loan request"
  2. "The competition has started"
  3. "Offers received (X:XX remaining)" — shows OfferCards with accept buttons
  4. "Transaction completed"
- Cancel Request button

### Loans Tab (`/app/loans/page.tsx`)

- List of LoanCard components for loans with status: active, settled, competing
- Each card shows: collateral amount, USDC received, strike, expiry, status badge
- Action buttons based on status:
  - **Competing**: Cancel button
  - **Settled/Active**: Exercise / Don't Exercise buttons (visible in exercise window)

### History Tab (`/app/history/page.tsx`)

- List of HistoryCard components for loans with status: exercised, declined, expired, cancelled
- Each card shows: collateral, USDC, strike, expiry, outcome badge

### Lend Tab (`/app/lend/page.tsx`)

- Filter bar: asset dropdown (All/ETH/BTC), sort dropdown (size/APR), refresh button
- LendTable: columns — Asset, Lend Amount, Receive, APR, Status, Action
- Mobile: cards instead of table rows

## Modals

All modals use `@headlessui/react` Dialog with Tailwind styling.

### ReviewModal
- "You're borrowing" section: deposit amount → arrow → receive amount
- "Details" section: strike price, expiry, repayment, effective APR
- "Fees" section: borrowing fee, option premium, protocol fee, network cost
- "Confirm Loan Request" button

### SettingsModal
- Duration & Expiry: min days input
- Strike Options: max strikes per expiry input
- Display Order: sort dropdown (highest/lowest strike, nearest/furthest expiry)
- APR Configuration: max APR input + range slider
- Order Behavior: keep order open toggle
- Save Settings button
- Troubleshooting: Clear Local Storage button

### CollateralModal
- List of supported tokens (ETH, BTC) with icons
- Click to select, modal closes

### StrikeModal
- List of strike/expiry combinations filtered by settings
- Shows strike price, expiry date, effective APR for each

### TransactionCompleteModal
- Success icon + "Transaction completed!"
- Summary: deposited, received, payback date/amount
- Lender rankings list
- View Loan Details + Share buttons

## State Management

### LoanContext

```typescript
interface AppState {
  loans: Map<string, Loan>;          // quotationId → Loan
  settings: UserSettings;
  activeLoanRequestId: string | null;
  selectedCollateral: 'ETH' | 'BTC';
  selectedStrike: bigint | null;
  selectedExpiry: number | null;
}
```

Persisted to `localStorage['zendfi_state']` (loans, with BigInt serialization) and `localStorage['zendfi_settings']`.

### ThetanutsContext

Holds the SDK client instance (initialized once), provides:
- `getStrikeOptions(asset, settings)` — filtered strikes from mmPricing
- `requestLoan(params)` — calls LoanCoordinator
- `settleQuotationEarly(quotationId, offerIndex)` — accept offer
- `cancelLoan(quotationId)` — cancel request
- `exercise(optionAddress)` / `doNotExercise(optionAddress)` — at expiry
- Event subscriptions (LoanRequested, OfferMade, QuotationSettled, etc.)

## Theming

Using `next-themes` with Tailwind `darkMode: 'class'`:

**Light theme** (landing page default):
- Background: white
- Cards: `#f8fafc` (gray-50)
- Text: `#0f172a` (slate-900)
- Accent: `#22d3ee` (cyan-400, matching live site's blue CTA)

**Dark theme** (app default):
- Background: `#0f111a` (matching v1)
- Cards: `#1e2336`
- Text: `#f8fafc`
- Accent: `#6366f1` (indigo-500, matching v1's accent gradient)

Theme toggle in app header. Landing page defaults to light, app defaults to dark, but user can override either.

## Contract Integration

### What the SDK handles
- `client.rfqKeys` — ECDH keypair generation, offer decryption
- `client.mmPricing` — Market maker pricing for strikes/expiries
- `client.api` — Indexer queries (getUserRfqs, getUserPositions, getMarketData)
- `client.ws` — WebSocket subscriptions
- `client.chainConfig` — Contract addresses, tokens, price feeds
- `client.erc20` — Token balance/allowance/approve

### Direct contract calls (via ethers v6)
- `LoanCoordinator.requestLoan()` — submit loan request
- `LoanCoordinator.settleQuotationEarly()` — accept offer early
- `LoanCoordinator.cancelLoan()` — cancel request
- `PhysicallySettledCallOption.exercise()` — exercise at expiry
- `PhysicallySettledCallOption.doNotExercise()` — walk away
- Event listeners on LoanCoordinator and OptionFactory

### Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| LoanCoordinator | `0x6278B8B09Df960599fb19EBa4b79aed0ED6B077b` |
| LoanHandler | `0x6e0019bF9a44B60d57435a032Cb86b716629C08E` |
| OptionFactory | `0x1aDcD391CF15Fb699Ed29B1D394F4A64106886e5` |
| PhysicalCallOption | `0x72fc2920137E42473935D511B4AD29Efa34164C8` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| WETH | `0x4200000000000000000000000000000000000006` |
| cbBTC | `0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf` |

## Dependencies

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "@thetanuts-finance/thetanuts-client": "latest",
    "ethers": "^6.13.0",
    "@rainbow-me/rainbowkit": "^2",
    "wagmi": "^2",
    "viem": "^2",
    "@tanstack/react-query": "^5",
    "next-themes": "^0.3",
    "@headlessui/react": "^2"
  },
  "devDependencies": {
    "typescript": "^5.5",
    "tailwindcss": "^3.4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "@types/react": "^18",
    "@types/react-dom": "^18"
  }
}
```

## Out of Scope (for now)

- Swap & Exercise flow (needs DEX aggregator)
- Chatbot/AI assistant
- WebSocket real-time offer decryption
- Promo configuration
- Historic event loading from indexer
- Lending tab full implementation (UI scaffold only)
