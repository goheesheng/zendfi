'use client';

interface Props {
  expiryDate: string;
  repayAmount: string;
  effectiveApr: string;
}

export function PaybackPanel({ expiryDate, repayAmount, effectiveApr }: Props) {
  const hasValues = expiryDate !== '--' && repayAmount !== '--';

  return (
    <div className={`rounded-2xl p-5 ${hasValues ? 'bg-zend-accent-soft/30 border border-zend-blue/20' : 'bg-white border border-zend-accent-soft shadow-sm'}`}>
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="text-gray-400">{hasValues ? `Payback on ${expiryDate}` : 'Payback date'}</span>
        <span className={`font-semibold ${hasValues ? 'text-gray-900' : 'text-gray-300'}`}>{hasValues ? repayAmount : 'Select a strike'}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Effective APR</span>
        <span className={`font-semibold ${hasValues ? 'text-emerald-600' : 'text-gray-300'}`}>{hasValues ? effectiveApr : '--'}</span>
      </div>
    </div>
  );
}
