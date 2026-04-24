'use client';

import { Badge } from '@/components/ui/Badge';
import { LOAN_ASSETS, STRIKE_DECIMALS } from '@/services/constants';
import { formatDate } from '@/services/formatting';
import { ethers } from 'ethers';
import type { Loan } from '@/types';

interface Props {
  loan: Loan;
  onExercise: (addr: string) => void;
  onDoNotExercise: (addr: string) => void;
  onCancel: (id: string) => void;
}

export function LoanCard({ loan, onExercise, onDoNotExercise, onCancel }: Props) {
  const asset = Object.entries(LOAN_ASSETS).find(
    ([_, a]) => a.collateral.toLowerCase() === loan.collateralToken.toLowerCase()
  );
  const symbol = asset ? asset[1].symbol : '?';
  const decimals = asset ? asset[1].decimals : 18;
  const collateral = ethers.formatUnits(loan.collateralAmount, decimals);
  const strikeNum = Number(loan.strike) / 10 ** STRIKE_DECIMALS;
  const strikeFormatted = strikeNum.toLocaleString();

  // Calculate borrowed (received) amount
  const borrowed = loan.netLoanAmount
    ? parseFloat(ethers.formatUnits(loan.netLoanAmount, 6)).toFixed(2)
    : loan.minSettlementAmount > 0n
      ? parseFloat(ethers.formatUnits(loan.minSettlementAmount, 6)).toFixed(2)
      : null;

  // Repayment = collateral * strike (OWE amount)
  const depositNum = parseFloat(collateral);
  const repayment = depositNum > 0 && strikeNum > 0
    ? (depositNum * strikeNum).toFixed(2)
    : null;

  const now = Math.floor(Date.now() / 1000);
  const inExerciseWindow = now >= loan.expiryTimestamp && now < loan.expiryTimestamp + 3600;
  const displayStatus = inExerciseWindow ? 'action' : loan.status;

  return (
    <div className="glass-card rounded-2xl p-6 mb-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <span className="font-semibold text-white text-xl">Loan #{loan.quotationId.toString()}</span>
        <Badge status={displayStatus} />
      </div>

      {/* Deposited & Borrowed */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white/[0.03] rounded-xl p-4">
          <div className="text-[11px] uppercase tracking-wider text-white/30 mb-1.5">Deposited</div>
          <div className="font-semibold text-white text-base">{parseFloat(collateral).toFixed(6)} {symbol}</div>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-4">
          <div className="text-[11px] uppercase tracking-wider text-white/30 mb-1.5">Borrowed</div>
          <div className="font-semibold text-white text-base">{borrowed ? `${borrowed} USDC` : '--'}</div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-white/30">Strike</span>
          <span className="text-white">${strikeFormatted}</span>
        </div>
        {repayment && (
          <div className="flex justify-between">
            <span className="text-white/30">Repayment</span>
            <span className="text-white">{repayment} USDC</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-white/30">Expiry</span>
          <span className="text-white">{formatDate(loan.expiryTimestamp)}</span>
        </div>
        {loan.optionAddress && (
          <div className="flex justify-between">
            <span className="text-white/30">Option</span>
            <a
              href={`https://basescan.org/address/${loan.optionAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors text-xs font-mono"
            >
              {loan.optionAddress.slice(0, 6)}...{loan.optionAddress.slice(-4)}
            </a>
          </div>
        )}
      </div>

      {/* Exercise window actions */}
      {inExerciseWindow && loan.optionAddress && (
        <div className="flex gap-2 mt-4">
          <button onClick={() => onExercise(loan.optionAddress!)} className="flex-1 py-2.5 rounded-xl bg-zend-success text-white font-semibold text-sm hover:bg-emerald-400 transition-colors">
            Exercise
          </button>
          <button onClick={() => onDoNotExercise(loan.optionAddress!)} className="flex-1 py-2.5 rounded-xl bg-zend-error text-white font-semibold text-sm hover:bg-red-400 transition-colors">
            Decline
          </button>
        </div>
      )}

      {/* Cancel for competing loans */}
      {loan.status === 'competing' && (
        <button onClick={() => onCancel(loan.quotationId.toString())} className="w-full mt-4 py-2.5 rounded-xl border border-white/10 text-white/40 font-semibold text-sm hover:border-red-500/50 hover:text-red-400 transition-colors">
          Cancel Request
        </button>
      )}
    </div>
  );
}
