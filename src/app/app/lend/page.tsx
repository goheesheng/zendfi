'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { LendTable } from '@/components/app/LendTable';
import { LOAN_INDEXER_URL } from '@/services/constants';
import type { LendingOpportunity } from '@/types';

export default function LendPage() {
  const { address } = useAccount();
  const [filter, setFilter] = useState('all');
  const [opportunities, setOpportunities] = useState<LendingOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${LOAN_INDEXER_URL}/api/state`);
      if (!res.ok) throw new Error(`Indexer returned ${res.status}`);
      const data = (await res.json()) as { loans?: LendingOpportunity[] };
      const loans: LendingOpportunity[] = Array.isArray(data.loans) ? data.loans : [];
      // Only show limit orders that haven't been filled yet
      const limitOrders = loans.filter((l) => l.status === 'limitOrder' || l.convertToLimitOrder);
      setOpportunities(limitOrders);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load lending opportunities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const WETH_ADDR = '0x4200000000000000000000000000000000000006';
  const CBBTC_ADDR = '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf';

  const filtered = opportunities.filter((l) => {
    // Filter out the connected user's own loans
    if (address && l.requester.toLowerCase() === address.toLowerCase()) return false;
    // Asset filter
    const token = l.collateralToken.toLowerCase();
    if (filter === 'WETH') return token === WETH_ADDR;
    if (filter === 'CBBTC') return token === CBBTC_ADDR;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lending Opportunities</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill limit orders by providing USDC. Receive collateral custody until expiry.
          </p>
        </div>
        <button
          onClick={fetchOpportunities}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zend-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zend-input transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-zend-input border border-gray-200 dark:border-zend-border text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Assets</option>
          <option value="WETH">ETH</option>
          <option value="CBBTC">BTC</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : (
        <LendTable opportunities={filtered} loading={loading} onRefresh={fetchOpportunities} />
      )}
    </div>
  );
}
