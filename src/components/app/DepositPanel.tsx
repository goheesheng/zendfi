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
    <div className="bg-zend-surface rounded-2xl p-5 border border-zend-border shadow-card hover:shadow-card-hover hover:border-zend-border-strong transition-all duration-200 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-zend-electric rounded-l-2xl" />
      <div className="text-xs font-heading font-semibold text-zend-electric uppercase tracking-wider mb-3 pl-2">Deposit</div>
      <div className="flex items-center justify-between gap-3 pl-2">
        <input
          type="text"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="flex-1 bg-transparent text-[28px] font-heading font-bold text-zend-ink outline-none placeholder-zend-ink-muted min-h-[44px]"
          placeholder="0.0"
        />
        <button
          onClick={onOpenCollateralModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-zend-surface-alt rounded-xl border border-zend-border hover:border-zend-electric/40 focus:border-zend-electric/50 transition-all duration-200 shrink-0"
        >
          <span className="text-lg">{asset.icon}</span>
          <span className="font-heading font-semibold text-sm text-zend-ink">{asset.symbol}</span>
          <svg className="w-3 h-3 text-zend-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      <div className="flex items-center justify-between text-xs text-zend-ink-secondary mt-2 pl-2">
        <span>Balance: {balance} {asset.symbol}</span>
        {balance !== '--' && (
          <button
            onClick={() => onAmountChange(balance)}
            className="text-zend-coral hover:text-zend-coral-hover font-semibold transition-colors"
          >
            MAX
          </button>
        )}
      </div>
    </div>
  );
}
