# Service Layer Reference

All business logic lives in `src/services/`. Components do not call contracts or APIs directly.

---

## ThetanutsService (`src/services/thetanuts.ts`)

Singleton class instantiated in `ThetanutsContext`. Wraps both the Thetanuts SDK and direct ethers.js contract calls.

### Constructor

```ts
new ThetanutsService(provider: JsonRpcProvider)
```

Creates a read-only instance. Provider should use `staticNetwork: true` and `polling: true` to avoid Base RPC filter issues.

### Signer Attachment

```ts
service.setSigner(signer: JsonRpcSigner, address: string): void
```

Must be called after wallet connection. Enables write operations. Called by `ThetanutsContext` when wagmi's `useWalletClient` resolves.

### Key Pair Management

| Method | Returns | Description |
|---|---|---|
| `getOrCreateKeyPair()` | `Promise<KeyPair>` | ECDH keypair for encrypting/decrypting offers. Stored in localStorage. |
| `loadKeyPair()` | `Promise<KeyPair \| null>` | Load existing keypair without creating. |
| `decryptOffer(encryptedData, signingKey)` | `Promise<DecryptedOffer>` | Decrypt an offer received from a market maker. |

### Loan Operations

| Method | Returns | Description |
|---|---|---|
| `requestLoan(params)` | `Promise<{ tx, receipt, keyPair }>` | Approves collateral + calls `LoanCoordinator.requestLoan()`. |
| `acceptOffer(quotationId, offerAmount, nonce, offeror)` | `Promise<TransactionReceipt>` | Calls `LoanCoordinator.settleQuotationEarly()`. |
| `cancelLoan(quotationId)` | `Promise<TransactionReceipt>` | Calls `LoanCoordinator.cancelLoan()`. |

**`requestLoan` params:**

```ts
{
  assetKey: AssetKey;           // 'WETH' | 'CBBTC'
  collateralAmount: bigint;     // in token decimals
  strike: bigint;               // 8 decimals
  expiryTimestamp: number;      // Unix seconds
  minSettlementAmount: bigint;  // USDC (6 decimals)
  keepOrderOpen: boolean;       // convertToLimitOrder flag
}
```

### Option Exercise

| Method | Returns | Description |
|---|---|---|
| `exerciseOption(optionAddress)` | `Promise<TransactionReceipt>` | Calls `exercise()` on the option contract. |
| `swapAndExercise(optionAddress, aggregator, swapData)` | `Promise<TransactionReceipt>` | Calls `swapAndExercise()` with DEX aggregator calldata. |
| `doNotExercise(optionAddress)` | `Promise<TransactionReceipt>` | Calls `doNotExercise()` — borrower walks away. |

### Option Queries

| Method | Returns | Description |
|---|---|---|
| `getOptionInfo(optionAddress)` | `Promise<OptionInfo>` | Fetches all option state in parallel (buyer, seller, strikes, TWAP, etc.). |
| `isOptionITM(optionAddress)` | `Promise<boolean>` | Gets TWAP and calls `isITM(twap)`. |
| `getLoanRequest(quotationId)` | `Promise<LoanRequest>` | Reads `LoanCoordinator.loanRequests()`. |

### Token Operations

| Method | Returns | Description |
|---|---|---|
| `getBalance(tokenAddress, owner?)` | `Promise<bigint>` | ERC20 `balanceOf`. Uses connected wallet if `owner` omitted. |
| `getAllowance(tokenAddress, spender)` | `Promise<bigint>` | ERC20 `allowance` for connected wallet. |
| `ensureAllowance(tokenAddress, spender, amount)` | `Promise<void>` | Approves only if current allowance is insufficient. |

### User Positions (via SDK Indexer)

| Method | Returns | Description |
|---|---|---|
| `getUserRfqs()` | `Promise<RfqData[]>` | Calls `client.api.getUserRfqs(address)`. |
| `getUserPositions()` | `Promise<PositionData[]>` | Calls `client.api.getUserPositionsFromIndexer(address)`. |

### Pricing Helpers

| Method | Returns | Description |
|---|---|---|
| `fetchPricing()` | `Promise<DeribitPricingMap>` | Fetches with 30s in-memory cache. Delegates to `pricing.ts`. |
| `getGroupedStrikeOptions(assetKey, settings)` | `Promise<StrikeOptionGroup[]>` | Filtered options grouped by expiry. |
| `getStrikeOptions(assetKey, minDays, maxStrikes, maxApr)` | `Promise<StrikeOption[]>` | Flat array variant of the above. |

### Event Subscriptions

All return an unsubscribe function `() => void`.

| Method | Event Source | Description |
|---|---|---|
| `onLoanRequested(cb)` | LoanCoordinator | Fires when a new loan request is submitted. |
| `onOfferMade(cb)` | OptionFactory | Fires when a market maker submits an encrypted offer. |
| `onQuotationSettled(cb)` | OptionFactory | Fires when auction settles — includes `optionAddress`. |
| `onQuotationCancelled(cb)` | OptionFactory | Fires when a quotation is cancelled. |

### WebSocket (via SDK)

```ts
service.subscribeOrders(callback): Promise<Unsubscribe>
service.subscribePrices(callback, asset?): Promise<Unsubscribe>
```

---

## pricing.ts (`src/services/pricing.ts`)

Pure functions — no side effects except the fetch. All filtering and calculation logic lives here.

### `fetchDeribitPricing(): Promise<DeribitPricingMap>`

Fetches `https://pricing.thetanuts.finance/all` via the `/api/pricing` proxy (in browser) or directly (server-side). Returns `data.data` from the response.

### `parseExpiryTimestamp(expiryStr: string): number`

Converts a Deribit expiry string (e.g. `"28MAR25"`) to a Unix timestamp. Deribit options expire at **08:00 UTC**.

### `formatExpiryDate(expiryStr: string): string`

Returns a human-readable date string like `"Fri, March 28, 2025"`.

### `parseDeribitKey(key: string): { asset, expiry, strike, type } | null`

Parses a Deribit key like `"ETH-28MAR25-3000-P"` into its components.

### `isPromoOption(strike, underlyingPrice, expiryTimestamp, loanAmountUsd?): boolean`

Returns `true` when all promo conditions are met:
- `PROMO_CONFIG.enabled` is `true`
- Days to expiry > `PROMO_CONFIG.minDaysToExpiry` (90)
- LTV < `PROMO_CONFIG.maxLtvPercent` (50%)
- `loanAmountUsd` <= `PROMO_CONFIG.maxPerPersonUsd` ($250k) if provided

### `getFilteredStrikeOptions(pricingData, assetKey, settings): StrikeOptionGroup[]`

Main filtering pipeline. Returns options grouped by expiry.

**Filters applied (in order):**
1. Put options only (`key.endsWith('-P')`)
2. Minimum duration (`expiryTimestamp - now >= settings.minDurationDays * 86400`)
3. ITM only (`parsed.strike < underlyingPrice`)
4. Valid market data (`optData.mark_price > 0`)
5. Positive implied loan amount after costs

**Sorting:** Within each group, strikes are sorted lowest-first, limited to `settings.maxStrikes`, then re-sorted per `settings.sortOrder`. Groups are sorted by expiry.

### `calculateLoanParams(params): LoanCalculation | null`

Full loan calculation with BigInt arithmetic. Returns `null` if deposit is zero or loan amount would be negative.

**Formula:**

```
depositBN  = parseUnits(depositAmount, asset.decimals)
strikeBN   = parseUnits(strike, 8)  // 8 = STRIKE_DECIMALS

OWE = (depositBN * strikeBN) / 10^(asset.decimals + STRIKE_DECIMALS - 6)
    // Result is in USDC (6 decimals)

optionCost  = (askPrice * underlyingPrice) * depositAmount / 10^asset.decimals
              // 0 if promo and optionPremiumWaived = true

capitalCost = OWE * APR * durationInYears
              // APR = maxApr for normal, promoBorrowingFeePercent for promo
              // minimum 10000 (0.01 USDC)

protocolFee = OWE * PROTOCOL_FEE_BPS / 10000
              // PROTOCOL_FEE_BPS = 4 (0.04%)

finalLoanAmount = OWE - optionCost - capitalCost - protocolFee

effectiveApr = (totalCosts / finalLoanAmount) * (31536000 / durationInSeconds) * 100
```

---

## formatting.ts (`src/services/formatting.ts`)

Pure display utilities with no external dependencies.

| Function | Signature | Description |
|---|---|---|
| `formatStrike` | `(strike: bigint) → string` | Converts 8-decimal bigint to `"$3,000.00"` |
| `formatUsdc` | `(amount: bigint) → string` | Converts 6-decimal bigint to `"1234.56"` |
| `calculateEffectiveApr` | `(receive: bigint, repay: bigint, hoursToExpiry: number) → number` | `((repay/receive - 1) * 8760) / hoursToExpiry * 100` |
| `formatAddress` | `(address: string) → string` | Truncates to `"0x1234...5678"` |
| `formatDate` | `(timestamp: number) → string` | Unix seconds → `"January 1, 2025"` |

---

## constants.ts (`src/services/constants.ts`)

| Export | Value | Description |
|---|---|---|
| `CHAIN_ID` | `8453` | Base Mainnet |
| `LOAN_COORDINATOR_ADDRESS` | `0x6278...077b` | ZendFi entry-point contract |
| `LOAN_HANDLER_ADDRESS` | `0x6e00...C08E` | Custom option type |
| `OPTION_FACTORY_ADDRESS` | `0x1aDc...86e5` | Thetanuts V4 core |
| `PHYSICALLY_SETTLED_CALL_OPTION_ADDRESS` | `0x72fc...4C8` | Option implementation |
| `USDC_ADDRESS` | `0x8335...2913` | USDC on Base |
| `WETH_ADDRESS` | `0x4200...0006` | WETH on Base |
| `CBBTC_ADDRESS` | `0xcbB7...3Bf` | cbBTC on Base |
| `ETH_CHAINLINK_ADDRESS` | `0x7104...Bb70` | ETH/USD price feed |
| `BTC_CHAINLINK_ADDRESS` | `0x64c9...D848F` | BTC/USD price feed |
| `STRIKE_DECIMALS` | `8` | Chainlink convention |
| `HOURS_PER_YEAR` | `8760` | Used in APR calculations |
| `DEFAULT_MARKET_MAKER` | `0xf171...6df5` | MM whose USDC liquidity is displayed |
| `DEFAULT_OFFER_DURATION_SECONDS` | `30` | RFQ auction window |
| `PRICING_API_URL` | `https://pricing.thetanuts.finance/all` | Direct URL (server-side only) |
| `PROTOCOL_FEE_BPS` | `4` | 0.04% protocol fee |
| `LOAN_ASSETS` | see below | Per-asset configuration |

### `LOAN_ASSETS`

```ts
{
  WETH: {
    key: 'WETH',
    collateral: WETH_ADDRESS,
    decimals: 18,
    symbol: 'ETH',
    icon: '⟠',
    priceFeed: ETH_CHAINLINK_ADDRESS,
  },
  CBBTC: {
    key: 'CBBTC',
    collateral: CBBTC_ADDRESS,
    decimals: 8,
    symbol: 'BTC',
    icon: '₿',
    priceFeed: BTC_CHAINLINK_ADDRESS,
  },
}
```

### `PROMO_CONFIG`

Controls the launch promo that waives the option premium for deep ITM, long-duration loans.

```ts
{
  enabled: true,
  minDaysToExpiry: 90,        // Loan must be > 90 days
  maxLtvPercent: 50,          // Strike must be < 50% of spot price
  optionPremiumWaived: true,  // Option cost set to 0
  promoBorrowingFeePercent: 5.68,  // Annual interest rate during promo
  maxPerPersonUsd: 250000,    // Per-user cap ($250k)
  maxTotalUsd: 2000000,       // Total program cap ($2M) — enforced off-chain
}
```

To disable the promo, set `enabled: false`. All other logic remains unchanged.
