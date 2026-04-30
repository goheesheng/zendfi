'use client';

import { LOAN_ASSETS, type AssetKey } from '@/services/constants';
import { useLoanContext } from '@/context/LoanContext';
import { TokenIcon } from '@/components/ui/TokenIcon';

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
    <div className="bg-white dark:bg-zend-card rounded-2xl p-5 border border-zend-accent-soft dark:border-zend-border shadow-sm hover:border-zend-blue/40 hover:shadow-md transition-all duration-200">
      <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">Deposit</div>
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="flex-1 bg-transparent text-2xl font-medium text-gray-900 dark:text-white outline-none placeholder-gray-300 dark:placeholder-gray-600 min-h-[44px]"
          placeholder="0.0"
          aria-label="Deposit amount"
        />
        <button
          onClick={onOpenCollateralModal}
          className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-zend-accent-soft/30 dark:bg-zend-accent-soft/10 rounded-xl border border-zend-accent-soft dark:border-zend-border hover:border-zend-blue/50 focus:border-zend-blue/60 transition-colors shrink-0"
        >
          <TokenIcon symbol={asset.symbol} size={20} />
          <span className="font-semibold text-sm text-gray-900 dark:text-white">{asset.symbol}</span>
          <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
        <span>Balance: {balance} {asset.symbol}</span>
        {balance !== '--' && (
          <button
            onClick={() => onAmountChange(balance)}
            className="text-zend-blue hover:text-zend-blue-dark font-semibold transition-colors"
          >
            MAX
          </button>
        )}
      </div>
    </div>
  );
}
