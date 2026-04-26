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
      const data = await res.json();
      // Indexer returns loans as an object keyed by quotationId, not an array
      const loansObj: Record<string, any> = data.loans || {};
      const allLoans: LendingOpportunity[] = Object.values(loansObj);
      // Limit orders = requested + convertToLimitOrder + not yet settled
      const limitOrders = allLoans.filter(
        (l) => l.convertToLimitOrder && !l.optionAddress && l.status !== 'settled' && l.status !== 'cancelled'
      );
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
          <h2 className="text-lg font-semibold text-gray-900">Lending Opportunities</h2>
          <p className="text-sm text-gray-500 mt-1">
            Fill limit orders by providing USDC. Receive collateral custody until expiry.
          </p>
        </div>
        <button
          onClick={fetchOpportunities}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm"
        >
          <option value="all">All Assets</option>
          <option value="WETH">ETH</option>
          <option value="CBBTC">BTC</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <LendTable opportunities={filtered} loading={loading} onRefresh={fetchOpportunities} />
      )}
    </div>
  );
}
