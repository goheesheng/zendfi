# SDK Loan Module — Exercise Functions Plan

## Discovery

The `@thetanuts-finance/thetanuts-client` SDK (0.1.7-beta.0) ships with a `LoanModule` at
`src/modules/loan.ts` that already implements the physical option exercise functions.
However, this module was **not included in the published npm build** — the `client.loan`
property is `undefined` at runtime even though it exists in the source.

### What already exists in the SDK source

**File:** `src/modules/loan.ts` (1,088 lines)

The `LoanModule` provides a complete ZendFi lending lifecycle:

#### Write Operations (require signer)
| Method | Description |
|--------|-------------|
| `requestLoan(params)` | Deposit collateral, create RFQ via LoanCoordinator |
| `acceptOffer(quotationId, offerAmount, nonce, offeror)` | Early-settle via LoanCoordinator |
| `cancelLoan(quotationId)` | Cancel a pending loan via LoanCoordinator |
| `exerciseOption(optionAddress)` | Repay USDC at expiry, reclaim collateral |
| `doNotExercise(optionAddress)` | Walk away, forfeit collateral |
| `swapAndExercise(optionAddress, aggregator, swapData)` | DEX swap + exercise in one tx |
| `lend(quotationId)` | Fill a limit order as lender (approve + settleQuotation) |

#### Read Operations
| Method | Description |
|--------|-------------|
| `getOptionInfo(optionAddress)` | Full option details (buyer, seller, collateral, strikes, TWAP, exercise window) |
| `isOptionITM(optionAddress)` | Check if option is in-the-money via TWAP |
| `getLoanRequest(quotationId)` | Read loan state from LoanCoordinator |
| `getUserLoans(address)` | Fetch user's loans from ZendFi indexer |
| `getLendingOpportunities()` | Fetch available limit orders from indexer |

#### Pricing & Calculation
| Method | Description |
|--------|-------------|
| `fetchPricing()` | Fetch Deribit pricing via proxy |
| `getStrikeOptions(underlying, settings)` | Filtered strike options grouped by expiry |
| `calculateLoan(params)` | Full loan cost breakdown (option premium, capital cost, protocol fee, APR) |
| `isPromoOption(...)` | Check promotional eligibility |

#### Encode Methods (for viem/wagmi integration)
| Method | Description |
|--------|-------------|
| `encodeRequestLoan(params)` | Returns `{ to, data }` for requestLoan |
| `encodeAcceptOffer(...)` | Returns `{ to, data }` for settleQuotationEarly |
| `encodeCancelLoan(quotationId)` | Returns `{ to, data }` for cancelLoan |

### Supporting files

| File | What it contains |
|------|-----------------|
| `src/abis/loan.ts` | `LOAN_COORDINATOR_ABI`, `LOAN_OPTION_ABI` (with exercise/doNotExercise/swapAndExercise), `LOAN_WETH_ABI` |
| `src/chains/loan.ts` | `LOAN_CONFIG` — LoanCoordinator address, asset configs (WETH, cbBTC), price feeds, promo settings |
| `src/types/loan.ts` | All type definitions: `LoanOptionInfo`, `LoanCalculation`, `LoanStrikeOption`, etc. |
| `src/client/ThetanutsClient.ts:142` | `public readonly loan: LoanModule` — already wired up |
| `src/client/ThetanutsClient.ts:199` | `this.loan = new LoanModule(this)` — already initialized |
| `src/index.ts:82` | `export { LoanModule } from './modules/loan.js'` — already exported |

### Why it wasn't in the published build

The published 0.1.7-beta.0 on npm was built from an earlier commit that predated the
loan module being wired into the client. The source has all the code, the build config
includes it, but the published artifact on npm is stale.

## What was done

### 1. Rebuilt the SDK from source

```bash
cd /Users/eesheng_eth/Desktop/thetanuts-sdk
npm run build    # tsup builds CJS + ESM + types
```

This produces `dist/index.js` (416KB) which now includes the `LoanModule`.

### 2. Linked ZendFi to the local SDK build

```json
// package.json
"@thetanuts-finance/thetanuts-client": "file:/Users/eesheng_eth/Desktop/thetanuts-sdk"
```

### 3. Updated ZendFi service to use SDK loan module

**Before** (raw ethers Contract calls):
```typescript
async exerciseOption(optionAddress: string) {
    const option = new Contract(optionAddress, PHY_OPTION_ABI, this.signer);
    const tx = await option.exercise();
    return tx.wait();
}
```

**After** (SDK loan module):
```typescript
async exerciseOption(optionAddress: string) {
    return this.client.loan.exerciseOption(optionAddress);
}
```

All exercise/query methods now delegate to `client.loan`:
- `exerciseOption()` -> `client.loan.exerciseOption()`
- `doNotExercise()` -> `client.loan.doNotExercise()`
- `swapAndExercise()` -> `client.loan.swapAndExercise()`
- `getOptionInfo()` -> `client.loan.getOptionInfo()`
- `isOptionITM()` -> `client.loan.isOptionITM()`

### 4. Removed unused imports

- Removed `PHY_OPTION_ABI` import from thetanuts.ts (SDK handles it)
- Removed `STRIKE_DECIMALS` import (SDK handles decimal conversion)
- Removed unused `ERC20_ABI`, `Contract`, `JsonRpcProvider`, `BrowserProvider`, `useWalletClient` from LendTable.tsx

## Contract Architecture

```
User's wallet
    │
    ├─ requestLoan() ──────> LoanCoordinator (0x6278...077b)
    │                              │
    │                              ├─ requestForQuotation() ──> OptionFactory (0x1aDc...86e5)
    │                              │                                 │
    │                              │                                 │  (on settle)
    │                              │                                 ▼
    │                              │                            Deploys EIP-1167 proxy
    │                              │                                 │
    │                              │                                 │  delegatecall
    │                              │                                 ▼
    │                              │                   PHYSICAL_CALL implementation
    │                              │                   (0x07032ffb...eC006Be7c)
    │                              │
    ├─ acceptOffer() ──────> LoanCoordinator.settleQuotationEarly()
    │
    ├─ cancelLoan() ───────> LoanCoordinator.cancelLoan()
    │
    ├─ exerciseOption() ───> Option proxy (per-loan address)
    │                              │  exercise()
    │                              │  → Borrower repays USDC, gets collateral back
    │
    ├─ doNotExercise() ────> Option proxy (per-loan address)
    │                              │  doNotExercise()
    │                              │  → Borrower forfeits collateral, keeps USDC
    │
    └─ swapAndExercise() ──> Option proxy (per-loan address)
                                   │  swapAndExercise(aggregator, swapData)
                                   │  → DEX swap then exercise in one tx
```

Each settled loan creates a **new proxy contract** (EIP-1167 minimal clone) that delegates
to the PHYSICAL_CALL implementation. The `optionAddress` stored per-loan is this proxy.

## Exercise Flow Detail

1. Option expires at `expiryTimestamp`
2. 1-hour `EXERCISE_WINDOW` opens (3600 seconds)
3. The SDK's `exerciseOption()`:
   - Validates the address
   - Estimates gas, adds 20% buffer
   - Calls `exercise()` on the proxy
   - Waits for receipt
   - Returns `TransactionReceipt`
4. If borrower does nothing within the window, collateral goes to the lender

**No auto-exercise.** The borrower must manually call `exercise()` within the window.

## To publish the SDK with loan module

When ready to publish a new version:

```bash
cd /Users/eesheng_eth/Desktop/thetanuts-sdk

# Bump version
npm version 0.1.7-beta.1

# Build
npm run build

# Publish
npm publish --tag beta
```

Then update ZendFi:
```json
"@thetanuts-finance/thetanuts-client": "0.1.7-beta.1"
```
