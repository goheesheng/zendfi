'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useThetanuts } from '@/context/ThetanutsContext';
import { useLoanContext } from '@/context/LoanContext';
import { USDC_ADDRESS } from '@/services/constants';
import type { LoanStatus } from '@/types';

/**
 * Loads existing user positions from the Thetanuts SDK indexer on wallet connect.
 * Maps StateRfq objects to our Loan type and upserts them into context.
 */
export function useLoadPositions() {
  const { address } = useAccount();
  const { service } = useThetanuts();
  const { upsertLoan } = useLoanContext();
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!address || loadedRef.current === address) return;
    loadedRef.current = address;

    async function loadFromIndexer() {
      try {
        const rfqs = await service.getUserRfqs();
        if (!rfqs || !Array.isArray(rfqs)) return;

        const now = Math.floor(Date.now() / 1000);

        for (const rfq of rfqs) {
          try {
            const quotationId = rfq.id;
            if (!quotationId) continue;

            // Map SDK status to our LoanStatus
            let status: LoanStatus = 'requested';
            const optionAddress = rfq.optionAddress;
            const expiryTimestamp = rfq.expiryTimestamp || 0;

            if (rfq.status === 'cancelled') {
              status = 'cancelled';
            } else if (rfq.status === 'settled' && optionAddress) {
              // Settled = option deployed. Check if past exercise window
              if (expiryTimestamp > 0 && now > expiryTimestamp + 3600) {
                // Past exercise window — try to check if exercised
                try {
                  const optInfo = await service.getOptionInfo(optionAddress);
                  status = optInfo.isSettled ? 'exercised' : 'expired';
                } catch {
                  status = 'expired';
                }
              } else {
                status = 'active';
              }
            } else if (rfq.status === 'active') {
              // Active RFQ = still waiting for offers or competing
              if (rfq.convertToLimitOrder) {
                status = 'limitOrder';
              } else {
                status = 'competing';
              }
            }

            // Parse strikes — SDK returns string[] with 8 decimals
            const strikeBig = rfq.strikes.length > 0 ? BigInt(rfq.strikes[0]) : 0n;

            // Parse collateral amount
            const collateralAmount = BigInt(rfq.numContracts || '0');

            upsertLoan(quotationId, {
              quotationId: BigInt(quotationId),
              requester: rfq.requester,
              collateralToken: rfq.collateral,
              collateralAmount,
              settlementToken: USDC_ADDRESS,
              strike: strikeBig,
              expiryTimestamp,
              offerEndTimestamp: rfq.offerEndTimestamp || 0,
              minSettlementAmount: BigInt(rfq.reservePrice || '0'),
              status,
              optionAddress: optionAddress || undefined,
              createdAt: (rfq.createdAt || Math.floor(Date.now() / 1000)) * 1000,
              offers: [],
            });
          } catch (e) {
            console.warn('Failed to process RFQ:', rfq.id, e);
          }
        }

        console.log(`Loaded ${rfqs.length} RFQs from indexer`);
      } catch (e) {
        console.warn('Failed to load positions from indexer:', e);
      }
    }

    loadFromIndexer();
  }, [address, service, upsertLoan]);
}
