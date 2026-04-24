# Risks and Best Practices

ZendFi's non-liquidatable design eliminates one major category of DeFi lending risk — forced liquidation — but it introduces its own considerations. Read this section carefully before committing significant capital.

---

## Risks for Borrowers

### 1. Opportunity Cost

If your collateral (ETH or cbBTC) appreciates significantly during the loan term, you will still pay the agreed strike price to reclaim it. You always get your collateral back if you exercise — but at the predetermined price, not at the spot price. If the market rallies far above your strike, you do not benefit from that upside while your collateral is locked.

### 2. Interest and Option Costs

You must pay the agreed borrowing interest regardless of market conditions. The option cost (premium for your right to walk away) is also fixed at confirmation. These costs are known upfront and do not change, but they are a guaranteed expense if you choose to exercise.

### 3. Collateral Lock-up

Your collateral is locked in the `LoanCoordinator` contract for the entire loan duration. You cannot withdraw or trade it during the term. Ensure you are comfortable with this illiquidity before depositing.

### 4. Expiry Risk

You must make a decision during a **one-hour window at expiry**. Missing this window means the option expires unexercised — you keep your USDC but lose your collateral by default. If you plan to exercise, you must be available and prepared during that window.

### 5. Timing Risk (Swap & Exercise)

If you plan to use Swap & Exercise (selling a portion of collateral to pay the debt), you **must be present during the one-hour window**. You cannot schedule this in advance. If you are unavailable during the window and lack the USDC to exercise directly, your only outcome is walking away.

---

## Risks for Lenders

### 1. Market Risk

If a borrower walks away at expiry, you receive the collateral rather than USDC repayment. If the collateral (ETH or cbBTC) has declined significantly in price, the assets you receive may be worth less than the USDC you originally lent. The option premium provides partial protection, but extreme price drops can still result in a net loss in USDC terms.

### 2. Liquidity Risk

Your USDC is locked for the full loan duration. You cannot withdraw or redeploy it until the loan is settled at expiry. Do not lend funds you may need during the loan term.

### 3. Platform Risk

As with all DeFi protocols, there is risk from smart contract bugs, protocol exploits, or operational failures. ZendFi is built on Thetanuts V4's audited infrastructure, but no system is entirely without risk. Only lend amounts you are prepared to risk in a DeFi context.

### 4. Competition Risk

During the initial auction window, other lenders may offer better rates and win the loan. You may not fill the orders you target, especially for highly competitive loans. Your capital may sit idle while you wait for matching opportunities.

---

## Best Practices for Safe Borrowing

1. **Understand the terms before confirming.** Always check the blue Payback panel for your exact repayment amount, repayment date, and Effective APR before clicking "Confirm Loan Request."

2. **Plan for settlement from day one.** Decide in advance whether you expect to exercise or walk away, based on your price outlook. Prepare accordingly — either set aside USDC or plan to use Swap & Exercise.

3. **Consider multiple market scenarios.** Use the strike selector to explore how different price outcomes at expiry change your decision. A higher strike gives you more USDC now but a higher repayment — the right choice depends on your market view.

4. **Start small.** Your first loan should use a minimal amount (e.g., `0.001 ETH`) to experience the full flow — competition, confirmation, the Loans tab, and the settlement decision — without significant capital at stake.

5. **Read the documentation.** Understand how European options work, why there is no early repayment, and what the Effective APR actually measures before committing.

6. **Set conservative APR limits initially.** Begin with a maximum APR cap of 20% or less in Settings. Adjust upward only if you are comfortable with higher costs and understand what you are accepting.

7. **Monitor the competition process.** Do not blindly accept the first offer. Watch the offers list during the competition window — rates may improve as more market makers bid.

8. **Keep ETH for gas.** All on-chain transactions on Base require ETH for gas fees. Maintain a buffer in your wallet throughout the loan term, especially approaching expiry.

9. **Prepare for expiry well in advance.** Approve the USDC contract anytime after the loan starts (not just at expiry). Have the required USDC in your wallet before the one-hour window begins. If using Swap & Exercise, ensure you are available and the feature is active before relying on it.

---

## Best Practices for Lending

1. **Assess collateral and market risk before lending.** Understand at what price the collateral must fall for your position to be unprofitable if the borrower walks away. Factor in the option premium when calculating your effective entry price.

2. **Diversify across multiple loans.** Do not allocate all your USDC to a single order or expiry date. Spread exposure across different borrowers, collateral types, and terms to reduce concentration risk.

3. **Price loans competitively but profitably.** During the auction window, offer rates that are attractive enough to win, but still reflect the risk you are taking. Undercutting too aggressively erodes your return without eliminating risk.

4. **Monitor collateral markets.** Stay aware of ETH and cbBTC price movements, especially as your loan expiry dates approach. This helps you anticipate whether borrowers are likely to exercise or walk away.

5. **Understand the option mechanism.** The put option embedded in each loan is what gives you structured downside protection. Learn how the strike price, expiry date, and option premium interact before committing substantial capital. See [Getting Started](./getting-started.md) for a conceptual overview.
