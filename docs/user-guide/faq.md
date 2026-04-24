# Frequently Asked Questions

## Core Questions

**Q: Where do I see my loan status?**

Go to the **Loans** tab. All active loans appear as cards with color-coded status badges: green for Active, yellow for Action Required (near expiry), and blue for Completed.

---

**Q: How do I change my APR limit?**

Click the gear icon (⚙) to open Settings → APR Configuration → adjust the slider → click "Save Settings". The cap applies to borrowing interest only; see [Settings](./settings.md) for a full explanation.

---

**Q: Can I cancel during the competition?**

Yes. Click the red **"Cancel Request"** button at any time before you have accepted an offer. Once you accept an offer and the loan is confirmed on-chain, it cannot be cancelled.

---

**Q: What if no one wants to lend to me?**

Try adjusting your parameters:
- Increase your maximum APR cap in Settings.
- Choose a different (typically closer) expiry date.
- Try a smaller collateral amount.
- Enable "Keep order open if no immediate match" in Settings to keep your request live as a limit order.

---

**Q: Can I repay my loan early?**

No. ZendFi uses **European-style options** that can only be exercised **at expiry**, during a one-hour window. There is no early repayment feature. This is fundamental to how the non-liquidatable structure works.

---

**Q: What happens at loan expiry?**

You have exactly **one hour** from the expiry time to choose:
1. **Exercise** — pay the repayment USDC amount and reclaim your collateral.
2. **Swap & Exercise** — sell a portion of your collateral to cover the USDC debt and reclaim the remainder _(coming soon)_.
3. **Walk away** — do nothing. The lender keeps your collateral, you keep the USDC you received. No extra payment required.

---

**Q: Does the Effective APR apply if I walk away?**

No. The Effective APR shown in the blue Payback panel reflects the annualized cost of the exercise scenario — paying the repayment amount to reclaim your collateral. If you walk away, you pay nothing further. The Effective APR does not apply to the walk-away outcome.

---

**Q: Why is my Effective APR higher than my APR cap (e.g., 20%)?**

Because the Effective APR includes both the **borrowing interest** (which is capped at your setting) and the **option premium** (which is not capped). The option premium is the cost of your right to walk away from your collateral — it is separate from and in addition to the interest rate. See [Borrowing — Understanding Costs](./borrowing.md#understanding-borrowing-costs) for a detailed breakdown.

---

**Q: Where do the specific numbers come from (e.g., receive 4,058 USDC, repay 5,000 USDC, Effective APR ~26.29%)?**

- The **receive amount** is what the market makers agree to lend you now, based on your collateral, the selected strike price, expiry, and competitive bidding.
- The **repay amount** is fixed at confirmation and includes principal + interest + option cost for the chosen strike and term.
- The **Effective APR** annualizes the ratio `repay / receive` over the loan term using the formula: `((repay / receive) - 1) × (8760 / hours to expiry) × 100`.

All figures are locked at confirmation and shown in the Review modal and Payback panel.

---

**Q: What if I don't have USDC to exercise at expiry?**

Use the **"Swap & Exercise"** feature during the one-hour window. It sells a portion of your collateral via a DEX aggregator to generate the required USDC, settles the loan, and returns any remaining collateral to your wallet.

> Note: Swap & Exercise is currently in development and will be available in an upcoming release. If you know you will not have USDC at expiry, plan your position size accordingly in the meantime.

---

**Q: When can I prepare for settlement?**

You can approve the USDC contract **anytime after taking the loan** — even weeks before expiry. Pre-approving is strongly recommended because it removes one transaction from the time-pressured one-hour window. You can also move USDC into your wallet at any point before the window closes.

---

## Additional Questions from the Risk Section

**Q: What is "opportunity cost" risk for borrowers?**

If your collateral (ETH or cbBTC) appreciates significantly during the loan term, you will pay the strike price to reclaim it rather than holding it outright. If you exercised at $2,000 per ETH but ETH is now $5,000, you still get your ETH back — but you paid $2,000 for it. You do not "lose" the ETH; you just pay the agreed price to reclaim it. This is the intended design, not a flaw.

---

**Q: Is my collateral safe from liquidation even in a crash?**

Yes. There is no liquidation mechanism in ZendFi. Your collateral cannot be touched before expiry regardless of how far prices move. At expiry, if prices have fallen dramatically, you can simply walk away and keep the USDC, rather than paying to reclaim collateral that is now worth less than the repayment amount.

---

**Q: What are the platform risks?**

As with all DeFi protocols, smart contract risk applies. ZendFi is built on Thetanuts V4's audited infrastructure, which is battle-tested. However, no smart contract system is entirely without risk. Do not borrow or lend more than you are comfortable risking on a DeFi platform.

---

**Q: My loan isn't showing in the Loans tab after I confirmed. What do I do?**

Wait a few seconds and refresh. If it still doesn't appear, check that your wallet is connected and on Base. In rare cases, clearing `zendfi_state` from local storage (see [Settings — Troubleshooting](./settings.md#troubleshooting-clear-local-storage)) and refreshing may help. Your on-chain position is always preserved regardless of local app state.
