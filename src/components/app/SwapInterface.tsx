'use client';

import { useState, useEffect } from 'react';
import { useLoanContext } from '@/context/LoanContext';
import { LOAN_ASSETS, type AssetKey } from '@/services/constants';
import { formatDate } from '@/services/formatting';
import type { LoanCalculation } from '@/types';
import { DepositPanel } from './DepositPanel';
import { ReceivePanel } from './ReceivePanel';
import { PaybackPanel } from './PaybackPanel';
import { useBalances } from '@/hooks/useBalances';

interface Props {
  onReview: () => void;
  onOpenCollateralModal: () => void;
  onOpenStrikeModal: () => void;
  depositAmount: string;
  onDepositAmountChange: (v: string) => void;
  receiveAmount: string;
  loanCalc: LoanCalculation | null;
}

export function SwapInterface({ onReview, onOpenCollateralModal, onOpenStrikeModal, depositAmount, onDepositAmountChange, receiveAmount, loanCalc }: Props) {
  const { state } = useLoanContext();
  const { collateralBalance, mmLiquidity } = useBalances();
  const [repayAmount, setRepayAmount] = useState('--');
  const [expiryDate, setExpiryDate] = useState('--');
  const [effectiveApr, setEffectiveApr] = useState('--');

  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];

  useEffect(() => {
    if (!loanCalc || !state.selectedExpiry) {
      setRepayAmount('--');
      setExpiryDate('--');
      setEffectiveApr('--');
      return;
    }
    setRepayAmount(`${loanCalc.repayFormatted} USDC`);
    setExpiryDate(formatDate(state.selectedExpiry));
    setEffectiveApr(`${loanCalc.aprFormatted}%`);
  }, [loanCalc, state.selectedExpiry]);

  const canReview = receiveAmount !== '' && state.selectedStrike && state.selectedExpiry;

  return (
    <div className="flex flex-col gap-0">
      {mmLiquidity !== '--' && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-zend-blue/5 to-purple-500/5 border border-zend-blue/15 text-center">
          <span className="text-xs text-zend-blue font-medium">
            Alpha Release — <span className="font-semibold">{mmLiquidity} USDC</span> available from market makers
          </span>
        </div>
      )}
      <DepositPanel
        amount={depositAmount}
        onAmountChange={onDepositAmountChange}
        balance={collateralBalance}
        onOpenCollateralModal={onOpenCollateralModal}
      />

      <div className="flex justify-center -my-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      <ReceivePanel amount={receiveAmount} onOpenStrikeModal={onOpenStrikeModal} />

      <div className="flex justify-center -my-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      <PaybackPanel expiryDate={expiryDate} repayAmount={repayAmount} effectiveApr={effectiveApr} />

      <button
        onClick={onReview}
        disabled={!canReview}
        className="mt-6 w-full py-4 rounded-2xl font-semibold text-white bg-zend-blue hover:bg-zend-blue-dark disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed transition-all shadow-[0_4px_16px_rgba(93,116,255,0.3)]"
      >
        Review
      </button>
    </div>
  );
}
