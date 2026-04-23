'use client';

import { useState, useEffect } from 'react';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import { LOAN_ASSETS, type AssetKey } from '@/services/constants';
import { formatDate } from '@/services/formatting';
import type { LoanCalculation } from '@/types';
import { DepositPanel } from './DepositPanel';
import { ReceivePanel } from './ReceivePanel';
import { PaybackPanel } from './PaybackPanel';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
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
  const { service } = useThetanuts();
  const { address } = useAccount();
  const { mmLiquidity } = useBalances();
  const [balance, setBalance] = useState('--');
  const [repayAmount, setRepayAmount] = useState('--');
  const [expiryDate, setExpiryDate] = useState('--');
  const [effectiveApr, setEffectiveApr] = useState('--');

  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];

  useEffect(() => {
    if (!address || !asset) return;
    service.getBalance(asset.collateral).then((bal) => {
      setBalance(parseFloat(ethers.formatUnits(bal, asset.decimals)).toFixed(6));
    }).catch(() => setBalance('--'));
  }, [address, asset, service]);

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
        <div className="mb-4 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-center">
          <span className="text-xs text-indigo-600 dark:text-indigo-400">
            Alpha Release — {mmLiquidity} USDC available from market makers
          </span>
        </div>
      )}
      <DepositPanel
        amount={depositAmount}
        onAmountChange={onDepositAmountChange}
        balance={balance}
        onOpenCollateralModal={onOpenCollateralModal}
      />

      <div className="flex justify-center -my-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-white dark:bg-zend-bg border-4 border-white dark:border-zend-bg flex items-center justify-center hover:rotate-180 transition-transform duration-300 cursor-pointer">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      <ReceivePanel amount={receiveAmount} onOpenStrikeModal={onOpenStrikeModal} />

      <div className="flex justify-center -my-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-white dark:bg-zend-bg border-4 border-white dark:border-zend-bg flex items-center justify-center hover:rotate-180 transition-transform duration-300 cursor-pointer">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      <PaybackPanel expiryDate={expiryDate} repayAmount={repayAmount} effectiveApr={effectiveApr} />

      <button
        onClick={onReview}
        disabled={!canReview}
        className={`mt-6 w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-br from-indigo-400 to-zend-accent hover:from-indigo-500 hover:to-zend-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all ${canReview ? 'animate-pulse-glow' : ''}`}
      >
        Review
      </button>
    </div>
  );
}
