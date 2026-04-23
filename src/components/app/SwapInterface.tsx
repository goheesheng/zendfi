'use client';

import { useState, useEffect } from 'react';
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
  depositAmount: string;
  onDepositAmountChange: (v: string) => void;
  receiveAmount: string;
}

export function SwapInterface({ onReview, onOpenCollateralModal, onOpenStrikeModal, depositAmount, onDepositAmountChange, receiveAmount }: Props) {
  const { state } = useLoanContext();
  const { service } = useThetanuts();
  const { address } = useAccount();
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
    const deposit = parseFloat(depositAmount) || 0;
    const strike = state.selectedStrike;
    const expiry = state.selectedExpiry;

    if (deposit <= 0 || !strike || !expiry) {
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

    setRepayAmount(`${repay.toFixed(2)} USDC`);
    setExpiryDate(formatDate(expiry));
    setEffectiveApr(`${apr.toFixed(1)}%`);
  }, [depositAmount, state.selectedStrike, state.selectedExpiry]);

  const canReview = receiveAmount !== '' && state.selectedStrike && state.selectedExpiry;

  return (
    <div className="flex flex-col gap-0">
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
