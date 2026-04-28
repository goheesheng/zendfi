'use client';

import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import { useToast } from '@/components/ui/Toast';
import { LoanCard } from '@/components/app/LoanCard';

export default function LoansPage() {
  const { getActiveLoans, removeLoan } = useLoanContext();
  const { service } = useThetanuts();
  const { showToast } = useToast();
  const loans = getActiveLoans();

  async function handleExercise(addr: string) {
    try {
      await service.exerciseOption(addr);
      showToast('Option exercised successfully', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to exercise option', 'error');
    }
  }
  async function handleDoNotExercise(addr: string) {
    if (!confirm('Forfeit your collateral? You keep the borrowed USDC.')) return;
    try {
      await service.doNotExercise(addr);
      showToast('Option declined — collateral forfeited', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to decline option', 'error');
    }
  }
  async function handleCancel(id: string) {
    if (!confirm('Cancel this loan request?')) return;
    try {
      await service.cancelLoan(BigInt(id));
      removeLoan(id);
      showToast('Loan request cancelled', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to cancel loan', 'error');
    }
  }

  if (loans.length === 0) {
    return (
      <div className="bg-zend-surface rounded-2xl p-12 text-center border border-zend-border shadow-card">
        <div className="w-20 h-20 rounded-full bg-zend-electric-soft flex items-center justify-center mx-auto mb-5 animate-float">
          <svg className="w-10 h-10 text-zend-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <p className="text-zend-ink font-heading font-semibold mb-1">No active loans</p>
        <p className="text-sm text-zend-ink-secondary mb-6">Your active and pending loans will appear here once you borrow.</p>
        <a href="/app" className="inline-block px-6 py-2.5 rounded-xl bg-coral-gradient text-white text-sm font-heading font-semibold hover:shadow-coral-glow transition-all">
          Borrow Now
        </a>
      </div>
    );
  }

  return (
    <div>
      {loans.map((loan) => (
        <LoanCard key={loan.quotationId.toString()} loan={loan} onExercise={handleExercise} onDoNotExercise={handleDoNotExercise} onCancel={handleCancel} />
      ))}
    </div>
  );
}
