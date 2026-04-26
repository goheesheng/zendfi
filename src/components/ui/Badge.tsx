const variants: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  competing: 'bg-blue-100 text-blue-700',
  settled: 'bg-blue-100 text-blue-700',
  action: 'bg-amber-100 text-amber-700',
  exercised: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

export function Badge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase ${variants[status] || variants.cancelled}`}>
      {status}
    </span>
  );
}
