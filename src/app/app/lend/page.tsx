'use client';

import { useState } from 'react';
import { useLoanContext } from '@/context/LoanContext';
import { LendTable } from '@/components/app/LendTable';
import { useAccount } from 'wagmi';

export default function LendPage() {
  const { getLendingOpportunities } = useLoanContext();
  const { address } = useAccount();
  const [filter, setFilter] = useState('all');

  const opportunities = getLendingOpportunities(address);
  const filtered = filter === 'all' ? opportunities : opportunities.filter((l) => {
    const token = l.collateralToken.toLowerCase();
    if (filter === 'WETH') return token === '0x4200000000000000000000000000000000000006';
    if (filter === 'CBBTC') return token === '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf';
    return true;
  });

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-zend-input border border-gray-200 dark:border-zend-border text-gray-900 dark:text-white text-sm">
          <option value="all">All Assets</option>
          <option value="WETH">ETH</option>
          <option value="CBBTC">BTC</option>
        </select>
      </div>
      <LendTable loans={filtered} />
    </div>
  );
}
