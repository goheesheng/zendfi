'use client';

interface Props {
  expiryDate: string;
  repayAmount: string;
  effectiveApr: string;
}

export function PaybackPanel({ expiryDate, repayAmount, effectiveApr }: Props) {
  return (
    <div className="bg-indigo-500/[0.04] border border-indigo-500/10 rounded-2xl p-5">
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="text-white/30">Payback on {expiryDate}</span>
        <span className="font-semibold text-white">{repayAmount}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-white/30">Effective APR</span>
        <span className="font-semibold text-emerald-500">{effectiveApr}</span>
      </div>
    </div>
  );
}
