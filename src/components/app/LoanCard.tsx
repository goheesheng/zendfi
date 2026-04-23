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
  const strike = (Number(loan.strike) / 10 ** STRIKE_DECIMALS).toLocaleString();

  const now = Math.floor(Date.now() / 1000);
  const inExerciseWindow = now >= loan.expiryTimestamp && now < loan.expiryTimestamp + 3600;

  const displayStatus = inExerciseWindow ? 'action' : loan.status;

  return (
    <div className="bg-gray-50 dark:bg-zend-card rounded-2xl p-5 border border-gray-200 dark:border-zend-border mb-3">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-900 dark:text-white">{parseFloat(collateral).toFixed(6)} {symbol}</span>
        <Badge status={displayStatus} />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Strike</span><span className="text-gray-900 dark:text-white">${strike}</span></div>
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Expiry</span><span className="text-gray-900 dark:text-white">{formatDate(loan.expiryTimestamp)}</span></div>
      </div>
      {inExerciseWindow && loan.optionAddress && (
        <div className="flex gap-2 mt-4">
          <button onClick={() => onExercise(loan.optionAddress!)} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors">Exercise</button>
          <button onClick={() => onDoNotExercise(loan.optionAddress!)} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors">Decline</button>
        </div>
      )}
      {loan.status === 'competing' && (
        <button onClick={() => onCancel(loan.quotationId.toString())} className="w-full mt-4 py-2 rounded-xl border border-gray-200 dark:border-zend-border text-gray-500 dark:text-gray-400 font-semibold text-sm hover:border-red-500 hover:text-red-500 transition-colors">Cancel</button>
      )}
    </div>
  );
}
