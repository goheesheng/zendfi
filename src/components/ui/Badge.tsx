const variants: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  competing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  settled: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  action: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  exercised: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  declined: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function Badge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase ${variants[status] || variants.cancelled}`}>
      {status}
    </span>
  );
}
