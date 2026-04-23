'use client';

import { useState, useEffect } from 'react';
import { SwapInterface } from '@/components/app/SwapInterface';
import { LoanProgress } from '@/components/app/LoanProgress';
import { CollateralModal } from '@/components/app/modals/CollateralModal';
import { StrikeModal } from '@/components/app/modals/StrikeModal';
import { ReviewModal } from '@/components/app/modals/ReviewModal';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import { useBalances } from '@/hooks/useBalances';

export default function BorrowPage() {
  const { state, setActiveRequest } = useLoanContext();
  const { service } = useThetanuts();
  useBalances();
  const [depositAmount, setDepositAmount] = useState('0.001');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [collateralOpen, setCollateralOpen] = useState(false);
  const [strikeOpen, setStrikeOpen] = useState(false);

  useEffect(() => {
    const deposit = parseFloat(depositAmount) || 0;
    const strike = state.selectedStrike;
    if (deposit <= 0 || !strike) {
      setReceiveAmount('');
      return;
    }
    setReceiveAmount((deposit * strike * 0.95).toFixed(2));
  }, [depositAmount, state.selectedStrike]);

  const handleCancel = async () => {
    if (!state.activeLoanRequestId) return;
    try {
      await service.cancelLoan(BigInt(state.activeLoanRequestId));
    } catch (e: any) {
      console.error('Cancel failed:', e.message);
    } finally {
      setActiveRequest(null);
    }
  };

  const handleDismiss = () => {
    setActiveRequest(null);
  };

  if (state.activeLoanRequestId) {
    return (
      <LoanProgress
        onCancel={handleCancel}
        onDismiss={handleDismiss}
      />
    );
  }

  return (
    <>
      <SwapInterface
        onReview={() => setReviewOpen(true)}
        onOpenCollateralModal={() => setCollateralOpen(true)}
        onOpenStrikeModal={() => setStrikeOpen(true)}
        depositAmount={depositAmount}
        onDepositAmountChange={setDepositAmount}
        receiveAmount={receiveAmount}
      />
      <CollateralModal open={collateralOpen} onClose={() => setCollateralOpen(false)} />
      <StrikeModal open={strikeOpen} onClose={() => setStrikeOpen(false)} />
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        depositAmount={depositAmount}
        receiveAmount={receiveAmount}
        onConfirmed={(loanId: string) => {
          setActiveRequest(loanId);
          setReviewOpen(false);
        }}
      />
    </>
  );
}
