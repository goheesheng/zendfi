# Known Gotchas

Issues discovered during development that will save you time.

## CORS: Pricing API

**Problem**: `https://pricing.thetanuts.finance/all` blocks browser requests (CORS).

**Solution**: Proxy via Next.js API route at `src/app/api/pricing/route.ts`. The `fetchDeribitPricing()` function in `pricing.ts` automatically uses `/api/pricing` in the browser and the direct URL server-side.

**Symptom**: `GET https://pricing.thetanuts.finance/all net::ERR_FAILED 200 (OK)` in console.

## RPC Event Filters

**Problem**: Base public RPC drops `eth_newFilter` subscriptions after ~5 minutes, causing `filter not found` errors in the console.

**Solution**: 
- Use `staticNetwork: true` and `polling: true` on `JsonRpcProvider`
- Only subscribe to events when there's an active loan request (not globally)
- The `useContractEvents` hook checks `activeLoanRequestId` before subscribing

**Symptom**: `@TODO Error: could not coalesce error (error={ "code": -32000, "message": "filter not found" })`

## Hydration Warning

**Problem**: Creating `JsonRpcProvider` at module scope triggers state updates during wagmi's `Hydrate` render phase.

**Solution**: Lazy-init the provider inside the component using a module-level singleton pattern with a getter function.

**Symptom**: `Warning: Cannot update a component (ThetanutsProvider) while rendering a different component (Hydrate)`

## LoanCoordinator Events

**Problem**: The LoanCoordinator contract (`0x6278...077b`) does NOT emit its own events on-chain. Listening on it returns nothing.

**Solution**: Listen to events on the **OptionFactory** (`0x1aDc...86e5`) instead. Events like `OfferMade`, `QuotationSettled`, and `QuotationCancelled` are emitted there.

## SDK mmPricing

**Problem**: `client.mmPricing.getAllPricing('ETH')` returns a response where the expected `price` field doesn't exist. All options get filtered out.

**Solution**: Use the direct pricing API (`fetchDeribitPricing()`) instead. This returns Deribit-style data with `underlying_price`, `ask_price`, and `mark_price`.

## maxApr Setting

**Problem**: The `maxApr` user setting (default 20%) was incorrectly used to filter which strikes to show. This filtered out most options since the **effective APR** (which includes option premium) is typically higher than the borrowing APR.

**Solution**: `maxApr` controls the **borrowing interest rate** (capital cost component) only. It is NOT a filter on total effective APR. All ITM options with positive receive amounts are shown.

## BigInt Serialization

**Problem**: `JSON.stringify()` cannot serialize `BigInt` values. Loans contain BigInt fields (`quotationId`, `collateralAmount`, `strike`, etc.).

**Solution**: Convert BigInts to strings before storing in localStorage, parse back on load. See `serializeLoans()` / `deserializeLoans()` in `LoanContext.tsx`.

## Ankr RPC

The default Base RPC (`https://mainnet.base.org`) has low rate limits. For development with frequent RPC calls, use the Ankr RPC:

```
https://rpc.ankr.com/base/5e9458e4bf5a4f8893ad36e5422b9e2289cf89f4b5142312bd9b65ea1162234b
```

## Font Loading

Use `next/font/google` for fonts (Inter, EB Garamond), not CSS `@import`. Next.js optimizes font loading and eliminates layout shift.

## Git Commits

Do not add `Co-Authored-By` lines to commit messages in this project.
