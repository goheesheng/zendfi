'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import { useToast } from '@/components/ui/Toast';
import { LOAN_ASSETS, LOAN_COORDINATOR_ADDRESS, STRIKE_DECIMALS, USDC_ADDRESS, type AssetKey } from '@/services/constants';
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
      const strikeBig = BigInt(Math.round(strike! * 10 ** STRIKE_DECIMALS));
      const minSettlement = loanCalc ? loanCalc.finalLoanAmount : ethers.parseUnits(receiveAmount || '0', 6);

      const { receipt } = await service.requestLoan({
        assetKey: state.selectedCollateral as AssetKey,
        collateralAmount,
        strike: strikeBig,
        expiryTimestamp: expiry!,
        minSettlementAmount: minSettlement,
        keepOrderOpen: state.settings.keepOrderOpen,
      });

      // Parse quotationId from LoanRequested event in receipt
      let loanId = '';
      if (receipt) {
        const iface = new ethers.Interface([
          'event LoanRequested(uint256 indexed quotationId, address indexed requester, address collateralToken, address settlementToken, uint256 collateralAmount, uint256 minSettlementAmount, uint256 strike, uint256 expiryTimestamp, uint256 offerEndTimestamp, bool convertToLimitOrder)',
        ]);
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === 'LoanRequested') {
              loanId = parsed.args.quotationId.toString();
              const offerEndTimestamp = Number(parsed.args.offerEndTimestamp);
              upsertLoan(loanId, {
                quotationId: parsed.args.quotationId,
                requester: parsed.args.requester,
                collateralToken: parsed.args.collateralToken,
                collateralAmount: parsed.args.collateralAmount,
                settlementToken: USDC_ADDRESS,
                strike: parsed.args.strike,
                expiryTimestamp: expiry!,
                offerEndTimestamp,
                minSettlementAmount: parsed.args.minSettlementAmount,
                status: 'requested',
                createdAt: Date.now(),
                offers: [],
              });
              break;
            }
          } catch {
            // Not this event
          }
        }
      }

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
