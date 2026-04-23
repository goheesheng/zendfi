'use client';

import { useLoanContext } from '@/context/LoanContext';
import { HistoryCard } from '@/components/app/HistoryCard';

export default function HistoryPage() {
  const { getHistoryLoans } = useLoanContext();
  const loans = getHistoryLoans();

  if (loans.length === 0) {
    return <p className="text-center py-12 text-gray-400 dark:text-gray-500">No loan history.</p>;
  }

  return (
    <div>
      {loans.map((loan) => (
        <HistoryCard key={loan.quotationId.toString()} loan={loan} />
      ))}
    </div>
  );
}
