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
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200">
      <div className="text-xs text-gray-400 mb-2">Deposit</div>
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="flex-1 bg-transparent text-2xl font-medium text-gray-900 outline-none placeholder-gray-300 min-h-[44px]"
          placeholder="0.0"
        />
        <button
          onClick={onOpenCollateralModal}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 hover:border-zend-blue/40 focus:border-zend-blue/50 transition-colors shrink-0"
        >
          <span className="text-lg">{asset.icon}</span>
          <span className="font-semibold text-sm text-gray-900">{asset.symbol}</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
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
