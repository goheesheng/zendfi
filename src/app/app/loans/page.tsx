'use client';

import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';
import { LoanCard } from '@/components/app/LoanCard';

export default function LoansPage() {
  const { getActiveLoans, removeLoan } = useLoanContext();
  const { service } = useThetanuts();
  const loans = getActiveLoans();

  async function handleExercise(addr: string) {
    try { await service.exerciseOption(addr); } catch (e: any) { alert(e.message); }
  }
  async function handleDoNotExercise(addr: string) {
    if (!confirm('Forfeit your collateral? You keep the borrowed USDC.')) return;
    try { await service.doNotExercise(addr); } catch (e: any) { alert(e.message); }
  }
  async function handleCancel(id: string) {
    if (!confirm('Cancel this loan request?')) return;
    try { await service.cancelLoan(BigInt(id)); removeLoan(id); } catch (e: any) { alert(e.message); }
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
