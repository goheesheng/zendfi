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
                ? 'border-zend-blue bg-zend-blue/5 shadow-sm'
                : 'border-gray-200 hover:border-zend-blue/40 hover:shadow-sm'
            }`}
          >
            <span className="text-2xl">{asset.icon}</span>
            <span className="font-semibold text-gray-900">{asset.symbol}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
