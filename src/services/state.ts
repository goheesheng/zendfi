// Loan state management - tracks all loans, offers, and UI state

import type { Loan, LoanStatus, OfferInfo, UserSettings, TabId } from '../types';

const STORAGE_KEY = 'zendfi_state';
const SETTINGS_KEY = 'zendfi_settings';
const KEYS_KEY = 'zendfi_signing_keys';

export interface AppState {
  loans: Map<string, Loan>; // quotationId -> Loan
  activeTab: TabId;
  activeLoanRequestId: string | null; // quotationId of in-progress borrow
  selectedCollateral: string;
  selectedStrike: number | null;
  selectedExpiry: number | null;
  connectedAddress: string | null;
  settings: UserSettings;
}

type StateListener = (state: AppState) => void;

class StateManager {
  private state: AppState;
  private listeners: StateListener[] = [];

  constructor() {
    this.state = {
      loans: new Map(),
      activeTab: 'borrow',
      activeLoanRequestId: null,
      selectedCollateral: 'WETH',
      selectedStrike: null,
      selectedExpiry: null,
      connectedAddress: null,
      settings: this.loadSettings(),
    };
    this.loadState();
  }

  getState(): AppState {
    return this.state;
  }

  onChange(listener: StateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }

  // ─── Loan mutations ───

  upsertLoan(quotationId: string, update: Partial<Loan>) {
    const existing = this.state.loans.get(quotationId);
    if (existing) {
      Object.assign(existing, update);
    } else {
      this.state.loans.set(quotationId, {
        quotationId: BigInt(quotationId),
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
        ...update,
      });
    }
    this.persistState();
    this.notify();
  }

  removeLoan(quotationId: string) {
    this.state.loans.delete(quotationId);
    if (this.state.activeLoanRequestId === quotationId) {
      this.state.activeLoanRequestId = null;
    }
    this.persistState();
    this.notify();
  }

  addOffer(quotationId: string, offer: OfferInfo) {
    const loan = this.state.loans.get(quotationId);
    if (loan) {
      const existingIdx = loan.offers.findIndex((o) => o.offeror === offer.offeror);
      if (existingIdx >= 0) {
        loan.offers[existingIdx] = { ...loan.offers[existingIdx], ...offer };
      } else {
        loan.offers.push(offer);
      }
      this.persistState();
      this.notify();
    }
  }

  setLoanStatus(quotationId: string, status: LoanStatus) {
    const loan = this.state.loans.get(quotationId);
    if (loan) {
      loan.status = status;
      this.persistState();
      this.notify();
    }
  }

  // ─── UI state mutations ───

  setActiveTab(tab: TabId) {
    this.state.activeTab = tab;
    this.notify();
  }

  setActiveLoanRequest(quotationId: string | null) {
    this.state.activeLoanRequestId = quotationId;
    this.persistState();
    this.notify();
  }

  setSelectedCollateral(collateral: string) {
    this.state.selectedCollateral = collateral;
    this.notify();
  }

  setSelectedStrike(strike: number | null) {
    this.state.selectedStrike = strike;
    this.notify();
  }

  setSelectedExpiry(expiry: number | null) {
    this.state.selectedExpiry = expiry;
    this.notify();
  }

  setConnectedAddress(address: string | null) {
    this.state.connectedAddress = address;
    this.notify();
  }

  // ─── Settings ───

  updateSettings(partial: Partial<UserSettings>) {
    Object.assign(this.state.settings, partial);
    this.saveSettings();
    this.notify();
  }

  private loadSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      minDurationDays: 30,
      maxStrikes: 5,
      sortOrder: 'highestStrike',
      maxApr: 20,
      keepOrderOpen: true,
    };
  }

  private saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.state.settings));
  }

  // ─── Persistence ───

  private persistState() {
    try {
      const serializable: Record<string, any> = {};
      for (const [id, loan] of this.state.loans) {
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
        JSON.stringify({
          loans: serializable,
          activeLoanRequestId: this.state.activeLoanRequestId,
        })
      );
    } catch (e) {
      console.warn('Failed to persist state:', e);
    }
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (parsed.loans) {
        for (const [id, loan] of Object.entries(parsed.loans as Record<string, any>)) {
          this.state.loans.set(id, {
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
      }
      this.state.activeLoanRequestId = parsed.activeLoanRequestId || null;
    } catch (e) {
      console.warn('Failed to load state, resetting:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  clearAll() {
    this.state.loans.clear();
    this.state.activeLoanRequestId = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  // ─── Computed getters ───

  getActiveLoans(): Loan[] {
    return [...this.state.loans.values()].filter(
      (l) => l.status === 'active' || l.status === 'settled' || l.status === 'competing'
    );
  }

  getHistoryLoans(): Loan[] {
    return [...this.state.loans.values()].filter(
      (l) => l.status === 'exercised' || l.status === 'declined' || l.status === 'expired' || l.status === 'cancelled'
    );
  }

  getLendingOpportunities(): Loan[] {
    return [...this.state.loans.values()].filter(
      (l) => l.status === 'limitOrder' && l.requester !== this.state.connectedAddress
    );
  }

  getUserLoans(): Loan[] {
    if (!this.state.connectedAddress) return [];
    const addr = this.state.connectedAddress.toLowerCase();
    return [...this.state.loans.values()].filter(
      (l) => l.requester.toLowerCase() === addr
    );
  }
}

export const stateManager = new StateManager();
