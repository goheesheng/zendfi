# Pricing System

## Data Source

Strike options and pricing come from the Thetanuts pricing API:

```
https://pricing.thetanuts.finance/all
```

This returns Deribit-style option data for all available instruments.

**CORS**: The API blocks browser requests. We proxy via a Next.js API route:

```
Browser → /api/pricing (src/app/api/pricing/route.ts) → pricing.thetanuts.finance/all
```

The API route caches responses for 30 seconds server-side (`next: { revalidate: 30 }`).

## Response Format

```typescript
type DeribitPricingMap = Record<string, Record<string, DeribitOptionData>>;
// Outer key: "ETH" | "BTC"
// Inner key: Deribit instrument name, e.g. "ETH-28MAR25-3000-P"

interface DeribitOptionData {
  underlying_price: number;  // current ETH/BTC price in USD
  ask_price: number;         // option premium in units of underlying (e.g. 0.05 ETH)
  mark_price: number;        // mid-market price
}
```

### Deribit Key Format

```
{ASSET}-{EXPIRY}-{STRIKE}-{TYPE}
ETH-28MAR25-3000-P

ASSET:  "ETH" or "BTC"
EXPIRY: day + 3-letter month + 2-digit year (28MAR25 = March 28, 2025)
STRIKE: integer USD price
TYPE:   "P" (put) or "C" (call) — we only use puts
```

Expiry timestamp: 08:00 UTC on the expiry date.

## Filtering Pipeline (`getFilteredStrikeOptions`)

```
All options from API
    ↓ Only put options (key ends in "-P")
    ↓ Min duration filter (expiryTimestamp - now > minDurationDays * 86400)
    ↓ ITM only (strike < underlyingPrice)
    ↓ Valid market data (mark_price > 0)
    ↓ Positive receive amount (receivePerUnit > 0)
    ↓ Group by expiry label
    ↓ Sort within group (lowest strikes first), limit to maxStrikes
    ↓ Re-sort for display per settings.sortOrder
    ↓ Sort groups by expiry (nearest or furthest)
    → StrikeOptionGroup[]
```

**Important**: `maxApr` does NOT filter strikes. It controls the borrowing interest rate used in the cost calculation. All qualifying ITM options are shown.

## Loan Calculation (`calculateLoanParams`)

All arithmetic uses BigInt (ethers v6) to avoid floating-point errors.

### Formula

```
OWE = depositAmount * strike / 10^(decimals + STRIKE_DECIMALS - 6)
     (amount due at expiry, in USDC with 6 decimals)

Option Cost = askPrice * underlyingPrice * depositAmount / 10^decimals
     (cost of the embedded put option, in USDC)

Capital Cost = OWE * (borrowingRate / 100) * durationInYears
     (borrowing interest, minimum 0.01 USDC)

Protocol Fee = OWE * 4 / 10000
     (4 basis points)

Total Costs = Option Cost + Capital Cost + Protocol Fee

Final Loan Amount = OWE - Total Costs
     (what the borrower actually receives)

Effective APR = (Total Costs / Final Loan Amount) * (31536000 / durationInSeconds) * 100
```

### Promo Detection

Options qualify for promo when ALL conditions are met:
- `PROMO_CONFIG.enabled === true`
- Days to expiry > 90
- LTV < 50% (strike / underlyingPrice < 0.5)
- Estimated loan amount < $250,000

Promo benefits:
- Option premium waived ($0)
- Borrowing rate: 5.68% (instead of user's maxApr)
- Result: ~6% effective APR

### Promo Circularity

The promo check needs the estimated loan amount, but the loan amount depends on whether it's promo. Resolved by:

1. First estimate under promo conditions (0 option cost, 5.68% rate)
2. Check if estimated amount < $250k
3. If eligible, apply promo rates for real calculation

## Caching

Two layers:
- **Server-side**: API route caches for 30s via `next: { revalidate: 30 }`
- **Client-side**: `ThetanutsService.pricingCache` with 30s TTL (in-memory)

Total: pricing data is at most ~60 seconds stale.

## Important: Do NOT use SDK mmPricing

The Thetanuts SDK's `client.mmPricing.getAllPricing()` returns a different response shape that lacks the `price` field our code expects. Always use the direct API via `fetchDeribitPricing()`.
