'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useThetanuts } from '@/context/ThetanutsContext';
import { useToast } from '@/components/ui/Toast';
import {
  LOAN_ASSETS,
  STRIKE_DECIMALS,
  USDC_ADDRESS,
  OPTION_FACTORY_ADDRESS,
} from '@/services/constants';
import { formatUsdc, formatDate } from '@/services/formatting';
import { ethers } from 'ethers';
import type { LendingOpportunity } from '@/types';

interface LendTableProps {
  opportunities: LendingOpportunity[];
  loading?: boolean;
  onRefresh?: () => void;
}

// Per-row state for approval/lend actions
interface RowState {
  approving: boolean;
  lending: boolean;
  approved: boolean | null; // null = not yet checked
}

function useUsdcAllowance(spender: string) {
  const { address } = useAccount();
  const { service } = useThetanuts();

  const checkAllowance = useCallback(
    async (required: bigint): Promise<boolean> => {
      if (!address) return false;
      try {
        const allowance = await service.getAllowance(USDC_ADDRESS, spender);
        return allowance >= required;
      } catch {
        return false;
      }
    },
    [address, service, spender]
  );

  return { checkAllowance };
}

function LendRow({
  opp,
  onRefresh,
}: {
  opp: LendingOpportunity;
  onRefresh?: () => void;
}) {
  const { address } = useAccount();
  const { service } = useThetanuts();
  const { showToast } = useToast();
  const { checkAllowance } = useUsdcAllowance(OPTION_FACTORY_ADDRESS);

  const [rowState, setRowState] = useState<RowState>({
    approving: false,
    lending: false,
    approved: null,
  });

  // Determine asset info from collateral token
  const assetEntry = Object.entries(LOAN_ASSETS).find(
    ([_, a]) => a.collateral.toLowerCase() === opp.collateralToken.toLowerCase()
  );
  const symbol = assetEntry ? assetEntry[1].symbol : '?';
  const decimals = assetEntry ? assetEntry[1].decimals : 18;
  const icon = assetEntry ? assetEntry[1].icon : '?';

  // Derived numbers
  const collateralAmountBig = BigInt(opp.collateralAmount);
  const minSettlementAmountBig = BigInt(opp.minSettlementAmount);
  const strikeBig = BigInt(opp.strike);

  const collateralFormatted = ethers.formatUnits(collateralAmountBig, decimals);
  const lendAmountFormatted = formatUsdc(minSettlementAmountBig);

  // Repayment = collateral * strike (strike has 8 decimals, USDC has 6 decimals)
  const repaymentBig =
    (collateralAmountBig * strikeBig) / BigInt(10 ** (decimals + STRIKE_DECIMALS - 6));
  const repaymentFormatted = formatUsdc(repaymentBig);

  // APR calculation
  const now = Math.floor(Date.now() / 1000);
  const secondsToExpiry = opp.expiryTimestamp - now;
  const lendAmount = Number(minSettlementAmountBig) / 1e6;
  const repayAmount = Number(repaymentBig) / 1e6;
  const apr =
    secondsToExpiry > 0 && lendAmount > 0
      ? ((repayAmount / lendAmount - 1) * (31536000 / secondsToExpiry)) * 100
      : 0;

  const expiryDate = new Date(opp.expiryTimestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Check allowance on mount
  useEffect(() => {
    if (!address) return;
    checkAllowance(minSettlementAmountBig).then((ok) =>
      setRowState((s) => ({ ...s, approved: ok }))
    );
  }, [address, checkAllowance, minSettlementAmountBig]);

  const handleApprove = async () => {
    if (!address) {
      showToast('Connect wallet first', 'error');
      return;
    }
    setRowState((s) => ({ ...s, approving: true }));
    try {
      await service.ensureAllowance(USDC_ADDRESS, OPTION_FACTORY_ADDRESS, minSettlementAmountBig);
      setRowState((s) => ({ ...s, approving: false, approved: true }));
      showToast('USDC approved', 'success');
    } catch (err: any) {
      showToast(err?.reason ?? err?.message ?? 'Approval failed', 'error');
      setRowState((s) => ({ ...s, approving: false }));
    }
  };

  const handleLend = async () => {
    if (!address) {
      showToast('Connect wallet first', 'error');
      return;
    }
    setRowState((s) => ({ ...s, lending: true }));
    try {
      // Re-check approval right before lending
      const alreadyApproved = await checkAllowance(minSettlementAmountBig);
      if (!alreadyApproved) {
        showToast('Approving USDC…', 'pending');
        await service.ensureAllowance(USDC_ADDRESS, OPTION_FACTORY_ADDRESS, minSettlementAmountBig);
        showToast('USDC approved', 'success');
      }

      showToast('Submitting lend transaction…', 'pending');
      await service.lend(BigInt(opp.quotationId));
      showToast('Loan filled! You are now the lender.', 'success');
      onRefresh?.();
    } catch (err: any) {
      showToast(err?.reason ?? err?.message ?? 'Transaction failed', 'error');
    } finally {
      setRowState((s) => ({ ...s, lending: false }));
    }
  };

  const isExpired = secondsToExpiry <= 0;
  const isWalletConnected = !!address;

  const actionButton = isExpired ? (
    <span className="text-xs text-gray-400">Expired</span>
  ) : !isWalletConnected ? (
    <span className="text-xs text-gray-400">Connect wallet</span>
  ) : rowState.approved === false ? (
    <button
      onClick={handleApprove}
      disabled={rowState.approving}
      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-gray-900 text-sm font-semibold transition-colors"
    >
      {rowState.approving ? 'Approving…' : 'Approve USDC'}
    </button>
  ) : (
    <button
      onClick={handleLend}
      disabled={rowState.lending}
      className="px-4 py-2.5 rounded-xl bg-zend-accent hover:bg-zend-accent-hover disabled:opacity-60 text-gray-900 text-sm font-semibold transition-colors"
    >
      {rowState.lending ? 'Lending…' : 'Lend'}
    </button>
  );

  return (
    <>
      {/* Desktop row */}
      <tr className="hidden md:table-row border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="py-5 pl-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">{icon}</span>
            <div>
              <span className="font-semibold text-gray-900 text-base">{symbol}</span>
              <div className="text-[10px] text-gray-400 mt-0.5">QID #{opp.quotationId}</div>
            </div>
          </div>
        </td>
        <td className="py-5 text-right">
          <div className="font-semibold text-gray-900 text-base">{lendAmountFormatted}</div>
          <div className="text-gray-400 text-xs mt-0.5">USDC</div>
        </td>
        <td className="py-5 text-right">
          <div className="font-semibold text-gray-900 text-base">
            {Number(collateralFormatted).toFixed(decimals === 18 ? 6 : 8)}
          </div>
          <div className="text-gray-400 text-xs mt-0.5">{symbol}</div>
        </td>
        <td className="py-5 text-right">
          <div className="font-semibold text-gray-900 text-base">{repaymentFormatted}</div>
          <div className="text-gray-400 text-xs mt-0.5">USDC</div>
        </td>
        <td className="py-5 text-center">
          <span className={`text-base font-bold ${apr > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
            {apr > 0 ? `${apr.toFixed(1)}%` : '--'}
          </span>
        </td>
        <td className="py-5 text-center">
          <span className={`text-sm ${isExpired ? 'text-red-400' : 'text-gray-300'}`}>
            {expiryDate}
          </span>
        </td>
        <td className="py-5 text-center pr-4">{actionButton}</td>
      </tr>

      {/* Mobile card */}
      <tr className="md:hidden">
        <td colSpan={7} className="p-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none">{icon}</span>
                <span className="font-semibold text-gray-900">{symbol}</span>
                <span className="text-[10px] text-gray-400">#{opp.quotationId}</span>
              </div>
              <span className={`text-base font-bold ${apr > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                {apr > 0 ? `${apr.toFixed(1)}% APR` : '--'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">You Provide</div>
                <div className="font-semibold text-gray-900">{lendAmountFormatted} <span className="text-gray-400 text-xs">USDC</span></div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">Repayment</div>
                <div className="font-semibold text-gray-900">{repaymentFormatted} <span className="text-gray-400 text-xs">USDC</span></div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">Collateral</div>
                <div className="font-semibold text-gray-900">{Number(collateralFormatted).toFixed(decimals === 18 ? 4 : 6)} <span className="text-gray-400 text-xs">{symbol}</span></div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">Expiry</div>
                <div className={`font-semibold ${isExpired ? 'text-red-400' : 'text-gray-900'}`}>{expiryDate}</div>
              </div>
            </div>
            <div>{actionButton}</div>
          </div>
        </td>
      </tr>
    </>
  );
}

export function LendTable({ opportunities, loading, onRefresh }: LendTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100" />
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-4">Loading lending opportunities…</p>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-gray-900 font-semibold mb-1">No lending opportunities</p>
        <p className="text-sm text-gray-400">
          Limit orders appear here when borrowers choose to keep their order open. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="hidden md:table-row text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="text-left py-4 pl-4 font-medium">Asset</th>
              <th className="text-right py-4 font-medium">You Provide</th>
              <th className="text-right py-4 font-medium">You Receive</th>
              <th className="text-right py-4 font-medium">Repayment</th>
              <th className="text-center py-4 font-medium">APR</th>
              <th className="text-center py-4 font-medium">Expiry</th>
              <th className="text-center py-4 pr-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <LendRow key={opp.quotationId} opp={opp} onRefresh={onRefresh} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
