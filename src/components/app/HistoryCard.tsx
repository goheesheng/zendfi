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
    <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex justify-between items-center mb-5">
        <span className="font-semibold text-gray-900 text-xl">Loan #{loan.quotationId.toString()}</span>
        <Badge status={loan.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1.5">Deposited</div>
          <div className="font-semibold text-gray-900 text-base">{parseFloat(collateral).toFixed(6)} {symbol}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1.5">Borrowed</div>
          <div className="font-semibold text-gray-900 text-base">{borrowed ? `${borrowed} USDC` : '--'}</div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {strikeNum > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Strike</span>
            <span className="text-gray-900">${strikeNum.toLocaleString()}</span>
          </div>
        )}
        {loan.expiryTimestamp > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Expiry</span>
            <span className="text-gray-900">{formatDate(loan.expiryTimestamp)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-400">Created</span>
          <span className="text-gray-900">{new Date(loan.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
