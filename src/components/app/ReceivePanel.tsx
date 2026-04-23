'use client';

interface Props {
  amount: string;
  onOpenStrikeModal: () => void;
}

export function ReceivePanel({ amount, onOpenStrikeModal }: Props) {
  return (
    <div className="bg-gray-100 dark:bg-zend-card rounded-2xl p-5 border border-gray-200 dark:border-zend-border">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Receive</div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1 text-2xl font-medium text-gray-900 dark:text-white">
          {amount || '0.00'}
        </span>
        <button
          onClick={onOpenStrikeModal}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zend-input rounded-xl border border-gray-200 dark:border-zend-border hover:border-zend-accent transition-colors shrink-0"
        >
          <span className="text-lg">$</span>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">USDC</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
      </div>
    </div>
  );
}
