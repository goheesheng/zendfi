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
    return <p className="text-center py-12 text-gray-400 dark:text-gray-500">No active loans found.</p>;
  }

  return (
    <div>
      {loans.map((loan) => (
        <LoanCard key={loan.quotationId.toString()} loan={loan} onExercise={handleExercise} onDoNotExercise={handleDoNotExercise} onCancel={handleCancel} />
      ))}
    </div>
  );
}
