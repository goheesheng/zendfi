'use client';

interface Props {
  expiryDate: string;
  repayAmount: string;
  effectiveApr: string;
}

export function PaybackPanel({ expiryDate, repayAmount, effectiveApr }: Props) {
  const hasValues = expiryDate !== '--' && repayAmount !== '--';

  return (
    <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-200 ${
      hasValues
        ? 'bg-zend-coral-soft border border-zend-coral/20'
        : 'bg-zend-surface border border-zend-border shadow-card'
    }`}>
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl ${hasValues ? 'bg-zend-coral' : 'bg-zend-ink-muted'}`} />
      <div className="flex justify-between items-center text-sm mb-2 pl-2">
        <span className="text-zend-ink-secondary">{hasValues ? `Payback on ${expiryDate}` : 'Payback date'}</span>
        <span className={`font-heading font-semibold ${hasValues ? 'text-zend-ink' : 'text-zend-ink-muted'}`}>
          {hasValues ? repayAmount : 'Select a strike'}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm pl-2">
        <span className="text-zend-ink-secondary">Effective APR</span>
        <span className={`font-heading font-bold ${hasValues ? 'text-zend-success' : 'text-zend-ink-muted'}`}>
          {hasValues ? effectiveApr : '--'}
        </span>
      </div>
    </div>
  );
}
