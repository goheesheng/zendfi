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
        <div className="mb-5 px-4 py-3 rounded-xl bg-zend-electric-soft border border-zend-electric/15 text-center">
          <span className="text-xs font-heading font-semibold text-zend-electric">
            Alpha Release — <span className="font-bold">{mmLiquidity} USDC</span> available
          </span>
        </div>
      )}
      <DepositPanel
        amount={depositAmount}
        onAmountChange={onDepositAmountChange}
        balance={collateralBalance}
        onOpenCollateralModal={onOpenCollateralModal}
      />

      <div className="flex justify-center -my-2.5 relative z-10">
        <div className="w-9 h-9 rounded-full bg-zend-surface border-2 border-zend-border flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-zend-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      <ReceivePanel amount={receiveAmount} onOpenStrikeModal={onOpenStrikeModal} />

      <div className="flex justify-center -my-2.5 relative z-10">
        <div className="w-9 h-9 rounded-full bg-zend-surface border-2 border-zend-border flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-zend-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      <PaybackPanel expiryDate={expiryDate} repayAmount={repayAmount} effectiveApr={effectiveApr} />

      <button
        onClick={onReview}
        disabled={!canReview}
        className="mt-7 w-full py-4 rounded-2xl font-heading font-bold text-[15px] tracking-wide text-white bg-coral-gradient disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 shadow-coral-glow hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
      >
        Review Loan
      </button>
    </div>
  );
}
