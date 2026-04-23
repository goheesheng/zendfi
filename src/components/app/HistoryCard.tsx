import { Badge } from '@/components/ui/Badge';
import type { Loan } from '@/types';

export function HistoryCard({ loan }: { loan: Loan }) {
  return (
    <div className="bg-gray-50 dark:bg-zend-card rounded-2xl p-5 border border-gray-200 dark:border-zend-border mb-3">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-900 dark:text-white">Loan #{loan.quotationId.toString()}</span>
        <Badge status={loan.status} />
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">Created</span>
        <span className="text-gray-900 dark:text-white">{new Date(loan.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
