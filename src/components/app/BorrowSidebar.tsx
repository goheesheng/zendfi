'use client';

import { useLoanContext } from '@/context/LoanContext';
import { PROMO_CONFIG } from '@/services/constants';
import { TokenIcon } from '@/components/ui/TokenIcon';

export function BorrowSidebar() {
  const { state, getActiveLoans } = useLoanContext();
  const activeLoans = getActiveLoans();

  return (
    <div className="space-y-3 mt-6">
      {/* How It Works */}
      <div className="bg-white dark:bg-zend-card border border-zend-accent-soft dark:border-zend-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-zend-blue/10 flex items-center justify-center text-[10px] text-zend-blue font-bold">?</span>
          How Borrowing Works
        </h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Deposit ETH or BTC as collateral', icon: '↓' },
            { step: '2', text: 'Market makers compete for 30 seconds', icon: '⏱' },
            { step: '3', text: 'Accept the best rate, receive USDC', icon: '✓' },
            { step: '4', text: 'At expiry: repay to reclaim, or walk away', icon: '↗' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-zend-blue/10 flex items-center justify-center text-[11px] text-zend-blue font-bold shrink-0 mt-0.5">
                {item.step}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300 leading-snug">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
          🔥 Zero Premium Promo
        </h3>
        <p className="text-xs text-emerald-700 leading-relaxed mb-2">
          Loans with &gt;90 day expiry and &lt;50% LTV get the option premium waived. Effective APR as low as {PROMO_CONFIG.promoBorrowingFeePercent}%.
        </p>
        <div className="flex gap-4 text-[11px] text-emerald-600">
          <span>Min expiry: 90 days</span>
          <span>Max LTV: 50%</span>
        </div>
      </div>

      {/* Active Loans Summary */}
      <div className="bg-white dark:bg-zend-card border border-gray-200 dark:border-zend-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Your Active Loans
        </h3>
        {activeLoans.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">No active loans</p>
            <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1">Your loans will appear here after borrowing</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeLoans.slice(0, 3).map((loan) => (
              <div key={loan.quotationId.toString()} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-zend-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <TokenIcon symbol="ETH" size={16} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Loan #{loan.quotationId.toString()}</span>
                </div>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 capitalize">{loan.status}</span>
              </div>
            ))}
            {activeLoans.length > 3 && (
              <a href="/app/loans" className="block text-xs text-zend-blue text-center mt-1 hover:underline">
                View all {activeLoans.length} loans →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Supported Collateral */}
      <div className="bg-white dark:bg-zend-card border border-gray-200 dark:border-zend-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Supported Collateral</h3>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-zend-bg rounded-lg px-3 py-2 flex-1">
            <TokenIcon symbol="ETH" size={20} />
            <div>
              <div className="text-xs font-semibold text-gray-900 dark:text-white">ETH</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">Wrapped Ether</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-zend-bg rounded-lg px-3 py-2 flex-1">
            <TokenIcon symbol="BTC" size={20} />
            <div>
              <div className="text-xs font-semibold text-gray-900 dark:text-white">cbBTC</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">Coinbase BTC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Facts */}
      <div className="bg-white dark:bg-zend-card border border-gray-200 dark:border-zend-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Why ZendFi?</h3>
        <div className="space-y-2">
          {[
            { label: 'No liquidations', desc: 'Your position is never force-closed' },
            { label: 'No margin calls', desc: 'No top-ups, no monitoring needed' },
            { label: 'Fixed terms', desc: 'Rate locked at origination, no surprises' },
            { label: 'Non-custodial', desc: 'Collateral in audited smart contracts' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <span className="text-emerald-500 text-xs mt-0.5">✓</span>
              <div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{item.label}</span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
