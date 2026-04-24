# ZendFi Developer Documentation

Non-liquidatable crypto lending on Base (chain 8453) using physically-settled call options via Thetanuts V4 RFQ.

## Contents

### Architecture
- [Architecture Overview](../architecture/overview.md) — two-layer contract system, data flow, SDK boundaries
- [Smart Contract Reference](../architecture/contracts.md) — ABIs, functions, events, decimal conventions

### Developer Guides
- [Project Structure](./project-structure.md) — directory layout with descriptions
- [Service Layer](./services.md) — ThetanutsService, pricing.ts, formatting.ts, constants.ts
- [State Management](./state-management.md) — LoanContext, ThetanutsContext, hooks
- [Pricing System](./pricing.md) — data source, filtering pipeline, loan calculation formula
- [Gotchas & Known Issues](./gotchas.md) — CORS, RPC quirks, hydration, BigInt serialization

## Quick Start

```bash
npm run dev      # Vite dev server → http://localhost:3000
npm run build    # tsc + vite build → dist/
npm run preview  # Preview production build
```

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict) |
| Framework | Next.js (App Router) |
| Wallet | wagmi + RainbowKit |
| Blockchain | ethers.js v6 |
| Option SDK | @thetanuts-finance/thetanuts-client |
| Chain | Base Mainnet (chain ID 8453) |
