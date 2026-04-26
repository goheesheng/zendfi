'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import type { StrikeOptionGroup } from '@/types';
import type { AssetKey } from '@/services/constants';

export function StrikeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setStrike, setExpiry, setOptionData } = useLoanContext();
  const { service } = useThetanuts();
  const [groups, setGroups] = useState<StrikeOptionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    service
      .getGroupedStrikeOptions(state.selectedCollateral as AssetKey, state.settings)
      .then(setGroups)
      .catch((err) => {
        console.error('Failed to fetch strike options:', err);
        setError('Failed to load options. Check your connection.');
        setGroups([]);
      })
      .finally(() => setLoading(false));
  }, [open, state.selectedCollateral, state.settings, service]);

  const totalOptions = groups.reduce((sum, g) => sum + g.options.length, 0);

  return (
    <Modal open={open} onClose={onClose} title="Select Strike & Expiry">
      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-zend-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading options...</p>
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-8 text-sm">{error}</p>
      ) : totalOptions === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">No options available. Try adjusting settings (lower min duration).</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-1">
          {groups.map((group) => (
            <div key={group.expiryLabel}>
              <div className="sticky top-0 bg-white py-2 px-1 z-10">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {group.expiryFormatted}
                </span>
              </div>
              <div className="space-y-1.5">
                {group.options.map((opt) => (
                  <button
                    key={`${opt.strike}-${opt.expiry}`}
                    onClick={() => {
                      setStrike(opt.strike);
                      setExpiry(opt.expiry);
                      setOptionData({
                        askPrice: opt.askPrice,
                        underlyingPrice: opt.underlyingPrice,
                        expiryLabel: opt.expiryLabel,
                      });
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-zend-blue/40 hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-sm">
                        {opt.strikeFormatted}
                        {opt.isPromo && (
                          <span className="ml-2 text-xs text-orange-500 font-medium">🔥 Promo</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold text-sm ${opt.isPromo ? 'text-orange-500' : 'text-emerald-600'}`}>
                        {opt.effectiveApr.toFixed(1)}% APR
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
