'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import type { StrikeOption } from '@/types';
import type { AssetKey } from '@/services/constants';

export function StrikeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setStrike, setExpiry } = useLoanContext();
  const { service } = useThetanuts();
  const [options, setOptions] = useState<StrikeOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const { minDurationDays, maxStrikes, maxApr } = state.settings;
    service
      .getStrikeOptions(state.selectedCollateral as AssetKey, minDurationDays, maxStrikes, maxApr)
      .then(setOptions)
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, [open, state.selectedCollateral, state.settings, service]);

  return (
    <Modal open={open} onClose={onClose} title="Select Strike & Expiry">
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : options.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No options available. Try adjusting settings.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={`${opt.strike}-${opt.expiry}`}
              onClick={() => { setStrike(opt.strike); setExpiry(opt.expiry); onClose(); }}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-zend-border hover:border-zend-accent transition-all"
            >
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">{opt.strikeFormatted}</div>
                <div className="text-xs text-gray-400">{opt.expiryFormatted}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-emerald-500">{opt.effectiveApr.toFixed(1)}% APR</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
