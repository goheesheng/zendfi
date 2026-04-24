# Lending on ZendFi

> **Status**: The Lend tab is currently in development. The interface is visible and browsable, but the ability to fill limit orders on-chain is coming in an upcoming release. This page documents how the lending mechanism works so you can prepare.

---

## How Limit Orders Work

Not every borrowing request is immediately matched by a market maker during the competition window. When a loan request goes unfilled, it converts into a **limit order** — a standing offer that any lender can fill at the borrower's requested terms.

The Lend tab surfaces these unfilled limit orders so that any user holding USDC can step in as a lender.

```
Borrower creates loan request
        │
        ▼
  Competition window (30s)
        │
  No immediate match?
        │
        ▼
  Becomes a limit order ──► Appears in the Lend tab
        │
        ▼
  You (lender) fill it by providing USDC
```

---

## What Lenders Provide and Receive

**You provide**: USDC — the loan principal.

**You receive** (in either outcome):

- **If borrower exercises** (repays at expiry): You receive the repayment amount in USDC, which includes your principal plus interest at the agreed APR. The borrower reclaims their collateral.
- **If borrower walks away** (does not repay): You take custody of the borrower's collateral (ETH or cbBTC). This is the collateral the borrower locked when creating the loan.

In both cases, you earn a return. The put option premium embedded in the loan structure is factored into your yield, giving you downside protection even if collateral prices decline.

---

## Risk and Reward for Lenders

### Potential Returns

- **Interest income**: Earn the agreed APR on the USDC you lend, paid at exercise.
- **Option premium**: The option structure means your effective yield is enhanced relative to simple USDC lending.
- **Collateral acquisition**: If the borrower walks away, you acquire ETH or cbBTC at an effective price that already factors in the put premium — giving you a structured entry point.

### Risks to Understand

| Risk | Description |
|------|-------------|
| **Market risk** | If the borrower walks away, you receive collateral. If that collateral has fallen significantly in value, you may receive assets worth less than your original USDC loan. |
| **Liquidity risk** | Your USDC is locked for the full loan duration. You cannot withdraw early. |
| **Platform risk** | Smart contract and protocol operational risks apply, as with any DeFi platform. |
| **Competition risk** | Your bids may be outcompeted during the initial auction window, and you may not win desired loans. |

---

## Filters and Controls

The Lend tab provides tools to find limit orders matching your criteria:

| Filter | Options |
|--------|---------|
| **Asset filter** | All Assets / ETH / BTC (filters by collateral type) |
| **Sort** | By size (largest/smallest first) or by APR (highest/lowest first) |
| **Refresh** | Updates the list of available limit orders |

---

## Lending Table Columns

| Column | Description |
|--------|-------------|
| **Asset** | Collateral type the borrower is offering (ETH or cbBTC) |
| **Lend Amount** | How much USDC you need to provide to fill this order |
| **Receive** | The collateral you take custody of if the borrower walks away |
| **APR** | Your interest rate if the borrower exercises (repays) at expiry |
| **Status** | Available, Partially Filled, etc. |
| **Action** | "Lend" button to fill the limit order _(coming soon)_ |

---

## Best Practices for Lenders

1. **Assess collateral risk**: Understand the ETH or cbBTC price movement required before a walk-away becomes unprofitable for you.
2. **Diversify**: Do not put all your USDC into a single loan. Spread across multiple orders and expiries to reduce concentration risk.
3. **Price competitively**: During the initial auction window, offer competitive rates — but not so low that the return does not justify your risk.
4. **Monitor collateral markets**: Stay aware of price trends for ETH and cbBTC, especially as loan expiry dates approach.
5. **Understand the option mechanism**: The put option embedded in each loan is what protects you structurally. Learn how it works before committing large amounts. See [Getting Started](./getting-started.md) and [Risks](./risks.md) for more context.
