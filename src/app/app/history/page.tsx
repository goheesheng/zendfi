'use client';

import { useLoanContext } from '@/context/LoanContext';
import { HistoryCard } from '@/components/app/HistoryCard';

export default function HistoryPage() {
  const { getHistoryLoans } = useLoanContext();
  const loans = getHistoryLoans();

  if (loans.length === 0) {
    return (
      <div className="bg-white dark:bg-zend-card rounded-2xl p-12 text-center border border-gray-200 dark:border-zend-border shadow-sm">
        <div className="w-20 h-20 rounded-full bg-zend-blue/8 flex items-center justify-center mx-auto mb-5 animate-float">
          <svg className="w-10 h-10 text-zend-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-gray-900 dark:text-white font-semibold mb-1">No history yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Completed, exercised, and expired loans will show up here.</p>
        <a href="/app" className="inline-block px-6 py-2.5 rounded-xl bg-zend-blue text-white text-sm font-semibold hover:bg-zend-blue-dark transition-all shadow-[0_4px_16px_rgba(6,214,160,0.3)]">
          Start Borrowing
        </a>
      </div>
    );
  }

  return (
    <div>
      {loans.map((loan) => (
        <HistoryCard key={loan.quotationId.toString()} loan={loan} />
      ))}
    </div>
  );
}
