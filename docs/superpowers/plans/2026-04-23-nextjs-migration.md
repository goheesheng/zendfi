# ZendFi Next.js Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild ZendFi as a Next.js 14 app with a marketing landing page at `/` and a DeFi lending interface at `/app`, using Tailwind CSS, RainbowKit+wagmi, React Context, and the Thetanuts SDK.

**Architecture:** Next.js App Router with two layout zones — a light-themed landing page and a dark-themed app interface. The existing service layer (ThetanutsService, state management, ABIs, constants, types) is ported from the current Vite project. Wallet connection uses RainbowKit+wagmi instead of the custom WalletService.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, next-themes, RainbowKit 2, wagmi 2, viem 2, @tanstack/react-query 5, @headlessui/react 2, ethers 6, @thetanuts-finance/thetanuts-client

**Spec:** `docs/superpowers/specs/2026-04-23-nextjs-migration-design.md`

**Reference files:**
- Current services: `src/services/` (constants.ts, abis.ts, thetanuts.ts, state.ts, wallet.ts)
- Current types: `src/types/index.ts`
- Current UI logic: `src/main.ts`
- V1 loan UI: `/Users/eesheng_eth/Desktop/thetaverse/zendfi_v1/loan.html`
- V1 landing: `/Users/eesheng_eth/Desktop/thetaverse/zendfi_v1/index.html`
- Live landing: `https://zend-finance-production.up.railway.app/`

---

### Task 1: Scaffold Next.js project with Tailwind and dependencies

**Files:**
- Modify: `package.json`
- Create: `next.config.ts`
- Create: `postcss.config.js`
- Create: `tailwind.config.ts`
- Modify: `tsconfig.json`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Delete: `vite.config.ts`, `index.html`

- [ ] **Step 1: Remove old Vite files and install Next.js + deps**

```bash
rm -f vite.config.ts index.html
rm -rf src/main.ts src/styles/
npm install next@14 react@18 react-dom@18 @rainbow-me/rainbowkit@2 wagmi@2 viem@2 @tanstack/react-query@5 next-themes@^0.3 @headlessui/react@^2
npm install -D tailwindcss@^3.4 postcss@^8 autoprefixer@^10 @types/react@18 @types/react-dom@18
npx tailwindcss init -p
```

- [ ] **Step 2: Create `next.config.ts`**

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Thetanuts SDK has Node.js imports (fs, crypto) that need to be externalized for browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create `tailwind.config.ts`**

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme (app)
        'zend-bg': '#0f111a',
        'zend-bg2': '#1a1f2e',
        'zend-card': '#1e2336',
        'zend-border': '#2d3446',
        'zend-input': '#141724',
        'zend-accent': '#6366f1',
        'zend-accent-hover': '#4338ca',
        // Semantic
        'zend-success': '#10b981',
        'zend-warning': '#f59e0b',
        'zend-error': '#ef4444',
      },
      maxWidth: {
        'app': '480px',
      },
      borderRadius: {
        'xl2': '24px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Create `postcss.config.js`**

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Update `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Create `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --zend-accent-gradient: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}
```

- [ ] **Step 7: Create `src/app/layout.tsx` (root layout with ThemeProvider)**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zend Finance | Liquidation-Free Crypto Borrowing',
  description: 'Borrow without liquidation risk. Fixed terms. Predictable repayment. Peace of mind.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Create placeholder `src/app/page.tsx`**

```tsx
// src/app/page.tsx
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zend-bg">
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">Zend Finance</h1>
      </div>
    </main>
  );
}
```

- [ ] **Step 9: Update `package.json` scripts**

Replace the `"scripts"` block in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

- [ ] **Step 10: Run dev server and verify**

```bash
npm run dev
```

Expected: Next.js dev server starts on http://localhost:3000, shows "Zend Finance" centered on a white page. No build errors.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "scaffold: Next.js 14 with Tailwind, next-themes, and dependencies"
```

---

### Task 2: Port types, constants, ABIs, and formatting utilities

**Files:**
- Keep: `src/types/index.ts` (no changes needed)
- Keep: `src/services/constants.ts` (no changes needed)
- Keep: `src/services/abis.ts` (no changes needed)
- Create: `src/services/formatting.ts`
- Delete: `src/services/wallet.ts` (replaced by RainbowKit+wagmi)

- [ ] **Step 1: Create `src/services/formatting.ts`**

Extract formatting utilities from `thetanuts.ts` into a standalone module:

```ts
// src/services/formatting.ts
import { STRIKE_DECIMALS, HOURS_PER_YEAR } from './constants';

export function formatStrike(strike: bigint): string {
  return (Number(strike) / 10 ** STRIKE_DECIMALS).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export function formatUsdc(amount: bigint): string {
  return (Number(amount) / 1e6).toFixed(2);
}

export function calculateEffectiveApr(
  receiveAmount: bigint,
  repayAmount: bigint,
  hoursToExpiry: number
): number {
  if (receiveAmount === 0n || hoursToExpiry <= 0) return 0;
  const ratio = Number(repayAmount) / Number(receiveAmount);
  return ((ratio - 1) * HOURS_PER_YEAR) / hoursToExpiry * 100;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

- [ ] **Step 2: Delete `src/services/wallet.ts`**

```bash
rm src/services/wallet.ts
```

- [ ] **Step 3: Verify types, constants, and ABIs compile**

```bash
npx tsc --noEmit
```

Expected: No errors from `src/types/index.ts`, `src/services/constants.ts`, `src/services/abis.ts`, or `src/services/formatting.ts`. There may be errors from `src/services/thetanuts.ts` and `src/services/state.ts` referencing the deleted wallet — that's expected and will be fixed in Tasks 3-4.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: port types, constants, ABIs, and add formatting utilities"
```

---

### Task 3: Port ThetanutsService for React (remove wallet singleton dependency)

**Files:**
- Modify: `src/services/thetanuts.ts`

The existing `ThetanutsService` is framework-agnostic and almost ready. We only need to remove the `formatStrike`, `formatUsdc`, and `calculateEffectiveApr` methods (now in `formatting.ts`) and keep the class as-is. It takes a provider in the constructor and a signer via `setSigner()` — wagmi will supply these.

- [ ] **Step 1: Update `src/services/thetanuts.ts`**

Remove the three formatting methods at the bottom of the file (lines 369-384) since they now live in `formatting.ts`. The rest of the file stays unchanged.

Remove these methods from the class:
```ts
// DELETE these three methods:
formatStrike(strike: bigint): string { ... }
formatUsdc(amount: bigint): string { ... }
calculateEffectiveApr(...): number { ... }
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: `thetanuts.ts` should compile cleanly. `state.ts` may still have errors (fixed in Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/services/thetanuts.ts
git commit -m "refactor: remove formatting methods from ThetanutsService (moved to formatting.ts)"
```

---

### Task 4: Port state management to React Context

**Files:**
- Create: `src/context/LoanContext.tsx`
- Create: `src/context/ThetanutsContext.tsx`
- Delete: `src/services/state.ts` (replaced by LoanContext)

- [ ] **Step 1: Create `src/context/LoanContext.tsx`**

```tsx
// src/context/LoanContext.tsx
'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { Loan, LoanStatus, OfferInfo, UserSettings } from '@/types';

const STORAGE_KEY = 'zendfi_state';
const SETTINGS_KEY = 'zendfi_settings';

interface LoanState {
  loans: Map<string, Loan>;
  activeLoanRequestId: string | null;
  selectedCollateral: 'WETH' | 'CBBTC';
  selectedStrike: number | null;
  selectedExpiry: number | null;
  settings: UserSettings;
}

type LoanAction =
  | { type: 'UPSERT_LOAN'; id: string; data: Partial<Loan> }
  | { type: 'REMOVE_LOAN'; id: string }
  | { type: 'ADD_OFFER'; quotationId: string; offer: OfferInfo }
  | { type: 'SET_LOAN_STATUS'; id: string; status: LoanStatus }
  | { type: 'SET_ACTIVE_REQUEST'; id: string | null }
  | { type: 'SET_COLLATERAL'; collateral: 'WETH' | 'CBBTC' }
  | { type: 'SET_STRIKE'; strike: number | null }
  | { type: 'SET_EXPIRY'; expiry: number | null }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<UserSettings> }
  | { type: 'CLEAR_ALL' }
  | { type: 'LOAD_STATE'; state: Partial<LoanState> };

const defaultSettings: UserSettings = {
  minDurationDays: 30,
  maxStrikes: 5,
  sortOrder: 'highestStrike',
  maxApr: 20,
  keepOrderOpen: true,
};

function loanReducer(state: LoanState, action: LoanAction): LoanState {
  const newLoans = new Map(state.loans);

  switch (action.type) {
    case 'UPSERT_LOAN': {
      const existing = newLoans.get(action.id);
      if (existing) {
        newLoans.set(action.id, { ...existing, ...action.data });
      } else {
        newLoans.set(action.id, {
          quotationId: BigInt(action.id),
          requester: '',
          collateralToken: '',
          collateralAmount: 0n,
          settlementToken: '',
          strike: 0n,
          expiryTimestamp: 0,
          offerEndTimestamp: 0,
          minSettlementAmount: 0n,
          status: 'requested',
          createdAt: Date.now(),
          offers: [],
          ...action.data,
        });
      }
      return { ...state, loans: newLoans };
    }
    case 'REMOVE_LOAN': {
      newLoans.delete(action.id);
      return {
        ...state,
        loans: newLoans,
        activeLoanRequestId: state.activeLoanRequestId === action.id ? null : state.activeLoanRequestId,
      };
    }
    case 'ADD_OFFER': {
      const loan = newLoans.get(action.quotationId);
      if (!loan) return state;
      const offers = [...loan.offers];
      const idx = offers.findIndex((o) => o.offeror === action.offer.offeror);
      if (idx >= 0) {
        offers[idx] = { ...offers[idx], ...action.offer };
      } else {
        offers.push(action.offer);
      }
      newLoans.set(action.quotationId, { ...loan, offers });
      return { ...state, loans: newLoans };
    }
    case 'SET_LOAN_STATUS': {
      const loan = newLoans.get(action.id);
      if (!loan) return state;
      newLoans.set(action.id, { ...loan, status: action.status });
      return { ...state, loans: newLoans };
    }
    case 'SET_ACTIVE_REQUEST':
      return { ...state, activeLoanRequestId: action.id };
    case 'SET_COLLATERAL':
      return { ...state, selectedCollateral: action.collateral };
    case 'SET_STRIKE':
      return { ...state, selectedStrike: action.strike };
    case 'SET_EXPIRY':
      return { ...state, selectedExpiry: action.expiry };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'CLEAR_ALL':
      return { ...state, loans: new Map(), activeLoanRequestId: null };
    case 'LOAD_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

interface LoanContextValue {
  state: LoanState;
  upsertLoan: (id: string, data: Partial<Loan>) => void;
  removeLoan: (id: string) => void;
  addOffer: (quotationId: string, offer: OfferInfo) => void;
  setLoanStatus: (id: string, status: LoanStatus) => void;
  setActiveRequest: (id: string | null) => void;
  setCollateral: (c: 'WETH' | 'CBBTC') => void;
  setStrike: (s: number | null) => void;
  setExpiry: (e: number | null) => void;
  updateSettings: (s: Partial<UserSettings>) => void;
  clearAll: () => void;
  getActiveLoans: () => Loan[];
  getHistoryLoans: () => Loan[];
  getLendingOpportunities: (address?: string) => Loan[];
}

const LoanContext = createContext<LoanContextValue | null>(null);

function serializeLoans(loans: Map<string, Loan>): string {
  const obj: Record<string, any> = {};
  for (const [id, loan] of loans) {
    obj[id] = {
      ...loan,
      quotationId: loan.quotationId.toString(),
      collateralAmount: loan.collateralAmount.toString(),
      strike: loan.strike.toString(),
      minSettlementAmount: loan.minSettlementAmount.toString(),
      netLoanAmount: loan.netLoanAmount?.toString(),
      offers: loan.offers.map((o) => ({
        ...o,
        decryptedAmount: o.decryptedAmount?.toString(),
        revealedAmount: o.revealedAmount?.toString(),
      })),
    };
  }
  return JSON.stringify({ loans: obj });
}

function deserializeLoans(json: string): Map<string, Loan> {
  const parsed = JSON.parse(json);
  const loans = new Map<string, Loan>();
  if (!parsed.loans) return loans;
  for (const [id, loan] of Object.entries(parsed.loans as Record<string, any>)) {
    loans.set(id, {
      ...loan,
      quotationId: BigInt(loan.quotationId),
      collateralAmount: BigInt(loan.collateralAmount),
      strike: BigInt(loan.strike),
      minSettlementAmount: BigInt(loan.minSettlementAmount),
      netLoanAmount: loan.netLoanAmount ? BigInt(loan.netLoanAmount) : undefined,
      offers: (loan.offers || []).map((o: any) => ({
        ...o,
        decryptedAmount: o.decryptedAmount ? BigInt(o.decryptedAmount) : undefined,
        revealedAmount: o.revealedAmount ? BigInt(o.revealedAmount) : undefined,
      })),
    });
  }
  return loans;
}

export function LoanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loanReducer, {
    loans: new Map(),
    activeLoanRequestId: null,
    selectedCollateral: 'WETH',
    selectedStrike: null,
    selectedExpiry: null,
    settings: defaultSettings,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedState = localStorage.getItem(STORAGE_KEY);
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      const loans = storedState ? deserializeLoans(storedState) : new Map();
      const settings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
      dispatch({ type: 'LOAD_STATE', state: { loans, settings } });
    } catch {
      // ignore corrupt localStorage
    }
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeLoans(state.loans));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch {
      // ignore
    }
  }, [state.loans, state.settings]);

  const upsertLoan = useCallback((id: string, data: Partial<Loan>) => dispatch({ type: 'UPSERT_LOAN', id, data }), []);
  const removeLoan = useCallback((id: string) => dispatch({ type: 'REMOVE_LOAN', id }), []);
  const addOffer = useCallback((quotationId: string, offer: OfferInfo) => dispatch({ type: 'ADD_OFFER', quotationId, offer }), []);
  const setLoanStatus = useCallback((id: string, status: LoanStatus) => dispatch({ type: 'SET_LOAN_STATUS', id, status }), []);
  const setActiveRequest = useCallback((id: string | null) => dispatch({ type: 'SET_ACTIVE_REQUEST', id }), []);
  const setCollateral = useCallback((c: 'WETH' | 'CBBTC') => dispatch({ type: 'SET_COLLATERAL', collateral: c }), []);
  const setStrike = useCallback((s: number | null) => dispatch({ type: 'SET_STRIKE', strike: s }), []);
  const setExpiry = useCallback((e: number | null) => dispatch({ type: 'SET_EXPIRY', expiry: e }), []);
  const updateSettings = useCallback((s: Partial<UserSettings>) => dispatch({ type: 'UPDATE_SETTINGS', settings: s }), []);
  const clearAll = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), []);

  const getActiveLoans = useCallback(
    () => [...state.loans.values()].filter((l) => l.status === 'active' || l.status === 'settled' || l.status === 'competing'),
    [state.loans]
  );
  const getHistoryLoans = useCallback(
    () => [...state.loans.values()].filter((l) => l.status === 'exercised' || l.status === 'declined' || l.status === 'expired' || l.status === 'cancelled'),
    [state.loans]
  );
  const getLendingOpportunities = useCallback(
    (address?: string) => [...state.loans.values()].filter((l) => l.status === 'limitOrder' && l.requester.toLowerCase() !== (address || '').toLowerCase()),
    [state.loans]
  );

  return (
    <LoanContext.Provider value={{ state, upsertLoan, removeLoan, addOffer, setLoanStatus, setActiveRequest, setCollateral, setStrike, setExpiry, updateSettings, clearAll, getActiveLoans, getHistoryLoans, getLendingOpportunities }}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoanContext() {
  const ctx = useContext(LoanContext);
  if (!ctx) throw new Error('useLoanContext must be used within LoanProvider');
  return ctx;
}
```

- [ ] **Step 2: Create `src/context/ThetanutsContext.tsx`**

```tsx
// src/context/ThetanutsContext.tsx
'use client';

import { createContext, useContext, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { JsonRpcProvider } from 'ethers';
import { useWalletClient } from 'wagmi';
import { ThetanutsService } from '@/services/thetanuts';
import { CHAIN_ID } from '@/services/constants';
import { BrowserProvider } from 'ethers';

const readProvider = new JsonRpcProvider('https://mainnet.base.org', CHAIN_ID);

interface ThetanutsContextValue {
  service: ThetanutsService;
}

const ThetanutsContext = createContext<ThetanutsContextValue | null>(null);

export function ThetanutsProvider({ children }: { children: ReactNode }) {
  const { data: walletClient } = useWalletClient();
  const serviceRef = useRef(new ThetanutsService(readProvider));

  useEffect(() => {
    if (!walletClient) return;
    // Convert wagmi walletClient to ethers signer
    const { account, transport } = walletClient;
    const provider = new BrowserProvider(transport);
    provider.getSigner().then((signer) => {
      serviceRef.current.setSigner(signer, account.address);
    });
  }, [walletClient]);

  const value = useMemo(() => ({ service: serviceRef.current }), []);

  return (
    <ThetanutsContext.Provider value={value}>
      {children}
    </ThetanutsContext.Provider>
  );
}

export function useThetanuts() {
  const ctx = useContext(ThetanutsContext);
  if (!ctx) throw new Error('useThetanuts must be used within ThetanutsProvider');
  return ctx;
}
```

- [ ] **Step 3: Delete `src/services/state.ts`**

```bash
rm src/services/state.ts
```

- [ ] **Step 4: Verify it compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: Clean compile or only warnings about unused imports in `main.ts` (which was already deleted).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add LoanContext and ThetanutsContext for React state management"
```

---

### Task 5: Set up wagmi + RainbowKit providers and app layout

**Files:**
- Create: `src/app/providers.tsx`
- Create: `src/app/app/layout.tsx`
- Create: `src/app/app/page.tsx`
- Create: `src/components/ui/ThemeToggle.tsx`
- Create: `src/components/app/Header.tsx`
- Create: `src/components/app/TabNav.tsx`

- [ ] **Step 1: Create `src/app/providers.tsx`**

```tsx
// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { type ReactNode, useState } from 'react';

const config = getDefaultConfig({
  appName: 'Zend Finance',
  projectId: 'aee60801c5765924c0ad1b6c353a416a', // WalletConnect project ID from v1
  chains: [base],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

- [ ] **Step 2: Create `src/components/ui/ThemeToggle.tsx`**

```tsx
// src/components/ui/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-zend-card border border-gray-200 dark:border-zend-border text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      title="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      )}
    </button>
  );
}
```

- [ ] **Step 3: Create `src/components/app/Header.tsx`**

```tsx
// src/components/app/Header.tsx
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="w-11 shrink-0" />
      <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={onOpenSettings}
          className="w-11 h-11 flex items-center justify-center bg-gray-100 dark:bg-zend-card border border-gray-200 dark:border-zend-border text-gray-600 dark:text-gray-400 rounded-xl hover:border-zend-accent hover:text-gray-900 dark:hover:text-white transition-all"
          title="Settings"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/app/TabNav.tsx`**

```tsx
// src/components/app/TabNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'Borrow', href: '/app' },
  { label: 'Loans', href: '/app/loans' },
  { label: 'History', href: '/app/history' },
  { label: 'Lend', href: '/app/lend' },
] as const;

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex mb-6 bg-gray-100 dark:bg-zend-input p-[5px] rounded-[36px] border border-gray-200 dark:border-zend-border gap-1">
      {tabs.map((tab) => {
        const isActive = tab.href === '/app' ? pathname === '/app' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 text-center py-3 px-2 rounded-[30px] font-semibold text-[13px] transition-all ${
              isActive
                ? 'bg-gradient-to-br from-indigo-400 to-zend-accent text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)]'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 5: Create `src/app/app/layout.tsx`**

```tsx
// src/app/app/layout.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Providers } from '@/app/providers';
import { LoanProvider } from '@/context/LoanContext';
import { ThetanutsProvider } from '@/context/ThetanutsContext';
import { Header } from '@/components/app/Header';
import { TabNav } from '@/components/app/TabNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Default to dark theme in app
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  return (
    <Providers>
      <LoanProvider>
        <ThetanutsProvider>
          <main className="min-h-screen bg-white dark:bg-zend-bg text-gray-900 dark:text-gray-50">
            <div className="max-w-app mx-auto px-4 py-6">
              <Header onOpenSettings={() => setSettingsOpen(true)} />
              <TabNav />
              {children}
            </div>
          </main>
        </ThetanutsProvider>
      </LoanProvider>
    </Providers>
  );
}
```

- [ ] **Step 6: Create `src/app/app/page.tsx`**

```tsx
// src/app/app/page.tsx
export default function BorrowPage() {
  return (
    <div className="text-center py-12 text-gray-400 dark:text-gray-500">
      <p className="text-lg font-semibold mb-2">Borrow Tab</p>
      <p className="text-sm">Swap interface coming in next task</p>
    </div>
  );
}
```

- [ ] **Step 7: Run dev server and verify**

```bash
npm run dev
```

Navigate to http://localhost:3000/app. Expected: Dark-themed page with RainbowKit connect button, settings gear, theme toggle, pill-style tab nav (Borrow active), and placeholder text. Tabs navigate between `/app`, `/app/loans`, `/app/history`, `/app/lend`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add wagmi/RainbowKit providers, app layout, header, and tab navigation"
```

---

### Task 6: Build the landing page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/landing/Navbar.tsx`
- Create: `src/components/landing/Hero.tsx`
- Create: `src/components/landing/Features.tsx`
- Create: `src/components/landing/HowItWorks.tsx`
- Create: `src/components/landing/Comparison.tsx`
- Create: `src/components/landing/FAQ.tsx`
- Create: `src/components/landing/TrustBar.tsx`
- Create: `src/components/landing/CTA.tsx`
- Create: `src/components/landing/Footer.tsx`

The landing page matches the live site at `https://zend-finance-production.up.railway.app/`. All content is static — no wallet connection needed.

- [ ] **Step 1: Create `src/components/landing/Navbar.tsx`**

```tsx
// src/components/landing/Navbar.tsx
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4">
      <span className="text-white/80 font-medium">Zend Finance</span>
      <Link
        href="/app"
        className="px-5 py-2 rounded-full bg-[#22d3ee] text-white font-semibold text-sm hover:bg-[#06b6d4] transition-colors"
      >
        Launch App
      </Link>
    </nav>
  );
}
```

- [ ] **Step 2: Create `src/components/landing/Hero.tsx`**

```tsx
// src/components/landing/Hero.tsx
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #c4b5fd 0%, #93c5fd 25%, #e0c3fc 50%, #fde68a 75%, #93c5fd 100%)',
      }}
    >
      {/* Zend Logo */}
      <div className="mb-8">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white">
          <path d="M14 16c0 0 4 4 10 4s10-4 10-4M14 24c0 0 4 4 10 4s10-4 10-4M14 32c0 0 4 4 10 4s10-4 10-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      <h1 className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight">
        Borrow Without<br />Liquidation Risk
      </h1>

      <p className="text-lg text-white/70 mb-10">
        Fixed terms. Predictable repayment. Peace of mind.
      </p>

      <Link
        href="/app"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
      >
        Launch App
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
      </Link>

      <div className="mt-16">
        <p className="text-xs tracking-widest text-white/50 uppercase mb-4">Backed by</p>
        <div className="flex items-center gap-8 text-white/40 text-sm font-medium">
          <span>Polychain Capital</span>
          <span>Deribit</span>
          <span>QCP</span>
          <span>Jump</span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/components/landing/Features.tsx`**

```tsx
// src/components/landing/Features.tsx
const features = [
  { icon: '🛡️', title: 'No Liquidations', desc: "Your collateral is protected. No matter how the market moves, you'll never face forced liquidation." },
  { icon: '⏰', title: 'Fixed Terms', desc: 'Know exactly what you owe from day one. No surprises, no variable rates eating into your position.' },
  { icon: '📈', title: 'Competitive Rates', desc: 'Lenders compete to offer you the best rates through our RFQ system, driving down your borrowing costs.' },
  { icon: '📦', title: 'Options Protection', desc: 'Built-in put options give you the right to reclaim your collateral at a known price, no matter what.' },
];

export function Features() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Borrowing, reimagined</h2>
        <p className="text-gray-500 text-lg">Traditional DeFi lending means constant liquidation anxiety. Zend changes everything.</p>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f) => (
          <div key={f.title} className="bg-gray-50 rounded-2xl p-8">
            <div className="text-2xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `src/components/landing/HowItWorks.tsx`**

```tsx
// src/components/landing/HowItWorks.tsx
const steps = [
  { num: '01', title: 'Deposit Collateral', desc: 'Deposit ETH or BTC as collateral. Your assets remain yours \u2014 we never take custody.' },
  { num: '02', title: 'Request a Quote', desc: 'Specify your loan amount and term. Lenders compete to offer you the best rates.' },
  { num: '03', title: 'Accept & Borrow', desc: 'Choose the best offer and receive your loan instantly. Fixed terms, no surprises.' },
  { num: '04', title: 'Repay & Reclaim', desc: 'Repay your loan at maturity to reclaim your collateral. Or walk away \u2014 your choice.' },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
        <p className="text-gray-500 text-lg">Four simple steps to liquidation-free borrowing</p>
      </div>
      <div className="max-w-2xl mx-auto space-y-12">
        {steps.map((s) => (
          <div key={s.num} className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center font-bold text-sm shrink-0">
              {s.num}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-12">Built on Thetanuts V4 RFQ \u2014 enterprise-grade options infrastructure</p>
    </section>
  );
}
```

- [ ] **Step 5: Create `src/components/landing/Comparison.tsx`**

```tsx
// src/components/landing/Comparison.tsx
const rows = [
  { feature: 'Liquidation Risk', zend: 'None', others: 'High' },
  { feature: 'Repayment Terms', zend: 'Fixed', others: 'Variable' },
  { feature: 'Rate Certainty', zend: 'Locked in', others: 'Fluctuates' },
  { feature: 'Margin Calls', zend: 'Never', others: 'Frequent' },
  { feature: 'Price Protection', zend: 'Built-in options', others: 'None' },
  { feature: 'Custody', zend: 'Non-custodial', others: 'Non-custodial' },
];

export function Comparison() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Zend vs Traditional DeFi Lending</h2>
        <p className="text-gray-500 text-lg">See why borrowers are switching to liquidation-free loans</p>
      </div>
      <div className="max-w-3xl mx-auto bg-gray-50 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-3 px-8 py-4 text-sm text-gray-400 border-b border-gray-200">
          <span>Feature</span>
          <span className="text-center text-[#22d3ee] font-semibold">Zend</span>
          <span className="text-center">Others</span>
        </div>
        {rows.map((r) => (
          <div key={r.feature} className="grid grid-cols-3 px-8 py-5 border-b border-gray-100 last:border-0">
            <span className="font-semibold text-gray-900 text-sm">{r.feature}</span>
            <span className="text-center text-emerald-500 text-sm flex items-center justify-center gap-1">
              {r.zend !== r.others && <span>✓</span>}
              {r.zend}
            </span>
            <span className="text-center text-gray-400 text-sm">{r.others}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create `src/components/landing/FAQ.tsx`**

```tsx
// src/components/landing/FAQ.tsx
'use client';

import { Disclosure } from '@headlessui/react';

const faqs = [
  { q: 'How is liquidation-free borrowing possible?', a: "When you deposit collateral, lenders simultaneously sell you a put option at your loan's strike price. This gives you the right \u2014 but not obligation \u2014 to sell your collateral at that price. If the market drops, you can simply walk away, keeping your loan while the lender keeps your collateral. No forced liquidations, ever." },
  { q: 'What happens if my collateral value drops?', a: "Nothing happens to your position. Unlike traditional lending where a price drop triggers liquidation, Zend's options-based structure means you're protected. You can choose to repay and reclaim your collateral, or walk away if it's worth less than your loan." },
  { q: 'What collateral types are supported?', a: 'Zend currently supports ETH and BTC as collateral. We\'re working on expanding to additional assets based on liquidity and demand.' },
  { q: 'How are loan terms determined?', a: 'You specify your desired loan amount and term, then lenders compete to offer you rates through our RFQ (Request for Quote) system. You choose the best offer \u2014 no negotiation required.' },
  { q: 'Is Zend non-custodial?', a: 'Yes. Your collateral is held in smart contracts, not by Zend. You maintain full control and can interact directly with the protocol.' },
  { q: 'What blockchain is Zend built on?', a: 'Zend is built on Thetanuts V4 RFQ infrastructure, leveraging enterprise-grade options mechanics with anti-front-running protection.' },
];

export function FAQ() {
  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
        <p className="text-gray-500 text-lg">Everything you need to know about liquidation-free borrowing</p>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq) => (
          <Disclosure key={faq.q}>
            {({ open }) => (
              <div className="border-b border-gray-200">
                <Disclosure.Button className="w-full flex justify-between items-center py-5 text-left">
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Disclosure.Button>
                <Disclosure.Panel className="pb-5 text-gray-500 text-sm leading-relaxed">
                  {faq.a}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Create `src/components/landing/TrustBar.tsx`**

```tsx
// src/components/landing/TrustBar.tsx
const badges = [
  { icon: '🔒', label: 'Audited' },
  { icon: '🏛️', label: 'Non-custodial' },
  { icon: '⚡', label: 'Built on Thetanuts V4' },
  { icon: '🌐', label: '24/7 Access' },
];

export function TrustBar() {
  return (
    <div className="flex flex-wrap justify-center gap-8 py-12 px-4 bg-white border-t border-gray-100">
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-2 text-sm text-gray-500">
          <span>{b.icon}</span>
          <span>{b.label}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Create `src/components/landing/CTA.tsx`**

```tsx
// src/components/landing/CTA.tsx
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-24 px-4 bg-gray-50 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready for peace of mind?</h2>
      <p className="text-gray-500 text-lg mb-10">Join thousands of borrowers who sleep soundly knowing their positions are safe.</p>
      <Link
        href="/app"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#22d3ee] text-white font-semibold text-lg hover:bg-[#06b6d4] transition-colors"
      >
        Start Borrowing
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
      </Link>
    </section>
  );
}
```

- [ ] **Step 9: Create `src/components/landing/Footer.tsx`**

```tsx
// src/components/landing/Footer.tsx
export function Footer() {
  return (
    <footer className="py-8 px-4 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">Zend Finance</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://docs.zend.fi" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Docs</a>
          <a href="https://twitter.com/zaborrowfi" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://discord.gg/zend" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
          </a>
        </div>
        <p className="text-xs text-gray-400">&copy; 2026 Zend Finance</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 10: Update `src/app/page.tsx` to compose all sections**

```tsx
// src/app/page.tsx
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Comparison } from '@/components/landing/Comparison';
import { FAQ } from '@/components/landing/FAQ';
import { TrustBar } from '@/components/landing/TrustBar';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Comparison />
      <FAQ />
      <TrustBar />
      <CTA />
      <Footer />
    </>
  );
}
```

- [ ] **Step 11: Verify landing page renders**

```bash
npm run dev
```

Navigate to http://localhost:3000. Expected: Full landing page with hero gradient, features grid, how-it-works steps, comparison table, FAQ accordion, trust bar, CTA, and footer. "Launch App" links navigate to `/app`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: build complete landing page with all sections"
```

---

### Task 7: Build SwapInterface (Borrow tab core)

**Files:**
- Create: `src/components/app/SwapInterface.tsx`
- Create: `src/components/app/DepositPanel.tsx`
- Create: `src/components/app/ReceivePanel.tsx`
- Create: `src/components/app/PaybackPanel.tsx`
- Modify: `src/app/app/page.tsx`

- [ ] **Step 1: Create `src/components/app/DepositPanel.tsx`**

```tsx
// src/components/app/DepositPanel.tsx
'use client';

import { LOAN_ASSETS, type AssetKey } from '@/services/constants';
import { useLoanContext } from '@/context/LoanContext';

interface Props {
  amount: string;
  onAmountChange: (v: string) => void;
  balance: string;
  onOpenCollateralModal: () => void;
}

export function DepositPanel({ amount, onAmountChange, balance, onOpenCollateralModal }: Props) {
  const { state } = useLoanContext();
  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];

  return (
    <div className="bg-gray-100 dark:bg-zend-card rounded-2xl p-5 border border-gray-200 dark:border-zend-border">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Deposit</div>
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="flex-1 bg-transparent text-2xl font-medium text-gray-900 dark:text-white outline-none placeholder-gray-300 dark:placeholder-gray-600"
          placeholder="0.0"
        />
        <button
          onClick={onOpenCollateralModal}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zend-input rounded-xl border border-gray-200 dark:border-zend-border hover:border-zend-accent transition-colors shrink-0"
        >
          <span className="text-lg">{asset.icon}</span>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">{asset.symbol}</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Balance: {balance} {asset.symbol}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/app/ReceivePanel.tsx`**

```tsx
// src/components/app/ReceivePanel.tsx
'use client';

interface Props {
  amount: string;
  onOpenStrikeModal: () => void;
}

export function ReceivePanel({ amount, onOpenStrikeModal }: Props) {
  return (
    <div className="bg-gray-100 dark:bg-zend-card rounded-2xl p-5 border border-gray-200 dark:border-zend-border">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Receive</div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1 text-2xl font-medium text-gray-900 dark:text-white">
          {amount || '0.00'}
        </span>
        <button
          onClick={onOpenStrikeModal}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zend-input rounded-xl border border-gray-200 dark:border-zend-border hover:border-zend-accent transition-colors shrink-0"
        >
          <span className="text-lg">$</span>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">USDC</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/app/PaybackPanel.tsx`**

```tsx
// src/components/app/PaybackPanel.tsx
'use client';

interface Props {
  expiryDate: string;
  repayAmount: string;
  effectiveApr: string;
}

export function PaybackPanel({ expiryDate, repayAmount, effectiveApr }: Props) {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/50">
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="text-gray-600 dark:text-gray-400">Payback on {expiryDate}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{repayAmount}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Effective APR</span>
        <span className="font-semibold text-emerald-500">{effectiveApr}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/app/SwapInterface.tsx`**

```tsx
// src/components/app/SwapInterface.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import { LOAN_ASSETS, HOURS_PER_YEAR, type AssetKey } from '@/services/constants';
import { formatDate } from '@/services/formatting';
import { DepositPanel } from './DepositPanel';
import { ReceivePanel } from './ReceivePanel';
import { PaybackPanel } from './PaybackPanel';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

interface Props {
  onReview: () => void;
  onOpenCollateralModal: () => void;
  onOpenStrikeModal: () => void;
}

export function SwapInterface({ onReview, onOpenCollateralModal, onOpenStrikeModal }: Props) {
  const { state } = useLoanContext();
  const { service } = useThetanuts();
  const { address } = useAccount();
  const [depositAmount, setDepositAmount] = useState('0.001');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [balance, setBalance] = useState('--');
  const [repayAmount, setRepayAmount] = useState('--');
  const [expiryDate, setExpiryDate] = useState('--');
  const [effectiveApr, setEffectiveApr] = useState('--');

  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];

  // Fetch balance
  useEffect(() => {
    if (!address || !asset) return;
    service.getBalance(asset.collateral).then((bal) => {
      setBalance(parseFloat(ethers.formatUnits(bal, asset.decimals)).toFixed(6));
    }).catch(() => setBalance('--'));
  }, [address, asset, service]);

  // Calculate receive amount
  useEffect(() => {
    const deposit = parseFloat(depositAmount) || 0;
    const strike = state.selectedStrike;
    const expiry = state.selectedExpiry;

    if (deposit <= 0 || !strike || !expiry) {
      setReceiveAmount('');
      setRepayAmount('--');
      setExpiryDate('--');
      setEffectiveApr('--');
      return;
    }

    const receiveEstimate = deposit * strike * 0.95;
    const repay = deposit * strike;
    const now = Math.floor(Date.now() / 1000);
    const hoursToExpiry = (expiry - now) / 3600;
    const apr = ((repay / receiveEstimate - 1) * HOURS_PER_YEAR) / hoursToExpiry * 100;

    setReceiveAmount(receiveEstimate.toFixed(2));
    setRepayAmount(`${repay.toFixed(2)} USDC`);
    setExpiryDate(formatDate(expiry));
    setEffectiveApr(`${apr.toFixed(1)}%`);
  }, [depositAmount, state.selectedStrike, state.selectedExpiry]);

  const canReview = receiveAmount !== '' && state.selectedStrike && state.selectedExpiry;

  return (
    <div className="flex flex-col gap-0">
      <DepositPanel
        amount={depositAmount}
        onAmountChange={setDepositAmount}
        balance={balance}
        onOpenCollateralModal={onOpenCollateralModal}
      />

      {/* Arrow Down */}
      <div className="flex justify-center -my-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-white dark:bg-zend-bg border-4 border-white dark:border-zend-bg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      <ReceivePanel amount={receiveAmount} onOpenStrikeModal={onOpenStrikeModal} />

      {/* Arrow Down */}
      <div className="flex justify-center -my-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-white dark:bg-zend-bg border-4 border-white dark:border-zend-bg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      <PaybackPanel expiryDate={expiryDate} repayAmount={repayAmount} effectiveApr={effectiveApr} />

      <button
        onClick={onReview}
        disabled={!canReview}
        className="mt-6 w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-br from-indigo-400 to-zend-accent hover:from-indigo-500 hover:to-zend-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)]"
      >
        Review
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Update `src/app/app/page.tsx`**

```tsx
// src/app/app/page.tsx
'use client';

import { useState } from 'react';
import { SwapInterface } from '@/components/app/SwapInterface';

export default function BorrowPage() {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [collateralOpen, setCollateralOpen] = useState(false);
  const [strikeOpen, setStrikeOpen] = useState(false);

  return (
    <SwapInterface
      onReview={() => setReviewOpen(true)}
      onOpenCollateralModal={() => setCollateralOpen(true)}
      onOpenStrikeModal={() => setStrikeOpen(true)}
    />
  );
}
```

- [ ] **Step 6: Verify borrow tab renders**

```bash
npm run dev
```

Navigate to http://localhost:3000/app. Expected: Swap interface with Deposit panel (input + ETH selector), arrow, Receive panel (USDC), arrow, Payback panel (blue tint), and Review button.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: build SwapInterface with Deposit, Receive, and Payback panels"
```

---

### Task 8: Build modals (Settings, Collateral, Strike, Review)

**Files:**
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/app/modals/SettingsModal.tsx`
- Create: `src/components/app/modals/CollateralModal.tsx`
- Create: `src/components/app/modals/StrikeModal.tsx`
- Create: `src/components/app/modals/ReviewModal.tsx`
- Modify: `src/app/app/page.tsx`
- Modify: `src/app/app/layout.tsx`

- [ ] **Step 1: Create `src/components/ui/Modal.tsx`**

```tsx
// src/components/ui/Modal.tsx
'use client';

import { Dialog } from '@headlessui/react';
import { type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white dark:bg-zend-card rounded-2xl border border-gray-200 dark:border-zend-border shadow-xl">
          <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-zend-border">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">{title}</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-5">{children}</div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 2: Create `src/components/app/modals/SettingsModal.tsx`**

```tsx
// src/components/app/modals/SettingsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useLoanContext } from '@/context/LoanContext';

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, updateSettings, clearAll } = useLoanContext();
  const [minDays, setMinDays] = useState(state.settings.minDurationDays);
  const [maxStrikes, setMaxStrikes] = useState(state.settings.maxStrikes);
  const [maxApr, setMaxApr] = useState(state.settings.maxApr);
  const [keepOpen, setKeepOpen] = useState(state.settings.keepOrderOpen);

  useEffect(() => {
    if (open) {
      setMinDays(state.settings.minDurationDays);
      setMaxStrikes(state.settings.maxStrikes);
      setMaxApr(state.settings.maxApr);
      setKeepOpen(state.settings.keepOrderOpen);
    }
  }, [open, state.settings]);

  function save() {
    updateSettings({ minDurationDays: minDays, maxStrikes, maxApr, keepOrderOpen: keepOpen });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Show options expiring in (days)</label>
          <input type="number" value={minDays} onChange={(e) => setMinDays(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-zend-input border border-gray-200 dark:border-zend-border text-gray-900 dark:text-white text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Max strikes per expiry</label>
          <input type="number" value={maxStrikes} onChange={(e) => setMaxStrikes(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-zend-input border border-gray-200 dark:border-zend-border text-gray-900 dark:text-white text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Maximum APR: {maxApr}%</label>
          <input type="range" min={5} max={30} value={maxApr} onChange={(e) => setMaxApr(Number(e.target.value))} className="w-full" />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Keep order open</label>
          <button onClick={() => setKeepOpen(!keepOpen)} className={`w-11 h-6 rounded-full transition-colors ${keepOpen ? 'bg-zend-accent' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${keepOpen ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
          </button>
        </div>
        <button onClick={save} className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-indigo-400 to-zend-accent hover:from-indigo-500 hover:to-zend-accent-hover transition-all">Save Settings</button>
        <div className="border-t border-gray-100 dark:border-zend-border pt-4">
          <p className="text-xs text-gray-400 mb-3">If data appears corrupted, clearing local storage may help.</p>
          <button onClick={() => { clearAll(); onClose(); }} className="text-sm text-red-500 hover:text-red-400 transition-colors">Clear Local Storage</button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Create `src/components/app/modals/CollateralModal.tsx`**

```tsx
// src/components/app/modals/CollateralModal.tsx
'use client';

import { Modal } from '@/components/ui/Modal';
import { LOAN_ASSETS } from '@/services/constants';
import { useLoanContext } from '@/context/LoanContext';

export function CollateralModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setCollateral } = useLoanContext();

  return (
    <Modal open={open} onClose={onClose} title="Select Collateral">
      <div className="space-y-2">
        {Object.entries(LOAN_ASSETS).map(([key, asset]) => (
          <button
            key={key}
            onClick={() => { setCollateral(key as 'WETH' | 'CBBTC'); onClose(); }}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
              state.selectedCollateral === key
                ? 'border-zend-accent bg-indigo-50 dark:bg-indigo-950/20'
                : 'border-gray-200 dark:border-zend-border hover:border-zend-accent'
            }`}
          >
            <span className="text-2xl">{asset.icon}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{asset.symbol}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Create `src/components/app/modals/StrikeModal.tsx`**

```tsx
// src/components/app/modals/StrikeModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import type { StrikeOption } from '@/types';
import type { AssetKey } from '@/services/constants';

export function StrikeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setStrike, setExpiry } = useLoanContext();
  const { service } = useThetanuts();
  const [options, setOptions] = useState<StrikeOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const { minDurationDays, maxStrikes, maxApr } = state.settings;
    service
      .getStrikeOptions(state.selectedCollateral as AssetKey, minDurationDays, maxStrikes, maxApr)
      .then(setOptions)
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, [open, state.selectedCollateral, state.settings, service]);

  return (
    <Modal open={open} onClose={onClose} title="Select Strike & Expiry">
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : options.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No options available. Try adjusting settings.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={`${opt.strike}-${opt.expiry}`}
              onClick={() => { setStrike(opt.strike); setExpiry(opt.expiry); onClose(); }}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-zend-border hover:border-zend-accent transition-all"
            >
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">{opt.strikeFormatted}</div>
                <div className="text-xs text-gray-400">{opt.expiryFormatted}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-emerald-500">{opt.effectiveApr.toFixed(1)}% APR</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
```

- [ ] **Step 5: Create `src/components/app/modals/ReviewModal.tsx`**

```tsx
// src/components/app/modals/ReviewModal.tsx
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import { LOAN_ASSETS, STRIKE_DECIMALS, type AssetKey } from '@/services/constants';
import { formatDate } from '@/services/formatting';
import { ethers } from 'ethers';

interface Props {
  open: boolean;
  onClose: () => void;
  depositAmount: string;
  receiveAmount: string;
  onConfirmed: () => void;
}

export function ReviewModal({ open, onClose, depositAmount, receiveAmount, onConfirmed }: Props) {
  const { state, setActiveRequest } = useLoanContext();
  const { service } = useThetanuts();
  const [submitting, setSubmitting] = useState(false);

  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];
  const strike = state.selectedStrike;
  const expiry = state.selectedExpiry;

  if (!asset || !strike || !expiry) return null;

  const deposit = parseFloat(depositAmount) || 0;
  const repay = deposit * strike;

  async function confirm() {
    setSubmitting(true);
    try {
      const collateralAmount = ethers.parseUnits(deposit.toString(), asset.decimals);
      const strikeBig = BigInt(Math.round(strike! * 10 ** STRIKE_DECIMALS));
      const minSettlement = ethers.parseUnits(receiveAmount, 6);

      const { receipt } = await service.requestLoan({
        assetKey: state.selectedCollateral as AssetKey,
        collateralAmount,
        strike: strikeBig,
        expiryTimestamp: expiry!,
        minSettlementAmount: minSettlement,
        keepOrderOpen: state.settings.keepOrderOpen,
      });

      onClose();
      onConfirmed();
    } catch (err: any) {
      alert(err.message || 'Failed to submit loan request');
    } finally {
      setSubmitting(false);
    }
  }

  const rows = [
    ['Deposit', `${deposit} ${asset.symbol}`],
    ['Receive', `${receiveAmount} USDC`],
    ['Strike', `$${strike.toLocaleString()}`],
    ['Expiry', formatDate(expiry)],
    ['Repayment', `${repay.toFixed(2)} USDC`],
  ];

  return (
    <Modal open={open} onClose={onClose} title="Review Loan">
      <div className="space-y-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
          </div>
        ))}
        <p className="text-xs text-gray-400 mt-4">European option: exercise only at expiry within 1-hour window. No early repayment.</p>
        <button
          onClick={confirm}
          disabled={submitting}
          className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-br from-indigo-400 to-zend-accent hover:from-indigo-500 hover:to-zend-accent-hover disabled:opacity-50 transition-all mt-4"
        >
          {submitting ? 'Submitting...' : 'Confirm Loan Request'}
        </button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 6: Update `src/app/app/page.tsx` to wire up modals**

```tsx
// src/app/app/page.tsx
'use client';

import { useState } from 'react';
import { SwapInterface } from '@/components/app/SwapInterface';
import { CollateralModal } from '@/components/app/modals/CollateralModal';
import { StrikeModal } from '@/components/app/modals/StrikeModal';
import { ReviewModal } from '@/components/app/modals/ReviewModal';

export default function BorrowPage() {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [collateralOpen, setCollateralOpen] = useState(false);
  const [strikeOpen, setStrikeOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('0.001');
  const [receiveAmount, setReceiveAmount] = useState('');

  return (
    <>
      <SwapInterface
        onReview={() => setReviewOpen(true)}
        onOpenCollateralModal={() => setCollateralOpen(true)}
        onOpenStrikeModal={() => setStrikeOpen(true)}
      />
      <CollateralModal open={collateralOpen} onClose={() => setCollateralOpen(false)} />
      <StrikeModal open={strikeOpen} onClose={() => setStrikeOpen(false)} />
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        depositAmount={depositAmount}
        receiveAmount={receiveAmount}
        onConfirmed={() => {}}
      />
    </>
  );
}
```

- [ ] **Step 7: Wire SettingsModal into app layout**

Update `src/app/app/layout.tsx` — add SettingsModal import and render it with the `settingsOpen` state that's already there:

Add after `TabNav` inside the layout:
```tsx
import { SettingsModal } from '@/components/app/modals/SettingsModal';

// Inside the return, after {children}:
<SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
```

- [ ] **Step 8: Verify modals work**

```bash
npm run dev
```

Navigate to http://localhost:3000/app. Click the ETH button to open collateral selector. Click the USDC button to open strike selector. Click settings gear to open settings. All modals should open/close properly.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Settings, Collateral, Strike, and Review modals"
```

---

### Task 9: Build Loans and History pages

**Files:**
- Create: `src/components/app/LoanCard.tsx`
- Create: `src/components/app/HistoryCard.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/app/app/loans/page.tsx`
- Create: `src/app/app/history/page.tsx`

- [ ] **Step 1: Create `src/components/ui/Badge.tsx`**

```tsx
// src/components/ui/Badge.tsx
const variants: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  competing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  settled: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  action: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  exercised: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  declined: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function Badge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase ${variants[status] || variants.cancelled}`}>
      {status}
    </span>
  );
}
```

- [ ] **Step 2: Create `src/components/app/LoanCard.tsx`**

```tsx
// src/components/app/LoanCard.tsx
'use client';

import { Badge } from '@/components/ui/Badge';
import { LOAN_ASSETS, STRIKE_DECIMALS } from '@/services/constants';
import { formatDate } from '@/services/formatting';
import { ethers } from 'ethers';
import type { Loan } from '@/types';

interface Props {
  loan: Loan;
  onExercise: (addr: string) => void;
  onDoNotExercise: (addr: string) => void;
  onCancel: (id: string) => void;
}

export function LoanCard({ loan, onExercise, onDoNotExercise, onCancel }: Props) {
  const asset = Object.entries(LOAN_ASSETS).find(
    ([_, a]) => a.collateral.toLowerCase() === loan.collateralToken.toLowerCase()
  );
  const symbol = asset ? asset[1].symbol : '?';
  const decimals = asset ? asset[1].decimals : 18;
  const collateral = ethers.formatUnits(loan.collateralAmount, decimals);
  const strike = (Number(loan.strike) / 10 ** STRIKE_DECIMALS).toLocaleString();

  const now = Math.floor(Date.now() / 1000);
  const inExerciseWindow = now >= loan.expiryTimestamp && now < loan.expiryTimestamp + 3600;

  const displayStatus = inExerciseWindow ? 'action' : loan.status;

  return (
    <div className="bg-gray-50 dark:bg-zend-card rounded-2xl p-5 border border-gray-200 dark:border-zend-border mb-3">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-900 dark:text-white">{parseFloat(collateral).toFixed(6)} {symbol}</span>
        <Badge status={displayStatus} />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Strike</span><span className="text-gray-900 dark:text-white">${strike}</span></div>
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Expiry</span><span className="text-gray-900 dark:text-white">{formatDate(loan.expiryTimestamp)}</span></div>
      </div>
      {inExerciseWindow && loan.optionAddress && (
        <div className="flex gap-2 mt-4">
          <button onClick={() => onExercise(loan.optionAddress!)} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors">Exercise</button>
          <button onClick={() => onDoNotExercise(loan.optionAddress!)} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors">Decline</button>
        </div>
      )}
      {loan.status === 'competing' && (
        <button onClick={() => onCancel(loan.quotationId.toString())} className="w-full mt-4 py-2 rounded-xl border border-gray-200 dark:border-zend-border text-gray-500 dark:text-gray-400 font-semibold text-sm hover:border-red-500 hover:text-red-500 transition-colors">Cancel</button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/app/loans/page.tsx`**

```tsx
// src/app/app/loans/page.tsx
'use client';

import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import { LoanCard } from '@/components/app/LoanCard';

export default function LoansPage() {
  const { getActiveLoans, removeLoan, setLoanStatus } = useLoanContext();
  const { service } = useThetanuts();
  const loans = getActiveLoans();

  async function handleExercise(addr: string) {
    try { await service.exerciseOption(addr); } catch (e: any) { alert(e.message); }
  }
  async function handleDoNotExercise(addr: string) {
    if (!confirm('Forfeit your collateral? You keep the borrowed USDC.')) return;
    try { await service.doNotExercise(addr); } catch (e: any) { alert(e.message); }
  }
  async function handleCancel(id: string) {
    if (!confirm('Cancel this loan request?')) return;
    try { await service.cancelLoan(BigInt(id)); removeLoan(id); } catch (e: any) { alert(e.message); }
  }

  if (loans.length === 0) {
    return <p className="text-center py-12 text-gray-400 dark:text-gray-500">No active loans found.</p>;
  }

  return (
    <div>
      {loans.map((loan) => (
        <LoanCard key={loan.quotationId.toString()} loan={loan} onExercise={handleExercise} onDoNotExercise={handleDoNotExercise} onCancel={handleCancel} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/app/HistoryCard.tsx`**

```tsx
// src/components/app/HistoryCard.tsx
import { Badge } from '@/components/ui/Badge';
import type { Loan } from '@/types';

export function HistoryCard({ loan }: { loan: Loan }) {
  return (
    <div className="bg-gray-50 dark:bg-zend-card rounded-2xl p-5 border border-gray-200 dark:border-zend-border mb-3">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-900 dark:text-white">Loan #{loan.quotationId.toString()}</span>
        <Badge status={loan.status} />
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">Created</span>
        <span className="text-gray-900 dark:text-white">{new Date(loan.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/app/app/history/page.tsx`**

```tsx
// src/app/app/history/page.tsx
'use client';

import { useLoanContext } from '@/context/LoanContext';
import { HistoryCard } from '@/components/app/HistoryCard';

export default function HistoryPage() {
  const { getHistoryLoans } = useLoanContext();
  const loans = getHistoryLoans();

  if (loans.length === 0) {
    return <p className="text-center py-12 text-gray-400 dark:text-gray-500">No loan history.</p>;
  }

  return (
    <div>
      {loans.map((loan) => (
        <HistoryCard key={loan.quotationId.toString()} loan={loan} />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Verify loans and history tabs**

Navigate to http://localhost:3000/app/loans and /app/history. Expected: "No active loans" and "No loan history" messages.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Loans and History pages with LoanCard and HistoryCard components"
```

---

### Task 10: Build Lend page

**Files:**
- Create: `src/components/app/LendTable.tsx`
- Create: `src/app/app/lend/page.tsx`

- [ ] **Step 1: Create `src/components/app/LendTable.tsx`**

```tsx
// src/components/app/LendTable.tsx
'use client';

import { LOAN_ASSETS } from '@/services/constants';
import { formatUsdc } from '@/services/formatting';
import { ethers } from 'ethers';
import type { Loan } from '@/types';

export function LendTable({ loans }: { loans: Loan[] }) {
  if (loans.length === 0) {
    return <p className="text-center py-12 text-gray-400 dark:text-gray-500">No lending opportunities available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-zend-border">
            <th className="text-left py-3 font-medium">Asset</th>
            <th className="text-right py-3 font-medium">Lend</th>
            <th className="text-right py-3 font-medium">Receive</th>
            <th className="text-center py-3 font-medium">APR</th>
            <th className="text-center py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => {
            const asset = Object.entries(LOAN_ASSETS).find(
              ([_, a]) => a.collateral.toLowerCase() === loan.collateralToken.toLowerCase()
            );
            const symbol = asset ? asset[1].symbol : '?';
            const decimals = asset ? asset[1].decimals : 18;

            return (
              <tr key={loan.quotationId.toString()} className="border-b border-gray-100 dark:border-zend-border/50">
                <td className="py-3 font-semibold text-gray-900 dark:text-white">{symbol}</td>
                <td className="py-3 text-right text-gray-900 dark:text-white">{formatUsdc(loan.minSettlementAmount)} USDC</td>
                <td className="py-3 text-right text-gray-900 dark:text-white">{ethers.formatUnits(loan.collateralAmount, decimals)} {symbol}</td>
                <td className="py-3 text-center text-emerald-500">--</td>
                <td className="py-3 text-center">
                  <button className="px-3 py-1 rounded-lg bg-zend-accent text-white text-xs font-semibold hover:bg-zend-accent-hover transition-colors">Lend</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/app/lend/page.tsx`**

```tsx
// src/app/app/lend/page.tsx
'use client';

import { useState } from 'react';
import { useLoanContext } from '@/context/LoanContext';
import { LendTable } from '@/components/app/LendTable';
import { useAccount } from 'wagmi';

export default function LendPage() {
  const { getLendingOpportunities } = useLoanContext();
  const { address } = useAccount();
  const [filter, setFilter] = useState('all');

  const opportunities = getLendingOpportunities(address);
  const filtered = filter === 'all' ? opportunities : opportunities.filter((l) => {
    const token = l.collateralToken.toLowerCase();
    if (filter === 'WETH') return token === '0x4200000000000000000000000000000000000006';
    if (filter === 'CBBTC') return token === '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf';
    return true;
  });

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-zend-input border border-gray-200 dark:border-zend-border text-gray-900 dark:text-white text-sm">
          <option value="all">All Assets</option>
          <option value="WETH">ETH</option>
          <option value="CBBTC">BTC</option>
        </select>
      </div>
      <LendTable loans={filtered} />
    </div>
  );
}
```

- [ ] **Step 3: Verify lend tab**

Navigate to http://localhost:3000/app/lend. Expected: Filter dropdown + "No lending opportunities" message.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Lend page with LendTable and asset filter"
```

---

### Task 11: Final verification and cleanup

**Files:**
- Modify: `CLAUDE.md`
- Modify: `package.json`

- [ ] **Step 1: Update CLAUDE.md for Next.js**

Replace the Commands section:

```markdown
## Commands

\`\`\`bash
npm run dev      # Next.js dev server on http://localhost:3000
npm run build    # Next.js production build
npm start        # Start production server
\`\`\`
```

Update the Technology Stack section to reflect Next.js, Tailwind, RainbowKit, wagmi.

Update the Directory Structure section to match the new `src/app/`, `src/components/`, `src/context/`, etc.

- [ ] **Step 2: Ensure clean build**

```bash
npm run build
```

Expected: Build succeeds. May have warnings about SDK Node.js imports — those are expected and handled by `next.config.ts`.

- [ ] **Step 3: Test all routes**

```bash
npm run dev
```

Test:
- http://localhost:3000 — landing page with all sections
- http://localhost:3000/app — borrow tab with swap interface
- http://localhost:3000/app/loans — loans tab
- http://localhost:3000/app/history — history tab
- http://localhost:3000/app/lend — lend tab
- Tab navigation works
- Theme toggle works
- Settings modal opens/saves
- Collateral selector opens
- Strike selector opens
- RainbowKit connect button renders

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: update CLAUDE.md for Next.js and final cleanup"
```
