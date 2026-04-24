'use client';

interface Props {
  amount: string;
  onOpenStrikeModal: () => void;
}

export function ReceivePanel({ amount, onOpenStrikeModal }: Props) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-xs text-white/30 mb-2">Receive</div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1 text-2xl font-medium text-white">
          {amount || '0.00'}
        </span>
        <button
          onClick={onOpenStrikeModal}
          className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] rounded-xl border border-white/[0.06] hover:border-indigo-500/40 focus:border-indigo-500/50 transition-colors shrink-0"
        >
          <span className="text-lg text-white">$</span>
          <span className="font-semibold text-sm text-white">USDC</span>
          <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      <div className="text-xs text-white/30 mt-2">
        ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
      </div>
    </div>
  );
}
