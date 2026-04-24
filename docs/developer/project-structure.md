# Project Structure

## Root

```
zendfi-with-sdk/
├── src/                   # Application source
├── public/                # Static assets
├── docs/                  # Developer documentation (this directory)
├── dist/                  # Build output (gitignored)
├── next.config.js         # Next.js config
├── tailwind.config.ts     # Tailwind CSS config
├── tsconfig.json          # TypeScript config (strict mode)
├── postcss.config.js      # PostCSS config
└── package.json
```

## `src/`

```
src/
├── app/                   # Next.js App Router
│   ├── layout.tsx         # Root layout: fonts (Inter, EB Garamond), ThemeProvider
│   ├── page.tsx           # Landing page (/ route)
│   ├── providers.tsx      # Wagmi + RainbowKit + React Query providers
│   ├── globals.css        # Global styles
│   └── api/
│       └── pricing/
│           └── route.ts   # GET /api/pricing — proxies pricing.thetanuts.finance/all
│
├── app/                   # Next.js sub-route (/app)
│   └── page.tsx           # Main borrowing app
│
├── components/
│   ├── app/               # App components (require wallet connection)
│   │   ├── DepositPanel.tsx      # Collateral input, submit loan request
│   │   ├── Header.tsx            # Wallet connect button, balance display
│   │   ├── HistoryCard.tsx       # Closed loan display
│   │   ├── LendTable.tsx         # Limit orders available for lenders
│   │   ├── LoanCard.tsx          # Active loan display with exercise controls
│   │   ├── LoanProgress.tsx      # RFQ competition progress indicator
│   │   ├── PaybackPanel.tsx      # Repayment flow
│   │   ├── ReceivePanel.tsx      # Loan receipt confirmation
│   │   ├── SwapInterface.tsx     # Swap & exercise flow (stub)
│   │   ├── TabNav.tsx            # Borrow / Loans / History / Lend tabs
│   │   └── modals/
│   │       ├── CollateralModal.tsx  # Asset selection (ETH / BTC)
│   │       ├── ReviewModal.tsx      # Loan terms review before submit
│   │       ├── SettingsModal.tsx    # User preferences (APR cap, duration, etc.)
│   │       └── StrikeModal.tsx      # Strike + expiry selection grid
│   │
│   ├── landing/           # Marketing page components (no wallet required)
│   │   ├── Hero.tsx
│   │   ├── CTA.tsx
│   │   ├── Comparison.tsx
│   │   ├── FAQ.tsx
│   │   ├── Features.tsx
│   │   ├── Footer.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Navbar.tsx
│   │   ├── ScrollReveal.tsx
│   │   └── TrustBar.tsx
│   │
│   └── ui/                # Shared primitives
│       ├── Badge.tsx
│       ├── Modal.tsx
│       ├── ThemeToggle.tsx
│       └── Toast.tsx
│
├── context/
│   ├── LoanContext.tsx       # useReducer state for loans, selections, settings
│   └── ThetanutsContext.tsx  # Singleton ThetanutsService, signer from wagmi
│
├── hooks/
│   ├── useBalances.ts        # Polls collateral balance + MM liquidity (60s)
│   └── useContractEvents.ts  # Subscribes to OptionFactory events while a loan is active
│
├── services/
│   ├── thetanuts.ts    # ThetanutsService class — all blockchain interactions
│   ├── pricing.ts      # Deribit pricing fetch, filtering, loan calculation
│   ├── constants.ts    # Chain ID, addresses, PROMO_CONFIG, PROTOCOL_FEE_BPS
│   ├── abis.ts         # Human-readable ABIs for ZendFi contracts
│   └── formatting.ts   # formatStrike, formatUsdc, calculateEffectiveApr, etc.
│
└── types/
    └── index.ts        # All TypeScript interfaces (Loan, StrikeOption, UserSettings, etc.)
```

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | 14+ | App Router, API routes, SSR |
| `ethers` | v6 | Contract interactions (NOT v5) |
| `wagmi` | v2 | React wallet hooks |
| `@rainbow-me/rainbowkit` | v2 | Wallet connect UI |
| `@thetanuts-finance/thetanuts-client` | latest | RFQ keys, indexer API, WebSocket |
| `@tanstack/react-query` | v5 | Required by wagmi |
| `next-themes` | latest | Dark/light theme |
| `tailwindcss` | v3 | Utility CSS |
