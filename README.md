# ZendFi

Liquidation-free crypto lending on Base. Borrow USDC against ETH or BTC with zero liquidation risk, fixed terms, and competitive rates.

Built on [Thetanuts V4 RFQ](https://docs.thetanuts.finance/sdk) infrastructure using physically-settled call options.

## How It Works

1. **Deposit** ETH or BTC as collateral
2. **Market makers compete** to lend you USDC (30-second sealed-bid auction)
3. **Receive USDC** instantly at a fixed rate
4. **At expiry**, choose to repay and reclaim collateral, or walk away

No liquidations. No margin calls. No surprises.

## Loan Lifecycle

### Borrowing (getting USDC)

```
Borrower deposits ETH/BTC collateral
        │
        ▼
LoanCoordinator.requestLoan()
        │
        ▼
OptionFactory creates an RFQ (Request for Quotation)
        │
        ▼
30-second sealed-bid auction begins
Market makers submit encrypted offers
        │
        ├─── MM fills it ──► Borrower calls settleQuotationEarly()
        │                     Borrower gets USDC, loan is active
        │
        └─── No MM fills ──► If keepOrderOpen=true:
                              Quotation becomes a LIMIT ORDER
                              Visible on the Lend tab for anyone to fill
```

### Lending (providing USDC for yield)

Lenders fill limit orders created by borrowers who didn't get a market maker fill.

```
Lender sees unfilled limit order on Lend tab
        │
        ▼
Approves USDC to OptionFactory
        │
        ▼
Calls OptionFactory.settleQuotation(quotationId)
        │
        ▼
Lender's USDC goes to borrower
Lender gets custody of borrower's collateral (as a call option)
```

### At Expiry (European option, 1-hour exercise window)

The borrower has three choices:

| Action | What happens | Who gets what |
|--------|-------------|---------------|
| **Exercise** | Borrower repays USDC at the strike price | Borrower gets collateral back, lender gets USDC |
| **Walk away** | Borrower keeps the USDC, forfeits collateral | Lender keeps the collateral |
| **Swap & Exercise** | DEX swap + exercise in one transaction | Same as exercise but uses a DEX for the USDC |

No auto-exercise. The borrower must manually call `exercise()` within the 1-hour window after expiry. If they do nothing, the lender keeps the collateral.

### Contract Architecture

```
User ──► LoanCoordinator ──► OptionFactory (Thetanuts V4 RFQ)
              │                       │
              │ requestLoan()         │ sealed-bid auction
              │ settleQuotationEarly()│ deploys option proxy (EIP-1167)
              │ cancelLoan()          │
              │                       ▼
              │               PhysicallySettledCallOption (per-loan proxy)
              │                       │
              │                       │ exercise()
              │                       │ doNotExercise()
              │                       │ swapAndExercise()
              ▼
         LoanHandler (custom option type)
```

Each settled loan creates a new EIP-1167 minimal proxy contract that delegates to the PhysicallySettledCallOption implementation. The `optionAddress` stored per-loan is this proxy.

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **next-themes** (dark/light)
- **RainbowKit** + **wagmi** + **viem** (wallet)
- **ethers.js v6** + **Thetanuts SDK** (contracts)
- **React Context** + **localStorage** (state)
- **Base Mainnet** (chain 8453)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, or [http://localhost:3000/app](http://localhost:3000/app) for the borrowing interface.

## Project Structure

```
src/
├── app/            # Next.js routes (landing, app, API)
├── components/     # React components (landing, app, ui)
├── context/        # LoanContext, ThetanutsContext
├── hooks/          # useBalances, useContractEvents
├── services/       # thetanuts.ts, pricing.ts, constants.ts, abis.ts
└── types/          # TypeScript interfaces
```

## Documentation

- [User Guide](docs/user-guide/README.md) — How to borrow, settle, lend
- [Developer Reference](docs/developer/README.md) — Services, state, pricing system
- [Architecture](docs/architecture/overview.md) — Contract system, data flow

## Key Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| LoanCoordinator | `0x6278B8B09Df960599fb19EBa4b79aed0ED6B077b` |
| OptionFactory | `0x1aDcD391CF15Fb699Ed29B1D394F4A64106886e5` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| WETH | `0x4200000000000000000000000000000000000006` |
| cbBTC | `0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf` |

## License

Proprietary
