'use client';

interface Props {
  expiryDate: string;
  repayAmount: string;
  effectiveApr: string;
}

export function PaybackPanel({ expiryDate, repayAmount, effectiveApr }: Props) {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/50">
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="text-gray-600 dark:text-gray-400">Payback on {expiryDate}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{repayAmount}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Effective APR</span>
        <span className="font-semibold text-emerald-500">{effectiveApr}</span>
      </div>
    </div>
  );
}
