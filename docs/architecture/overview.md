# Architecture Overview

## Two-Layer Contract System

ZendFi wraps Thetanuts V4 with two custom contracts. Users interact only with `LoanCoordinator`; the Thetanuts `OptionFactory` handles the sealed-bid RFQ auction internally.

```
User  ──►  LoanCoordinator  ──►  OptionFactory (Thetanuts V4)
               │                        │
               │ requestLoan()          │ requestForQuotation()
               │ settleQuotationEarly() │ sealed-bid auction (30s)
               │ cancelLoan()           │ deploys option proxy
               │                        │
               ▼                        ▼
         LoanHandler            PhysicallySettledCallOption
         (custom option type)   (exercise / doNotExercise / swapAndExercise)
```

- **LoanCoordinator** — ZendFi custom contract. Receives collateral, builds the RFQ request, holds funds during the auction, and coordinates settlement.
- **LoanHandler** — Custom option type registered with OptionFactory. Instantiated at settlement to bridge collateral into the final call option contract.
- **OptionFactory** — Thetanuts V4 core. Runs the sealed-bid auction, deploys `PhysicallySettledCallOption` instances.
- **PhysicallySettledCallOption** — The live option contract. Borrower calls `exercise()`, `swapAndExercise()`, or `doNotExercise()` at expiry.

## Contract Addresses (Base Mainnet)

| Contract | Address |
|---|---|
| LoanCoordinator | `0x6278B8B09Df960599fb19EBa4b79aed0ED6B077b` |
| LoanHandler | `0x6e0019bF9a44B60d57435a032Cb86b716629C08E` |
| OptionFactory | `0x1aDcD391CF15Fb699Ed29B1D394F4A64106886e5` |
| PhysicallySettledCallOption | `0x72fc2920137E42473935D511B4AD29Efa34164C8` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| WETH | `0x4200000000000000000000000000000000000006` |
| cbBTC | `0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf` |
| ETH/USD Feed (Chainlink) | `0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70` |
| BTC/USD Feed (Chainlink) | `0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F` |
| Default Market Maker | `0xf1711ba7e74435032aa103ef20a4cbece40b6df5` |

## What the SDK Handles vs Direct Contract Calls

### Handled by `@thetanuts-finance/thetanuts-client`

| Module | Responsibility |
|---|---|
| `client.rfqKeys` | ECDH keypair generation, localStorage storage, offer decryption |
| `client.api` | Indexer queries: `getUserRfqs`, `getUserPositionsFromIndexer`, `getMarketData` |
| `client.ws` | WebSocket subscriptions: `subscribeOrders`, `subscribePrices` |
| `client.chainConfig` | Contract addresses, token configs, price feed addresses |
| `client.mmPricing` | Market maker pricing (note: do NOT use — see [Gotchas](../developer/gotchas.md)) |

### Direct Contract Calls (not via SDK)

| Call | Contract | Reason |
|---|---|---|
| `requestLoan()` | LoanCoordinator | ZendFi-specific, not a standard RFQ |
| `settleQuotationEarly()` | LoanCoordinator | ZendFi wrapper for early settlement |
| `cancelLoan()` | LoanCoordinator | ZendFi wrapper |
| `exercise()` | PhysicallySettledCallOption | Called by borrower at expiry |
| `swapAndExercise()` | PhysicallySettledCallOption | Sells portion of collateral via DEX aggregator |
| `doNotExercise()` | PhysicallySettledCallOption | Borrower walks away, lender keeps collateral |
| Event listeners | OptionFactory | LoanCoordinator does NOT emit its own events |

## Data Flow

```
Pricing API (thetanuts.finance)
        │
        │  proxied via /api/pricing (Next.js route)
        ▼
  pricing.ts
  ├── fetchDeribitPricing()     — fetches + parses raw data
  ├── getFilteredStrikeOptions() — filters: put options, ITM, min duration
  └── calculateLoanParams()     — BigInt arithmetic: OWE, fees, APR
        │
        ▼
  ThetanutsService (thetanuts.ts)
  └── getGroupedStrikeOptions()  — delegates to pricing.ts
        │
        ▼
  ThetanutsContext               — singleton service, signer from wagmi
        │
        ▼
  LoanContext                    — loan state, selections, settings
        │
        ▼
  Components (StrikeModal, ReviewModal, DepositPanel, LoanCard...)
```

## Loan Lifecycle

1. **Borrow** — User deposits ETH/BTC collateral via `LoanCoordinator.requestLoan()`
2. **Competing** — Market makers submit encrypted offers during the 30-second window
3. **Settlement** — User calls `settleQuotationEarly()`, or auto-settles after reveal
4. **Active** — Borrower holds USDC; lender holds a physically-settled call option
5. **At Expiry** (European option, 1-hour exercise window):
   - **Exercise** — Pay USDC strike price, receive collateral back
   - **Swap & Exercise** — Sell portion of collateral to cover USDC, receive remainder
   - **Walk Away** — Keep USDC; lender keeps collateral

See [Smart Contract Reference](./contracts.md) for full ABI details.
