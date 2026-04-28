'use client';

interface Props {
  amount: string;
  onOpenStrikeModal: () => void;
}

export function ReceivePanel({ amount, onOpenStrikeModal }: Props) {
  return (
    <div className="bg-zend-surface rounded-2xl p-5 border border-zend-border shadow-card hover:shadow-card-hover hover:border-zend-border-strong transition-all duration-200 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-zend-success rounded-l-2xl" />
      <div className="text-xs font-heading font-semibold text-zend-success uppercase tracking-wider mb-3 pl-2">Receive</div>
      <div className="flex items-center justify-between gap-3 pl-2">
        <span className="flex-1 text-[28px] font-heading font-bold text-zend-ink">
          {amount || '0.00'}
        </span>
        <button
          onClick={onOpenStrikeModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-zend-surface-alt rounded-xl border border-zend-border hover:border-zend-electric/40 focus:border-zend-electric/50 transition-all duration-200 shrink-0"
        >
          <span className="text-lg text-zend-ink">$</span>
          <span className="font-heading font-semibold text-sm text-zend-ink">USDC</span>
          <svg className="w-3 h-3 text-zend-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      <div className="text-xs text-zend-ink-secondary mt-2 pl-2">
        {amount ? `≈ $${parseFloat(amount).toFixed(2)}` : 'Select a strike to see amount'}
      </div>
    </div>
  );
}
