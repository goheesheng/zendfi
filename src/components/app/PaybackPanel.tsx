'use client';

interface Props {
  expiryDate: string;
  repayAmount: string;
  effectiveApr: string;
}

export function PaybackPanel({ expiryDate, repayAmount, effectiveApr }: Props) {
  const hasValues = expiryDate !== '--' && repayAmount !== '--';

  return (
    <div className={`rounded-2xl p-5 ${hasValues ? 'bg-zend-accent-soft/30 dark:bg-zend-accent-soft/10 border border-zend-blue/20' : 'bg-white dark:bg-zend-card border border-zend-accent-soft dark:border-zend-border shadow-sm'}`}>
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="text-gray-400 dark:text-gray-500">{hasValues ? `Payback on ${expiryDate}` : 'Payback date'}</span>
        <span className={`font-semibold ${hasValues ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>{hasValues ? repayAmount : 'Select a strike'}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400 dark:text-gray-500">Effective APR</span>
        <span className={`font-semibold ${hasValues ? 'text-emerald-600' : 'text-gray-300 dark:text-gray-600'}`}>{hasValues ? effectiveApr : '--'}</span>
      </div>
    </div>
  );
}
