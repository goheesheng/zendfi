'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useLoanContext } from '@/context/LoanContext';
import type { UserSettings } from '@/types';

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, updateSettings, clearAll } = useLoanContext();
  const [minDays, setMinDays] = useState(state.settings.minDurationDays);
  const [maxStrikes, setMaxStrikes] = useState(state.settings.maxStrikes);
  const [maxApr, setMaxApr] = useState(state.settings.maxApr);
  const [keepOpen, setKeepOpen] = useState(state.settings.keepOrderOpen);
  const [sortOrder, setSortOrder] = useState<UserSettings['sortOrder']>(state.settings.sortOrder);

  useEffect(() => {
    if (open) {
      setMinDays(state.settings.minDurationDays);
      setMaxStrikes(state.settings.maxStrikes);
      setMaxApr(state.settings.maxApr);
      setKeepOpen(state.settings.keepOrderOpen);
      setSortOrder(state.settings.sortOrder);
    }
  }, [open, state.settings]);

  function save() {
    updateSettings({ minDurationDays: minDays, maxStrikes, maxApr, keepOrderOpen: keepOpen, sortOrder });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Show options expiring in (days)</label>
          <input type="number" value={minDays} onChange={(e) => setMinDays(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-zend-bg border border-gray-200 dark:border-zend-border text-gray-900 dark:text-white text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Max strikes per expiry</label>
          <input type="number" value={maxStrikes} onChange={(e) => setMaxStrikes(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-zend-bg border border-gray-200 dark:border-zend-border text-gray-900 dark:text-white text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Sort by</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as UserSettings['sortOrder'])}
            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-zend-bg border border-gray-200 dark:border-zend-border text-gray-900 dark:text-white text-sm"
          >
            <option value="highestStrike">Highest strike</option>
            <option value="lowestStrike">Lowest strike</option>
            <option value="nearestExpiry">Nearest expiry</option>
            <option value="furthestExpiry">Furthest expiry</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Maximum APR: {maxApr}%</label>
          <input type="range" min={5} max={30} value={maxApr} onChange={(e) => setMaxApr(Number(e.target.value))} className="w-full accent-zend-blue" />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Keep order open</label>
          <button onClick={() => setKeepOpen(!keepOpen)} className={`w-11 h-6 rounded-full transition-colors ${keepOpen ? 'bg-zend-blue' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${keepOpen ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
          </button>
        </div>
        <button onClick={save} className="w-full py-3 rounded-xl font-semibold text-white bg-zend-blue hover:bg-zend-blue-dark transition-all shadow-[0_4px_16px_rgba(93,116,255,0.3)]">Save Settings</button>
        <div className="border-t border-gray-100 dark:border-zend-border/50 pt-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">If data appears corrupted, clearing local storage may help.</p>
          <button onClick={() => { clearAll(); onClose(); }} className="text-sm text-red-500 hover:text-red-400 transition-colors">Clear Local Storage</button>
        </div>
      </div>
    </Modal>
  );
}
