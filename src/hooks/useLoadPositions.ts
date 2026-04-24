'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useLoanContext } from '@/context/LoanContext';
import { LOAN_INDEXER_URL, USDC_ADDRESS } from '@/services/constants';
import type { LoanStatus } from '@/types';

/**
 * Loads existing user positions from the ZendFi loan indexer API.
 * The indexer (Cloudflare Worker) scans LoanCoordinator events and returns
 * all loans with their current status, option addresses, and settlement details.
 *
 * The Thetanuts SDK indexer doesn't work for this because the OptionFactory
 * sees the LoanCoordinator as the requester, not the user's wallet.
 */
export function useLoadPositions() {
  const { address } = useAccount();
  const { upsertLoan } = useLoanContext();
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!address || loadedRef.current === address) return;
    loadedRef.current = address;

    async function loadFromIndexer() {
      try {
        const response = await fetch(`${LOAN_INDEXER_URL}/api/state`);
        if (!response.ok) throw new Error(`Indexer returned ${response.status}`);

        const data = await response.json();
        const loans = data.loans || {};
        const now = Math.floor(Date.now() / 1000);
        let loaded = 0;

        for (const [quotationId, loan] of Object.entries(loans as Record<string, any>)) {
          // Only load loans for the connected address
          if (loan.requester?.toLowerCase() !== address.toLowerCase()) continue;

          const expiryTimestamp = Number(loan.expiryTimestamp || 0);
          const optionAddress = loan.optionAddress || loan.finalOption;

          // Determine status
          let status: LoanStatus;
          if (loan.status === 'cancelled') {
            status = 'cancelled';
          } else if (loan.status === 'settled' || loan.status === 'active') {
            if (expiryTimestamp > 0 && now > expiryTimestamp + 3600) {
              // Past exercise window
              status = loan.exercised ? 'exercised' : 'expired';
            } else {
              status = 'active';
            }
          } else if (loan.status === 'limitOrder' || loan.convertToLimitOrder) {
            status = 'limitOrder';
          } else if (loan.status === 'competing') {
            status = 'competing';
          } else {
            status = 'requested';
          }

          upsertLoan(quotationId, {
            quotationId: BigInt(quotationId),
            requester: loan.requester,
            collateralToken: loan.collateralToken || '',
            collateralAmount: BigInt(loan.collateralAmount?.toString() || '0'),
            settlementToken: loan.settlementToken || USDC_ADDRESS,
            strike: BigInt(loan.strike?.toString() || '0'),
            expiryTimestamp,
            offerEndTimestamp: Number(loan.offerEndTimestamp || 0),
            minSettlementAmount: BigInt(loan.minSettlementAmount?.toString() || '0'),
            netLoanAmount: loan.settlementAmount ? BigInt(loan.settlementAmount.toString()) : undefined,
            status,
            optionAddress: optionAddress || undefined,
            createdAt: Number(loan.createdAt || loan.timestamp || Date.now() / 1000) * 1000,
            offers: [],
          });
          loaded++;
        }

        console.log(`Loaded ${loaded} loans from indexer for ${address}`);
      } catch (e) {
        console.warn('Failed to load from indexer:', e);
      }
    }

    loadFromIndexer();
  }, [address, upsertLoan]);
}
