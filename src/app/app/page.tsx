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
import { calculateLoanParams } from '@/services/pricing';
import type { LoanCalculation } from '@/types';
import type { AssetKey } from '@/services/constants';

export default function BorrowPage() {
  const { state, setActiveRequest } = useLoanContext();
  const { service } = useThetanuts();
  useBalances();
  const [depositAmount, setDepositAmount] = useState('0.001');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [loanCalc, setLoanCalc] = useState<LoanCalculation | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [collateralOpen, setCollateralOpen] = useState(false);
  const [strikeOpen, setStrikeOpen] = useState(false);

  // Calculate receive amount using accurate pricing
  useEffect(() => {
    const deposit = parseFloat(depositAmount) || 0;
    const strike = state.selectedStrike;
    const expiry = state.selectedExpiry;
    const optData = state.selectedOptionData;

    if (deposit <= 0 || !strike || !expiry || !optData) {
      setReceiveAmount('');
      setLoanCalc(null);
      return;
    }

    const calc = calculateLoanParams({
      depositAmount,
      assetKey: state.selectedCollateral as AssetKey,
      strike,
      expiryTimestamp: expiry,
      expiryLabel: optData.expiryLabel,
      askPrice: optData.askPrice,
      underlyingPrice: optData.underlyingPrice,
      maxApr: state.settings.maxApr,
    });

    if (calc) {
      setReceiveAmount(calc.receiveFormatted);
      setLoanCalc(calc);
    } else {
      setReceiveAmount('');
      setLoanCalc(null);
    }
  }, [depositAmount, state.selectedStrike, state.selectedExpiry, state.selectedOptionData, state.selectedCollateral, state.settings.maxApr]);

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
    return <LoanProgress onCancel={handleCancel} onDismiss={handleDismiss} />;
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
        loanCalc={loanCalc}
      />
      <CollateralModal open={collateralOpen} onClose={() => setCollateralOpen(false)} />
      <StrikeModal open={strikeOpen} onClose={() => setStrikeOpen(false)} />
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        depositAmount={depositAmount}
        receiveAmount={receiveAmount}
        loanCalc={loanCalc}
        onConfirmed={(loanId: string) => {
          setActiveRequest(loanId);
          setReviewOpen(false);
        }}
      />
    </>
  );
}
