# State Management

## Overview

ZendFi uses React Context + `useReducer` for state management with localStorage persistence. No external state library.

## LoanContext (`src/context/LoanContext.tsx`)

### State Shape

```typescript
interface LoanState {
  loans: Map<string, Loan>;              // quotationId → Loan
  activeLoanRequestId: string | null;    // in-progress loan request
  selectedCollateral: 'WETH' | 'CBBTC';
  selectedStrike: number | null;         // human-readable USD
  selectedExpiry: number | null;         // Unix timestamp
  selectedOptionData: {                  // from StrikeModal selection
    askPrice: number;
    underlyingPrice: number;
    expiryLabel: string;                 // e.g. "28MAR25"
  } | null;
  settings: UserSettings;
}
```

### Actions

| Action | Payload | Effect |
|--------|---------|--------|
| `UPSERT_LOAN` | `{ id, data: Partial<Loan> }` | Create or update a loan |
| `REMOVE_LOAN` | `{ id }` | Delete loan, clear activeLoanRequestId if matching |
| `ADD_OFFER` | `{ quotationId, offer: OfferInfo }` | Add/update offer on a loan |
| `SET_LOAN_STATUS` | `{ id, status }` | Update loan status |
| `SET_ACTIVE_REQUEST` | `{ id: string \| null }` | Set/clear active loan request |
| `SET_COLLATERAL` | `{ collateral }` | Change collateral, **clears strike/expiry/optionData** |
| `SET_STRIKE` | `{ strike }` | Set selected strike price |
| `SET_EXPIRY` | `{ expiry }` | Set selected expiry timestamp |
| `SET_OPTION_DATA` | `{ data }` | Store pricing data from strike selection |
| `UPDATE_SETTINGS` | `{ settings: Partial<UserSettings> }` | Merge settings |
| `CLEAR_ALL` | none | Wipe all loans and active request |
| `LOAD_STATE` | `{ state: Partial<LoanState> }` | Hydrate from localStorage |

### Computed Getters

```typescript
getActiveLoans()        // status: 'active' | 'settled' | 'competing'
getHistoryLoans()       // status: 'exercised' | 'declined' | 'expired' | 'cancelled'
getLendingOpportunities(address?)  // status: 'limitOrder', requester !== address
```

### Persistence

- **Loans**: `localStorage['zendfi_state']` — BigInts serialized as strings
- **Settings**: `localStorage['zendfi_settings']` — plain JSON
- Loads on mount via `useEffect`, persists on every state change

### Default Settings

```typescript
{
  minDurationDays: 30,
  maxStrikes: 5,
  sortOrder: 'highestStrike',
  maxApr: 20,
  keepOrderOpen: true,
}
```

## ThetanutsContext (`src/context/ThetanutsContext.tsx`)

Provides a singleton `ThetanutsService` instance.

- **Read provider**: `JsonRpcProvider('https://mainnet.base.org')` with `staticNetwork: true`, `polling: true`, 15s interval
- **Signer**: Attached via `useEffect` watching wagmi's `useWalletClient()`. When wallet connects, derives ethers `BrowserProvider` + `Signer` from wagmi transport
- **Lazy init**: Provider created on first render (not at module scope) to avoid hydration issues

```typescript
const { service } = useThetanuts();
// service.requestLoan(...), service.exerciseOption(...), etc.
```

## ToastProvider (`src/components/ui/Toast.tsx`)

```typescript
const { showToast } = useToast();
showToast('Loan submitted!', 'success');  // auto-dismisses after 5s
showToast('Processing...', 'pending');     // stays until manually dismissed
showToast('Failed', 'error');
```

Types: `'success' | 'error' | 'pending' | 'info'`

## Custom Hooks

### `useBalances()` (`src/hooks/useBalances.ts`)

```typescript
const { collateralBalance, mmLiquidity, refreshBalances } = useBalances();
// collateralBalance: "0.055000" (string)
// mmLiquidity: "1,234,567" (formatted string)
// Polls every 60 seconds
```

### `useContractEvents()` (`src/hooks/useContractEvents.ts`)

Side-effect only hook (no return value). Subscribes to on-chain events **only when `activeLoanRequestId` is set**:

| Event | Source | Handler |
|-------|--------|---------|
| `OfferMade` | OptionFactory | `addOffer()` — adds offer to loan |
| `QuotationSettled` | OptionFactory | `upsertLoan()` — sets status='active', stores optionAddress |
| `QuotationCancelled` | OptionFactory | `setLoanStatus()` — sets 'cancelled' |

Uses a `subscribedRef` to prevent double-subscription.
