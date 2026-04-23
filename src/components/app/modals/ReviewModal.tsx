'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import { LOAN_ASSETS, STRIKE_DECIMALS, type AssetKey } from '@/services/constants';
import { formatDate } from '@/services/formatting';
import { ethers } from 'ethers';

interface Props {
  open: boolean;
  onClose: () => void;
  depositAmount: string;
  receiveAmount: string;
  onConfirmed: () => void;
}

export function ReviewModal({ open, onClose, depositAmount, receiveAmount, onConfirmed }: Props) {
  const { state } = useLoanContext();
  const { service } = useThetanuts();
  const [submitting, setSubmitting] = useState(false);

  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];
  const strike = state.selectedStrike;
  const expiry = state.selectedExpiry;

  if (!asset || !strike || !expiry) return null;

  const deposit = parseFloat(depositAmount) || 0;
  const repay = deposit * strike;

  async function confirm() {
    setSubmitting(true);
    try {
      const collateralAmount = ethers.parseUnits(deposit.toString(), asset.decimals);
      const strikeBig = BigInt(Math.round(strike! * 10 ** STRIKE_DECIMALS));
      const minSettlement = ethers.parseUnits(receiveAmount, 6);

      await service.requestLoan({
        assetKey: state.selectedCollateral as AssetKey,
        collateralAmount,
        strike: strikeBig,
        expiryTimestamp: expiry!,
        minSettlementAmount: minSettlement,
        keepOrderOpen: state.settings.keepOrderOpen,
      });

      onClose();
      onConfirmed();
    } catch (err: any) {
      alert(err.message || 'Failed to submit loan request');
    } finally {
      setSubmitting(false);
    }
  }

  const rows = [
    ['Deposit', `${deposit} ${asset.symbol}`],
    ['Receive', `${receiveAmount} USDC`],
    ['Strike', `$${strike.toLocaleString()}`],
    ['Expiry', formatDate(expiry)],
    ['Repayment', `${repay.toFixed(2)} USDC`],
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
        <p className="text-xs text-gray-400 mt-4">European option: exercise only at expiry within 1-hour window. No early repayment.</p>
        <button
          onClick={confirm}
          disabled={submitting}
          className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-br from-indigo-400 to-zend-accent hover:from-indigo-500 hover:to-zend-accent-hover disabled:opacity-50 transition-all mt-4"
        >
          {submitting ? 'Submitting...' : 'Confirm Loan Request'}
        </button>
      </div>
    </Modal>
  );
}
