'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import { useToast } from '@/components/ui/Toast';
import { LOAN_ASSETS, USDC_ADDRESS, type AssetKey } from '@/services/constants';
import { formatDate } from '@/services/formatting';
import { ethers } from 'ethers';
import type { LoanCalculation } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  depositAmount: string;
  receiveAmount: string;
  loanCalc: LoanCalculation | null;
  onConfirmed: (loanId: string) => void;
}

export function ReviewModal({ open, onClose, depositAmount, receiveAmount, loanCalc, onConfirmed }: Props) {
  const { state, upsertLoan } = useLoanContext();
  const { service } = useThetanuts();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];
  const strike = state.selectedStrike;
  const expiry = state.selectedExpiry;

  if (!asset || !strike || !expiry) return null;

  const deposit = parseFloat(depositAmount) || 0;

  async function confirm() {
    setSubmitting(true);
    try {
      const collateralAmount = ethers.parseUnits(deposit.toString(), asset.decimals);
      const minSettlement = loanCalc ? loanCalc.finalLoanAmount : ethers.parseUnits(receiveAmount || '0', 6);

      const result = await service.requestLoan({
        assetKey: state.selectedCollateral as AssetKey,
        collateralAmount,
        strike: strike!,
        expiryTimestamp: expiry!,
        minSettlementAmount: minSettlement,
        keepOrderOpen: state.settings.keepOrderOpen,
      });

      const loanId = result.quotationId.toString();

      upsertLoan(loanId, {
        quotationId: result.quotationId,
        requester: await service.getClient().getSignerAddress(),
        collateralToken: asset.collateral,
        collateralAmount,
        settlementToken: USDC_ADDRESS,
        strike: BigInt(Math.round(strike! * 1e8)),
        expiryTimestamp: expiry!,
        offerEndTimestamp: Math.floor(Date.now() / 1000) + 30,
        minSettlementAmount: minSettlement,
        status: 'requested',
        createdAt: Date.now(),
        offers: [],
      });

      onClose();
      onConfirmed(loanId);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit loan request', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const rows = loanCalc ? [
    ['Deposit', `${deposit} ${asset.symbol}`],
    ['Receive', `${loanCalc.receiveFormatted} USDC`],
    ['Strike', `$${strike.toLocaleString()}${loanCalc.isPromo ? ' 🔥' : ''}`],
    ['Expiry', formatDate(expiry)],
    ['Repayment', `${loanCalc.repayFormatted} USDC`],
    ['Option Premium', `${loanCalc.optionCostFormatted} USDC${loanCalc.isPromo ? ' (waived)' : ''}`],
    ['Borrowing Fee', `${loanCalc.capitalCostFormatted} USDC`],
    ['Protocol Fee', `${loanCalc.protocolFeeFormatted} USDC`],
    ['Effective APR', `${loanCalc.aprFormatted}%`],
  ] : [
    ['Deposit', `${deposit} ${asset.symbol}`],
    ['Receive', `${receiveAmount} USDC`],
    ['Strike', `$${strike.toLocaleString()}`],
    ['Expiry', formatDate(expiry)],
  ];

  return (
    <Modal open={open} onClose={onClose} title="Review Loan">
      <div className="space-y-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
          </div>
        ))}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">European option: exercise only at expiry within 1-hour window. No early repayment.</p>
        <button
          onClick={confirm}
          disabled={submitting}
          className="w-full py-4 rounded-2xl font-semibold text-white bg-zend-blue hover:bg-zend-blue-dark disabled:opacity-50 transition-all mt-4 shadow-[0_4px_16px_rgba(93,116,255,0.3)]"
        >
          {submitting ? 'Submitting...' : 'Confirm Loan Request'}
        </button>
      </div>
    </Modal>
  );
}
