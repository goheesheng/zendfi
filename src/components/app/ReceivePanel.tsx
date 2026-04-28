'use client';

interface Props {
  amount: string;
  onOpenStrikeModal: () => void;
}

export function ReceivePanel({ amount, onOpenStrikeModal }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-zend-accent-soft shadow-sm hover:border-zend-blue/40 hover:shadow-md transition-all duration-200">
      <div className="text-xs text-gray-400 mb-2">Receive</div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1 text-2xl font-medium text-gray-900">
          {amount || '0.00'}
        </span>
        <button
          onClick={onOpenStrikeModal}
          className="flex items-center gap-2 px-3 py-2 bg-zend-accent-soft/30 rounded-xl border border-zend-accent-soft hover:border-zend-blue/50 focus:border-zend-blue/60 transition-colors shrink-0"
        >
          <span className="text-lg text-gray-900">$</span>
          <span className="font-semibold text-sm text-gray-900">USDC</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-2">
        {amount ? `≈ $${parseFloat(amount).toFixed(2)}` : 'Enter deposit amount'}
      </div>
    </div>
  );
}
