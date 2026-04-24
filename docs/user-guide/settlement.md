# Loan Settlement

## European-Style Options: Exercise AT Expiry Only

ZendFi loans are structured as **European-style options**. This is a critical distinction:

> **You can only exercise your option AT the expiry date — not before.**

There is **no early repayment feature**. You cannot pay back your loan early to retrieve your collateral before the expiry date. Your collateral is locked until expiry, and your USDC is yours to use freely during the loan term.

This design is what makes ZendFi non-liquidatable: because there is no continuous debt position to margin-call, the protocol has no mechanism to touch your collateral until the predetermined date.

---

## The One-Hour Exercise Window

At expiry, you have **exactly one hour** to take action. This window opens at the moment your option expires and closes 60 minutes later.

- If you act within the window: you choose your outcome (Exercise, Swap & Exercise, or Walk Away).
- If you do nothing: the option expires unexercised. The lender keeps your collateral, and you keep the USDC you originally received. No additional payment is due.

**Timing is critical.** Mark your expiry date in your calendar and be available during the one-hour window if you plan to exercise.

---

## Your Three Options at Expiry

### Option 1: Exercise with USDC

**Use when**: You have (or will have) the required USDC in your wallet.

1. Before the window opens, ensure you have the repayment amount in USDC in your wallet.
2. You can **approve the USDC contract at any time after taking the loan** — even days or weeks before expiry. Doing this in advance saves a transaction during the high-pressure one-hour window.
3. During the one-hour window, click **"Exercise"** on your loan card in the Loans tab.
4. The contract transfers your repayment USDC to the lender and returns your collateral to your wallet.

### Option 2: Swap & Exercise

**Use when**: You do not have USDC available to exercise but want to reclaim your collateral.

> **Note**: Swap & Exercise is currently in development. This feature will be available in an upcoming release.

1. During the one-hour exercise window, click **"Swap & Exercise"** on your loan card.
2. The system sells a portion of your collateral (via a DEX aggregator) to generate the required USDC.
3. The USDC is used to settle the loan, and any remaining collateral is returned to your wallet.

This is the recommended path if you do not hold USDC at expiry but still want your collateral back.

### Option 3: Walk Away (Do Not Exercise)

**Use when**: The collateral's current market value is less than the repayment amount, or you simply prefer to keep the USDC.

- You do nothing during the one-hour window, **or** you click **"Do Not Exercise"** on your loan card.
- The option expires, the lender takes custody of your collateral, and you owe nothing further.
- You keep all the USDC you originally received.

There is no penalty for walking away — it is an expected and valid outcome built into the loan structure.

---

## When to Exercise vs. When to Walk Away

The decision is straightforward from an economic standpoint:

| Scenario | Recommended action |
|----------|-------------------|
| Collateral market value **> repayment amount** | **Exercise** — reclaim collateral, which is worth more than you pay |
| Collateral market value **< repayment amount** | **Walk away** — it costs less to keep the USDC than to pay the full repayment |
| Collateral market value **≈ repayment amount** | Consider gas costs and personal preference |

Example: If you borrowed against 1 ETH and ETH is trading at $3,000 at expiry but your repayment is only $2,000, exercise is clearly profitable. If ETH has dropped to $1,500, walking away and keeping your $1,800 (hypothetical) USDC is the better outcome.

**Remember**: The Effective APR shown in the Payback panel applies only to the exercise scenario. It describes the annualized cost of reclaiming your collateral, not the cost of walking away.

---

## Preparation Timeline

You do not have to wait until expiry to prepare. Here is the recommended timeline:

| When | Action |
|------|--------|
| **Anytime after loan starts** | Approve the USDC contract for the repayment amount (saves a transaction at expiry) |
| **Anytime before the exercise window closes** | Move the required USDC into your wallet |
| **During the one-hour window** | Click "Exercise" (or "Swap & Exercise") to reclaim your collateral |

Pre-approving the USDC contract is highly recommended. It is a simple transaction you can do at your leisure — not under time pressure during the exercise window.

---

## Important Reminders

- **No early repayment**: You cannot repay or exercise before the expiry date. This is by design.
- **One-hour window is strict**: If the window closes without action, the option expires. You cannot exercise after the window closes.
- **Effective APR applies only to exercise**: If you walk away, there is no additional cost. You simply keep the USDC and the lender keeps the collateral.
- **Gas fees apply**: All on-chain actions (approve, exercise, swap & exercise) require ETH for gas on Base. Keep some ETH in your wallet throughout the loan term.
- **Loans tab shows action status**: Near expiry, your loan card will show an "Action Required" status badge to remind you the window is approaching.
