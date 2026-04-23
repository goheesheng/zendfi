'use client';

import { LOAN_ASSETS } from '@/services/constants';
import { formatUsdc } from '@/services/formatting';
import { ethers } from 'ethers';
import type { Loan } from '@/types';

export function LendTable({ loans }: { loans: Loan[] }) {
  if (loans.length === 0) {
    return <p className="text-center py-12 text-gray-400 dark:text-gray-500">No lending opportunities available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-zend-border">
            <th className="text-left py-3 font-medium">Asset</th>
            <th className="text-right py-3 font-medium">Lend</th>
            <th className="text-right py-3 font-medium">Receive</th>
            <th className="text-center py-3 font-medium">APR</th>
            <th className="text-center py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => {
            const asset = Object.entries(LOAN_ASSETS).find(
              ([_, a]) => a.collateral.toLowerCase() === loan.collateralToken.toLowerCase()
            );
            const symbol = asset ? asset[1].symbol : '?';
            const decimals = asset ? asset[1].decimals : 18;

            return (
              <tr key={loan.quotationId.toString()} className="border-b border-gray-100 dark:border-zend-border/50">
                <td className="py-3 font-semibold text-gray-900 dark:text-white">{symbol}</td>
                <td className="py-3 text-right text-gray-900 dark:text-white">{formatUsdc(loan.minSettlementAmount)} USDC</td>
                <td className="py-3 text-right text-gray-900 dark:text-white">{ethers.formatUnits(loan.collateralAmount, decimals)} {symbol}</td>
                <td className="py-3 text-center text-emerald-500">--</td>
                <td className="py-3 text-center">
                  <button className="px-3 py-1 rounded-lg bg-zend-accent text-white text-xs font-semibold hover:bg-zend-accent-hover transition-colors">Lend</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
