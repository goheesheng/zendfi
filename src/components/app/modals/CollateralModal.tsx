'use client';

import { Modal } from '@/components/ui/Modal';
import { LOAN_ASSETS } from '@/services/constants';
import { useLoanContext } from '@/context/LoanContext';

export function CollateralModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setCollateral } = useLoanContext();

  return (
    <Modal open={open} onClose={onClose} title="Select Collateral">
      <div className="space-y-2">
        {Object.entries(LOAN_ASSETS).map(([key, asset]) => (
          <button
            key={key}
            onClick={() => { setCollateral(key as 'WETH' | 'CBBTC'); onClose(); }}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
              state.selectedCollateral === key
                ? 'border-zend-accent bg-indigo-50 dark:bg-indigo-950/20'
                : 'border-gray-200 dark:border-zend-border hover:border-zend-accent'
            }`}
          >
            <span className="text-2xl">{asset.icon}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{asset.symbol}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
