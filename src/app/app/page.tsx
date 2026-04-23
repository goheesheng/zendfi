'use client';

import { useState, useEffect } from 'react';
import { SwapInterface } from '@/components/app/SwapInterface';
import { useLoanContext } from '@/context/LoanContext';

export default function BorrowPage() {
  const { state } = useLoanContext();
  const [depositAmount, setDepositAmount] = useState('0.001');
  const [receiveAmount, setReceiveAmount] = useState('');

  // Calculate receive amount from deposit + selected strike
  useEffect(() => {
    const deposit = parseFloat(depositAmount) || 0;
    const strike = state.selectedStrike;
    if (deposit <= 0 || !strike) {
      setReceiveAmount('');
      return;
    }
    setReceiveAmount((deposit * strike * 0.95).toFixed(2));
  }, [depositAmount, state.selectedStrike]);

  return (
    <SwapInterface
      onReview={() => {}}
      onOpenCollateralModal={() => {}}
      onOpenStrikeModal={() => {}}
      depositAmount={depositAmount}
      onDepositAmountChange={setDepositAmount}
      receiveAmount={receiveAmount}
    />
  );
}
