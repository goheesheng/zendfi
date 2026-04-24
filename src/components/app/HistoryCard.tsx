import { Badge } from '@/components/ui/Badge';
import { LOAN_ASSETS, STRIKE_DECIMALS } from '@/services/constants';
import { formatDate } from '@/services/formatting';
import { ethers } from 'ethers';
import type { Loan } from '@/types';

export function HistoryCard({ loan }: { loan: Loan }) {
  const asset = Object.entries(LOAN_ASSETS).find(
    ([_, a]) => a.collateral.toLowerCase() === loan.collateralToken.toLowerCase()
  );
  const symbol = asset ? asset[1].symbol : '?';
  const decimals = asset ? asset[1].decimals : 18;
  const collateral = ethers.formatUnits(loan.collateralAmount, decimals);
  const strikeNum = Number(loan.strike) / 10 ** STRIKE_DECIMALS;

  const borrowed = loan.netLoanAmount
    ? parseFloat(ethers.formatUnits(loan.netLoanAmount, 6)).toFixed(2)
    : loan.minSettlementAmount > 0n
      ? parseFloat(ethers.formatUnits(loan.minSettlementAmount, 6)).toFixed(2)
      : null;

  return (
    <div className="glass-card rounded-2xl p-5 mb-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-white">Loan #{loan.quotationId.toString()}</span>
        <Badge status={loan.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/[0.03] rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Deposited</div>
          <div className="font-semibold text-white text-sm">{parseFloat(collateral).toFixed(6)} {symbol}</div>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Borrowed</div>
          <div className="font-semibold text-white text-sm">{borrowed ? `${borrowed} USDC` : '--'}</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {strikeNum > 0 && (
          <div className="flex justify-between">
            <span className="text-white/30">Strike</span>
            <span className="text-white">${strikeNum.toLocaleString()}</span>
          </div>
        )}
        {loan.expiryTimestamp > 0 && (
          <div className="flex justify-between">
            <span className="text-white/30">Expiry</span>
            <span className="text-white">{formatDate(loan.expiryTimestamp)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-white/30">Created</span>
          <span className="text-white">{new Date(loan.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
