'use client';

import { useLoanContext } from '@/context/LoanContext';
import { HistoryCard } from '@/components/app/HistoryCard';

export default function HistoryPage() {
  const { getHistoryLoans } = useLoanContext();
  const loans = getHistoryLoans();

  if (loans.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-zend-blue/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-zend-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-gray-900 font-semibold mb-1">No history yet</p>
        <p className="text-sm text-gray-400 mb-6">Completed, exercised, and expired loans will show up here.</p>
        <a href="/app" className="inline-block px-6 py-2.5 rounded-xl bg-zend-blue text-white text-sm font-semibold hover:bg-zend-blue-dark transition-all shadow-[0_4px_16px_rgba(93,116,255,0.3)]">
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
