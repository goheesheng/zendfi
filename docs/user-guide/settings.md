# Settings

Open Settings by clicking the **gear icon (⚙)** in the navigation bar. Changes take effect after clicking **"Save Settings"** at the bottom of the modal.

---

## Duration & Expiry Filter

**Setting**: "Show options expiring in X days or more"
**Default**: 30 days

This filter hides very short-term loan options from the strike/expiry selector. If you only want to see loans with at least 60 days remaining, set this to 60.

Increasing this value is useful if:
- You want to avoid short-dated loans where the effective APR is dominated by the option cost.
- You prefer longer, more predictable loan terms.

Decreasing it (below 30) will surface shorter-term options but those tend to have less favorable economics for borrowers.

---

## Max Strikes Per Expiry

**Setting**: "Show up to X strikes per expiry"
**Default**: 5

Controls how many strike price choices are displayed per expiry date in the selector. A higher number gives you more granular control over your loan terms. A lower number reduces clutter if you prefer a simpler selection.

---

## Sort Order

**Setting**: Display order for available loan options
**Options**:
- Highest strike first
- Lowest strike first
- Nearest expiry first
- Furthest expiry first

Choose based on your priority. If you want maximum USDC upfront, sort by highest strike first. If you want to minimize the loan duration, sort by nearest expiry first.

---

## APR Configuration

**Setting**: "Maximum APR" slider
**Range**: 5% – 30%
**Default**: 20%

This sets the upper limit on the **borrowing interest rate** (USDC APR) you are willing to accept from market makers. Offers above this cap will not be shown.

**Important**: This cap applies only to the borrowing interest on the USDC principal. It does **not** cap the option premium or the overall Effective APR shown in the Payback panel.

The Effective APR (visible in the blue Payback panel) includes both interest and the option cost, so it will typically be higher than your APR cap. For example:

| APR cap (your setting) | Actual interest offered | Option cost | Effective APR |
|------------------------|------------------------|-------------|---------------|
| 20% | 20% | ~6.29% | ~26.29% |
| 20% | 15% | ~6.29% | ~21.29% |

If you are getting no offers, try raising your APR cap. If the Effective APR feels too high, consider choosing a different strike or expiry combination.

---

## Order Behavior

**Setting**: "Keep order open if no immediate match" toggle
**Default**: Off (cancel if no match)

This toggle controls what happens if your loan request receives no match during the competition window:

- **Off (default)**: Your request is cancelled automatically if no market maker fills it. You need to resubmit manually.
- **On**: Your request remains open as a limit order in the system, visible in the Lend tab. Any lender can fill it later at the terms you specified.

Enable this if you are comfortable with your loan terms and willing to wait for a match rather than resubmitting.

---

## Troubleshooting: Clear Local Storage

If settings are not saving correctly, or if the app shows stale data, you can reset local storage:

1. Open your browser's developer tools (`F12` or `Cmd+Option+I` on macOS).
2. Navigate to **Application** → **Local Storage** → your app's origin.
3. Delete the keys `zendfi_state` and `zendfi_settings`.
4. Refresh the page.

**Warning**: Clearing `zendfi_state` will remove locally stored loan data (active loan IDs, history). Your on-chain positions are not affected — loans are recorded on the blockchain. However, the app may not automatically rediscover loans from before the clear until historical event loading is implemented. Note your active loan details (contract addresses, expiry dates, repayment amounts) before clearing.

Other troubleshooting tips:

| Problem | Solution |
|---------|---------|
| Settings not saving | Click "Save Settings" at the bottom of the modal |
| Wallet not connecting | Confirm you are on Base network (chain ID 8453) |
| No loan options shown | Lower the Duration filter or raise the APR cap |
| Transaction stuck | Use "Cancel Request" and resubmit |
| Balance not showing | Disconnect and reconnect your wallet |
