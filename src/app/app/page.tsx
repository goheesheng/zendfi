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
import { useToast } from '@/components/ui/Toast';
import { calculateLoanParams } from '@/services/pricing';
import type { LoanCalculation } from '@/types';
import type { AssetKey } from '@/services/constants';
import { AnalyticsDashboard } from '@/components/app/AnalyticsDashboard';
import { BorrowSidebar } from '@/components/app/BorrowSidebar';

export default function BorrowPage() {
  const { state, setActiveRequest } = useLoanContext();
  const { service } = useThetanuts();
  const { showToast } = useToast();
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
      showToast('Loan request cancelled', 'success');
    } catch (e: any) {
      console.error('Cancel failed:', e.message);
      showToast(e.message || 'Failed to cancel', 'error');
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        <div className="hidden lg:block">
          <AnalyticsDashboard />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Loan</h2>
          <SwapInterface
            onReview={() => setReviewOpen(true)}
            onOpenCollateralModal={() => setCollateralOpen(true)}
            onOpenStrikeModal={() => setStrikeOpen(true)}
            depositAmount={depositAmount}
            onDepositAmountChange={setDepositAmount}
            receiveAmount={receiveAmount}
            loanCalc={loanCalc}
          />
          <div className="hidden lg:block">
            <BorrowSidebar />
          </div>
        </div>
      </div>
      {/* Mobile: borrow first, analytics below */}
      <div className="lg:hidden mt-8">
        <AnalyticsDashboard />
      </div>
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
