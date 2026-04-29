'use client';

import { useState, useEffect } from 'react';
import { useBalances } from '@/hooks/useBalances';
import { useLoanContext } from '@/context/LoanContext';
import { TokenIcon } from '@/components/ui/TokenIcon';
import {
  LOAN_COORDINATOR_ADDRESS,
  OPTION_FACTORY_ADDRESS,
  USDC_ADDRESS,
  PROMO_CONFIG,
  PROTOCOL_FEE_BPS,
  LOAN_INDEXER_URL,
} from '@/services/constants';

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';

interface RecentLoan {
  quotationId: string;
  status: string;
  collateralAmount: string;
  minSettlementAmount: string;
  collateralToken: string;
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatEth(wei: string) {
  const n = Number(wei) / 1e18;
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.001) return n.toFixed(4);
  return n.toFixed(6);
}

function formatUsdc(raw: string) {
  return (Number(raw) / 1e6).toFixed(2);
}

export function AnalyticsDashboard() {
  const { mmLiquidity } = useBalances();
  const { state } = useLoanContext();
  const [recentLoans, setRecentLoans] = useState<RecentLoan[]>([]);
  const [ethPrice, setEthPrice] = useState<string>('--');
  const [activityFilter, setActivityFilter] = useState<'all' | 'borrows' | 'settlements'>('all');

  // Fetch recent activity from indexer
  useEffect(() => {
    fetch(`${LOAN_INDEXER_URL}/api/state`)
      .then((r) => r.json())
      .then((data) => {
        const loans: Record<string, any> = data.loans || {};
        const sorted = Object.values(loans)
          .sort((a: any, b: any) => Number(b.quotationId) - Number(a.quotationId))
          .slice(0, 8) as RecentLoan[];
        setRecentLoans(sorted);
      })
      .catch(() => {});
  }, []);

  // Fetch ETH price from pricing proxy
  useEffect(() => {
    fetch('/api/pricing')
      .then((r) => r.json())
      .then((data) => {
        const ethKey = Object.keys(data).find((k) => k.startsWith('ETH'));
        if (ethKey && data[ethKey]?.underlying_price) {
          setEthPrice(`$${Math.round(data[ethKey].underlying_price).toLocaleString()}`);
        }
      })
      .catch(() => {});
  }, []);

  const activeLoans = state.loans.size;

  const filteredLoans = recentLoans.filter((l) => {
    if (activityFilter === 'borrows') return l.status === 'requested';
    if (activityFilter === 'settlements') return l.status === 'settled';
    return true;
  });

  const premiumBars = [95, 85, 75, 65, 55, 48, 40, 34, 28, 22, 18, 14, 10, 8, 8];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">Market Overview <TokenIcon symbol="ETH" size={22} /></h2>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">ETH Price</div>
          <div className="text-xl font-bold text-gray-900">{ethPrice !== '--' ? ethPrice : <span className="text-sm text-gray-300">Loading...</span>}</div>
          <div className="text-[11px] text-gray-300 mt-1">Chainlink Oracle</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">MM Liquidity</div>
          <div className="text-xl font-bold text-zend-blue">{mmLiquidity !== '--' && !isNaN(Number(mmLiquidity)) ? `$${Number(mmLiquidity).toLocaleString()}` : <span className="text-sm text-gray-300">Loading...</span>}</div>
          <div className="text-[11px] text-gray-300 mt-1">USDC available</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Promo APR</div>
          <div className="text-xl font-bold text-emerald-500">{PROMO_CONFIG.promoBorrowingFeePercent}%</div>
          <div className="text-[11px] text-gray-300 mt-1">Qualifying loans</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Active Loans</div>
          <div className="text-xl font-bold text-gray-900">{activeLoans}</div>
          <div className="text-[11px] text-gray-300 mt-1">On-chain</div>
        </div>
      </div>

      {/* Option Premium Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">Option Premium vs Strike Price</h4>
        <p className="text-[11px] text-gray-400 mb-3">Lower strike = higher premium (more protection costs more)</p>
        <div className="h-[100px] bg-gradient-to-b from-blue-50 to-white rounded-lg flex items-end px-2 pb-2 gap-[3px]">
          {premiumBars.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm ${i === 13 ? 'bg-emerald-500' : 'bg-zend-blue/50'}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-300 mt-1 px-1">
          <span>$800</span><span>$1,000</span><span>$1,200</span><span>$1,400</span>
          <span className="text-emerald-500 font-semibold">Promo</span><span>$1,600</span><span>$1,800</span>
        </div>
      </div>

      {/* Two-column info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Loan Parameters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zend-blue" />
            Loan Parameters
          </h4>
          <div className="space-y-0">
            {[
              ['Max LTV', '50%'],
              ['Liquidation Risk', 'None', 'green'],
              ['Margin Calls', 'None', 'green'],
              ['Option Type', 'Physically-settled call'],
              ['Settlement', 'European (at expiry)'],
              ['Exercise Window', '1 hour'],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between text-sm py-[5px] border-b border-gray-50 last:border-0">
                <span className="text-gray-400">{label}</span>
                <span className={`font-semibold ${color === 'green' ? 'text-emerald-500' : 'text-gray-900'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Cost Breakdown
          </h4>
          <div className="space-y-0">
            {[
              ['Interest (APR)', `${PROMO_CONFIG.promoBorrowingFeePercent}%`, 'badge'],
              ['Option Premium', 'Waived', 'green'],
              ['Protocol Fee', `${PROTOCOL_FEE_BPS} bps`],
              ['Keep Order Open', state.settings.keepOrderOpen ? 'Enabled' : 'Disabled', state.settings.keepOrderOpen ? 'blue' : ''],
              ['Min Duration', `${state.settings.minDurationDays} days`],
              ['Collateral Types', 'ETH, cbBTC'],
            ].map(([label, value, style]) => (
              <div key={label as string} className="flex justify-between text-sm py-[5px] border-b border-gray-50 last:border-0">
                <span className="text-gray-400">{label}</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  {value}
                  {style === 'badge' && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-semibold uppercase">Promo</span>}
                  {style === 'green' && <span className="text-emerald-500">{''}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expiry Scenarios */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">What Happens at Expiry?</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-gray-400 uppercase tracking-wider">
              <th className="text-left pb-2 font-medium">Scenario</th>
              <th className="text-left pb-2 font-medium">ETH Price</th>
              <th className="text-left pb-2 font-medium">You Do</th>
              <th className="text-left pb-2 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-50">
              <td className="py-2 font-semibold text-gray-900">Above strike</td>
              <td className="py-2 text-emerald-500">Above $1,500</td>
              <td className="py-2 text-gray-600">Repay USDC</td>
              <td className="py-2 text-emerald-500">Get ETH back</td>
            </tr>
            <tr className="border-t border-gray-50">
              <td className="py-2 font-semibold text-gray-900">Below strike</td>
              <td className="py-2 text-amber-500">Below $1,500</td>
              <td className="py-2 text-gray-600">Walk away</td>
              <td className="py-2 text-gray-500">Keep USDC, lose ETH</td>
            </tr>
            <tr className="border-t border-gray-50">
              <td className="py-2 font-semibold text-gray-900">Do nothing</td>
              <td className="py-2 text-gray-400">Any price</td>
              <td className="py-2 text-gray-600">No action in 1h</td>
              <td className="py-2 text-amber-500">Lender keeps collateral</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Protocol Activity</h4>
        <div className="flex gap-4 mb-3">
          {(['all', 'borrows', 'settlements'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActivityFilter(f)}
              className={`text-sm font-medium py-2 px-1 border-b-2 transition-colors capitalize min-h-[44px] ${
                activityFilter === f ? 'text-gray-900 border-zend-blue' : 'text-gray-400 border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {filteredLoans.length === 0 ? (
          <p className="text-sm text-gray-300 py-2">No activity found</p>
        ) : (
          <div className="space-y-0">
            {filteredLoans.slice(0, 5).map((loan) => (
              <div key={loan.quotationId} className="flex justify-between text-sm py-[5px] border-b border-gray-50 last:border-0">
                <span className="text-gray-400">
                  QID {loan.quotationId} — <span className="capitalize">{loan.status}</span>
                </span>
                <span className="font-semibold text-gray-900">
                  {loan.collateralToken?.toLowerCase() === WETH_ADDRESS
                    ? `${formatEth(loan.collateralAmount)} ETH`
                    : `${formatEth(loan.collateralAmount)} BTC`}
                  {' → '}
                  {formatUsdc(loan.minSettlementAmount)} USDC
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contract Addresses */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contract Addresses</h4>
        <div className="space-y-0">
          {[
            ['LoanCoordinator', LOAN_COORDINATOR_ADDRESS],
            ['OptionFactory', OPTION_FACTORY_ADDRESS],
            ['USDC', USDC_ADDRESS],
            ['WETH', WETH_ADDRESS],
          ].map(([name, addr]) => (
            <div key={name} className="flex justify-between text-sm py-[5px] border-b border-gray-50 last:border-0">
              <span className="text-gray-400">{name}</span>
              <a
                href={`https://basescan.org/address/${addr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-zend-blue hover:underline"
              >
                {shortenAddress(addr)} ↗
              </a>
            </div>
          ))}
          <div className="flex justify-between text-sm py-[5px]">
            <span className="text-gray-400">Network</span>
            <span className="font-semibold text-gray-900">Base (8453)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
