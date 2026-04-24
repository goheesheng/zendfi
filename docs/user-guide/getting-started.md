# Getting Started with ZendFi

## What is ZendFi?

ZendFi is a decentralized lending platform that eliminates liquidation risk through options-based collateralization. Unlike traditional crypto lending platforms that can force-liquidate your collateral during market downturns, ZendFi issues fixed-term loans with predictable repayment schedules and zero liquidation risk — no matter what the market does between now and your loan's expiry date.

When you borrow on ZendFi, you lock ETH or BTC as collateral and receive USDC immediately. In return, you hold a deeply in-the-money call option: the right (but not the obligation) to reclaim your collateral at a predetermined price on a predetermined date. If the market moves against you, you can simply walk away and keep the USDC. If you want your collateral back, you pay the agreed repayment amount at expiry. The choice is always yours — there are no automated liquidations, no margin calls, and no surprise forced sell-offs.

The platform runs on the Base network and is powered by Thetanuts V4's RFQ (request-for-quotation) infrastructure. Loan rates are discovered through a competitive marketplace: market makers bid in real time to fund your loan, so you always see the best available rate before you confirm.

## How It Works (Simplified)

ZendFi wraps Thetanuts V4's physically-settled call options into a lending product:

1. **You deposit collateral** (ETH or cbBTC) into the `LoanCoordinator` contract.
2. **Market makers compete** to fund your loan during a short auction window.
3. **You receive USDC** immediately when a match is confirmed.
4. **At expiry**, you have a one-hour window to choose your outcome:
   - Pay the repayment amount in USDC and reclaim your collateral.
   - Use "Swap & Exercise" to sell a portion of your collateral to cover the debt.
   - Walk away: keep the USDC you received, and the lender keeps your collateral.

Because borrowers hold an option rather than a debt position with a liquidation threshold, there is no mechanism by which the protocol can seize collateral before expiry. Your assets are locked, but they are safe for the full loan term.

## Quick Start Guide

### 1. Connect Your Wallet

Navigate to `/app`. Click the **"Connect Wallet"** button in the top-right corner. ZendFi uses MetaMask (and any injected provider). Once connected, you will see "Connected to Base" with a green indicator.

### 2. Switch to Base Network

ZendFi operates exclusively on **Base** (chain ID 8453). If your wallet is on another network, you will be prompted to switch. Confirm the network switch in your wallet.

### 3. Start Small

Before committing significant collateral, run through the process with a small amount — for example, `0.001 ETH`. This lets you observe the full competition flow (preparing → competition → offers → completion) without much at stake, and ensures everything works with your wallet setup.

### 4. Configure Settings First

Click the gear icon (⚙) in the navigation bar to open Settings. Set a comfortable **maximum APR** before your first loan. Starting at 20% is a reasonable default. See [Settings](./settings.md) for full details.

### 5. Use the Review Step

Always click the blue **"Review"** button before confirming. The review modal shows the complete fee breakdown — borrowing fee, option premium, protocol fee, and network cost — along with your exact repayment amount and effective APR. Confirm only when you are satisfied with all figures.

### 6. Monitor Your Loans

After confirming, check the **Loans** tab to track your active positions. Loan cards display status, repayment date, repayment amount, and current APR.

## Interface Overview

| Tab | Purpose |
|-----|---------|
| **Borrow** | Create new loan requests; set collateral, strike, and expiry |
| **Loans** | View active loans; take action at or near expiry |
| **History** | See completed loans with final outcomes (Exercised / Declined / Expired) |
| **Lend** | Fill unfilled loan requests as a lender _(coming soon)_ |
| **Settings (⚙)** | Configure APR caps, duration filters, display order, and order behavior |

### Key UI Elements

- **Blue elements**: Interactive buttons and important information panels
- **Green text**: Positive values (APR, profits)
- **Red text**: Warnings or losses
- **Arrows**: Show transaction flow direction (deposit → receive → payback)
- **Numbered circles**: Progress indicators during the competition process
- **Blue "Payback" panel**: Always shows your exact repayment amount and effective APR for the selected loan

### Interface Tips

- The **Collateral Selector** (showing the token icon and name) lets you choose ETH or cbBTC as collateral.
- The **Strike Selector** (showing a `$` icon) lets you pick from available strike prices and expiry dates. Each combination gives a different receive amount and repayment amount.
- The **Payback panel** (blue section below the receive field) updates live as you change parameters. This is your single source of truth for what you owe and when.
