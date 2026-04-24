# Borrowing on ZendFi

This guide walks through every step of creating a loan, explains the competition process, and breaks down how borrowing costs are calculated.

## Step 1: Set Your Loan Parameters

Navigate to the **Borrow** tab at `/app`.

### Deposit Section

- Enter the amount of collateral you want to deposit (e.g., `0.001`).
- Click the token selector (showing the token icon + name + dropdown arrow) to choose between **ETH** or **cbBTC**.
- Your current wallet balance is shown below the input field.

### Receive Section

- The USDC amount you will receive updates automatically based on your collateral amount, the selected strike, and the selected expiry.
- Click the token/strike selector to open a modal listing available strike prices and expiry dates.
- Choosing a higher strike generally means you receive more USDC now, but your repayment at expiry is also higher.
- The USD equivalent of your collateral is shown below the input for reference.

### Payback Panel (Blue Section)

The blue Payback panel is the most important section to read before confirming:

- **Repayment date** — the exact date your loan expires (e.g., "June 26, 2026")
- **Payback amount** — the exact USDC you must pay to reclaim your collateral (e.g., "5,000 USDC")
- **Effective APR** — the annualized cost of the loan including both borrowing interest and option cost (e.g., "26.29%")

These figures are fixed at confirmation and will not change.

---

## Step 2: Review Your Loan

Once you have set your parameters, click the blue **"Review"** button.

The **Review Modal** opens and displays:

| Field | Description |
|-------|-------------|
| Deposit amount | Your collateral and its type |
| Receive amount | USDC you will receive |
| Strike price | The price at which you can reclaim your collateral |
| Expiry date | When the loan matures |
| Repayment amount | USDC you owe at expiry to reclaim collateral |
| Effective APR | Total annualized cost (interest + option) |
| Borrowing fee | Interest on the USDC principal |
| Option premium | Cost of the embedded put option |
| Protocol fee | ZendFi platform fee |
| Network cost | Estimated gas fee |

Review every line carefully. When you are satisfied, click **"Confirm Loan Request"** to submit your loan to the market.

---

## Step 3: The Competition Process

After confirming, the interface transitions to the **Loan Progress** view, which has four steps:

### Step 1 — Preparing
> "Your loan request has been submitted to market makers"

The loan request is broadcast to the market maker network. No action required from you.

### Step 2 — Competition
> "Lenders are competing to offer you the best rate"

A countdown animation plays while market makers place bids. The default competition window is approximately 30 seconds. You can cancel at any time using the red **"Cancel Request"** button.

### Step 3 — Offers
> "Offers received (X:XX remaining)"

Live offers appear with their APR rates. Each offer has an **"Accept"** button. You can also click **"Keep waiting for better offers"** to continue watching as more bids arrive.

- Offers are sorted by rate — the most competitive (lowest APR) offer appears first.
- You are never obligated to accept the first offer.

### Step 4 — Completion
> "Transaction completed — funds sent to your wallet"

USDC is deposited into your wallet. The loan is now active and will appear on the **Loans** tab.

**Note**: You can click **"Cancel Request"** at any point during Steps 1–3 before accepting an offer. Once you accept, the loan is live and cannot be cancelled or repaid early.

---

## Understanding Borrowing Costs

ZendFi has two distinct cost components that together make up the Effective APR.

### Borrowing Interest (USDC APR)

This is the annualized interest rate on the USDC you borrow. You set a **maximum APR cap** in Settings (default: 20%). The actual rate offered by market makers may be lower than your cap — competition drives it down.

Your APR cap applies **only to this interest component**.

### Option Cost

When you borrow on ZendFi, the lender sells you a put option embedded in the loan structure. This gives you the right to walk away from your collateral if the market moves against you. That optionality has a cost (the option premium), which is separate from and in addition to the borrowing interest.

The option cost is **not** subject to your APR cap. It is reflected in the final repayment amount shown in the Payback panel.

### Effective APR

The **Effective APR** combines both components and annualizes the total cost for the loan term:

```
Effective APR = ((Repay Amount / Receive Amount) - 1) × (8760 / Hours to Expiry) × 100
```

This is the number shown in the blue Payback panel and is the most accurate single figure representing your total cost if you choose to reclaim your collateral.

### Worked Example

| | |
|--|--|
| **Receive now** | ~4,058 USDC |
| **Repay at expiry** | 5,000 USDC |
| **Borrowing APR cap** | 20% (actual rate offered may be ≤ 20%) |
| **Option cost** | ~6.29% |
| **Effective APR** | ~26.29% (interest + option, annualized for the term) |

**At expiry, two scenarios:**

- **You exercise (repay)**: You pay exactly 5,000 USDC and receive your collateral back. Your total cost is interest + option = Effective APR ~26.29%.
- **You walk away**: You pay nothing further and keep the 4,058 USDC you received. The lender keeps your collateral. No extra fee or penalty is charged.

The Effective APR pertains to the exercise scenario only. If you walk away, the cost structure is entirely different — you simply forgo your collateral.

### Where to See the Numbers

- **Blue Payback panel** on the Borrow tab: shows live repayment amount and Effective APR as you adjust parameters.
- **Review modal**: shows the full fee breakdown before you confirm.
- **Loans tab**: shows your locked-in repayment amount and Effective APR for active loans.

---

## Cancelling During Competition

You can cancel at any time during the competition process (Steps 1–3) by clicking the red **"Cancel Request"** button. Cancellation is free (you pay only gas). Once you have accepted an offer, the loan is live and cannot be cancelled — European-style options have no early repayment.

If no market makers respond to your request, adjust your parameters:

- Increase your maximum APR cap in Settings.
- Choose a different (closer) expiry date.
- Try a smaller collateral amount.
- Enable "Keep order open if no immediate match" in Settings to leave your request active as a limit order.
