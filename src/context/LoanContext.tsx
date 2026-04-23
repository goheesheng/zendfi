'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Loan, LoanStatus, OfferInfo, UserSettings } from '@/types';

// ─── Storage keys ───

const STORAGE_KEY = 'zendfi_state';
const SETTINGS_KEY = 'zendfi_settings';

// ─── State shape ───

interface LoanState {
  loans: Map<string, Loan>;
  activeLoanRequestId: string | null;
  selectedCollateral: 'WETH' | 'CBBTC';
  selectedStrike: number | null;
  selectedExpiry: number | null;
  selectedOptionData: { askPrice: number; underlyingPrice: number; expiryLabel: string } | null;  // NEW
  settings: UserSettings;
}

// ─── Actions ───

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
  | { type: 'LOAD_STATE'; loans: Map<string, Loan>; activeLoanRequestId: string | null }
  | { type: 'SET_OPTION_DATA'; data: { askPrice: number; underlyingPrice: number; expiryLabel: string } | null };

// ─── Default settings ───

const DEFAULT_SETTINGS: UserSettings = {
  minDurationDays: 30,
  maxStrikes: 5,
  sortOrder: 'highestStrike',
  maxApr: 20,
  keepOrderOpen: true,
};

// ─── Initial state ───

const initialState: LoanState = {
  loans: new Map(),
  activeLoanRequestId: null,
  selectedCollateral: 'WETH',
  selectedStrike: null,
  selectedExpiry: null,
  selectedOptionData: null,
  settings: DEFAULT_SETTINGS,
};

// ─── Reducer ───

function loanReducer(state: LoanState, action: LoanAction): LoanState {
  switch (action.type) {
    case 'UPSERT_LOAN': {
      const newLoans = new Map(state.loans);
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
      const newLoans = new Map(state.loans);
      newLoans.delete(action.id);
      return {
        ...state,
        loans: newLoans,
        activeLoanRequestId:
          state.activeLoanRequestId === action.id ? null : state.activeLoanRequestId,
      };
    }

    case 'ADD_OFFER': {
      const loan = state.loans.get(action.quotationId);
      if (!loan) return state;
      const newLoans = new Map(state.loans);
      const existingIdx = loan.offers.findIndex((o) => o.offeror === action.offer.offeror);
      const newOffers =
        existingIdx >= 0
          ? loan.offers.map((o, i) =>
              i === existingIdx ? { ...o, ...action.offer } : o
            )
          : [...loan.offers, action.offer];
      newLoans.set(action.quotationId, { ...loan, offers: newOffers });
      return { ...state, loans: newLoans };
    }

    case 'SET_LOAN_STATUS': {
      const loan = state.loans.get(action.id);
      if (!loan) return state;
      const newLoans = new Map(state.loans);
      newLoans.set(action.id, { ...loan, status: action.status });
      return { ...state, loans: newLoans };
    }

    case 'SET_ACTIVE_REQUEST':
      return { ...state, activeLoanRequestId: action.id };

    case 'SET_COLLATERAL':
      return { ...state, selectedCollateral: action.collateral, selectedStrike: null, selectedExpiry: null, selectedOptionData: null };

    case 'SET_STRIKE':
      return { ...state, selectedStrike: action.strike };

    case 'SET_EXPIRY':
      return { ...state, selectedExpiry: action.expiry };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'CLEAR_ALL':
      return { ...state, loans: new Map(), activeLoanRequestId: null };

    case 'LOAD_STATE':
      return { ...state, loans: action.loans, activeLoanRequestId: action.activeLoanRequestId };

    case 'SET_OPTION_DATA':
      return { ...state, selectedOptionData: action.data };

    default:
      return state;
  }
}

// ─── Serialization helpers ───

function persistLoans(loans: Map<string, Loan>, activeLoanRequestId: string | null) {
  try {
    const serializable: Record<string, unknown> = {};
    for (const [id, loan] of loans) {
      serializable[id] = {
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
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ loans: serializable, activeLoanRequestId })
    );
  } catch (e) {
    console.warn('Failed to persist loan state:', e);
  }
}

function loadLoansFromStorage(): { loans: Map<string, Loan>; activeLoanRequestId: string | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { loans: new Map(), activeLoanRequestId: null };

    const parsed = JSON.parse(stored) as {
      loans?: Record<string, any>;
      activeLoanRequestId?: string | null;
    };

    const loans = new Map<string, Loan>();
    if (parsed.loans) {
      for (const [id, loan] of Object.entries(parsed.loans)) {
        loans.set(id, {
          ...loan,
          quotationId: BigInt(loan.quotationId),
          collateralAmount: BigInt(loan.collateralAmount),
          strike: BigInt(loan.strike),
          minSettlementAmount: BigInt(loan.minSettlementAmount),
          netLoanAmount: loan.netLoanAmount ? BigInt(loan.netLoanAmount) : undefined,
          offers: (loan.offers ?? []).map((o: any) => ({
            ...o,
            decryptedAmount: o.decryptedAmount ? BigInt(o.decryptedAmount) : undefined,
            revealedAmount: o.revealedAmount ? BigInt(o.revealedAmount) : undefined,
          })),
        });
      }
    }

    return { loans, activeLoanRequestId: parsed.activeLoanRequestId ?? null };
  } catch (e) {
    console.warn('Failed to load loan state, resetting:', e);
    localStorage.removeItem(STORAGE_KEY);
    return { loans: new Map(), activeLoanRequestId: null };
  }
}

function loadSettingsFromStorage(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...(JSON.parse(stored) as Partial<UserSettings>) };
  } catch {}
  return DEFAULT_SETTINGS;
}

// ─── Context value interface ───

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
  setOptionData: (data: { askPrice: number; underlyingPrice: number; expiryLabel: string } | null) => void;
}

// ─── Context ───

const LoanContext = createContext<LoanContextValue | null>(null);

// ─── Provider ───

export function LoanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loanReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const { loans, activeLoanRequestId } = loadLoansFromStorage();
    const settings = loadSettingsFromStorage();
    dispatch({ type: 'LOAD_STATE', loans, activeLoanRequestId });
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  }, []);

  // Persist loans whenever they change
  useEffect(() => {
    persistLoans(state.loans, state.activeLoanRequestId);
  }, [state.loans, state.activeLoanRequestId]);

  // Persist settings whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (e) {
      console.warn('Failed to persist settings:', e);
    }
  }, [state.settings]);

  // ─── Mutation callbacks ───

  const upsertLoan = useCallback((id: string, data: Partial<Loan>) => {
    dispatch({ type: 'UPSERT_LOAN', id, data });
  }, []);

  const removeLoan = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_LOAN', id });
  }, []);

  const addOffer = useCallback((quotationId: string, offer: OfferInfo) => {
    dispatch({ type: 'ADD_OFFER', quotationId, offer });
  }, []);

  const setLoanStatus = useCallback((id: string, status: LoanStatus) => {
    dispatch({ type: 'SET_LOAN_STATUS', id, status });
  }, []);

  const setActiveRequest = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_REQUEST', id });
  }, []);

  const setCollateral = useCallback((collateral: 'WETH' | 'CBBTC') => {
    dispatch({ type: 'SET_COLLATERAL', collateral });
  }, []);

  const setStrike = useCallback((strike: number | null) => {
    dispatch({ type: 'SET_STRIKE', strike });
  }, []);

  const setExpiry = useCallback((expiry: number | null) => {
    dispatch({ type: 'SET_EXPIRY', expiry });
  }, []);

  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setOptionData = useCallback((data: { askPrice: number; underlyingPrice: number; expiryLabel: string } | null) => dispatch({ type: 'SET_OPTION_DATA', data }), []);

  // ─── Computed getters ───

  const getActiveLoans = useCallback((): Loan[] => {
    return [...state.loans.values()].filter(
      (l) => l.status === 'active' || l.status === 'settled' || l.status === 'competing'
    );
  }, [state.loans]);

  const getHistoryLoans = useCallback((): Loan[] => {
    return [...state.loans.values()].filter(
      (l) =>
        l.status === 'exercised' ||
        l.status === 'declined' ||
        l.status === 'expired' ||
        l.status === 'cancelled'
    );
  }, [state.loans]);

  const getLendingOpportunities = useCallback(
    (address?: string): Loan[] => {
      return [...state.loans.values()].filter(
        (l) => l.status === 'limitOrder' && l.requester !== address
      );
    },
    [state.loans]
  );

  const value: LoanContextValue = {
    state,
    upsertLoan,
    removeLoan,
    addOffer,
    setLoanStatus,
    setActiveRequest,
    setCollateral,
    setStrike,
    setExpiry,
    updateSettings,
    clearAll,
    getActiveLoans,
    getHistoryLoans,
    getLendingOpportunities,
    setOptionData,
  };

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
}

// ─── Hook ───

export function useLoanContext(): LoanContextValue {
  const ctx = useContext(LoanContext);
  if (!ctx) throw new Error('useLoanContext must be used within LoanProvider');
  return ctx;
}
