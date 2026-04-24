'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useThetanuts } from '@/context/ThetanutsContext';
import { useLoanContext } from '@/context/LoanContext';
import { USDC_ADDRESS, LOAN_COORDINATOR_ADDRESS } from '@/services/constants';
import { LOAN_COORDINATOR_ABI, OPTION_FACTORY_EVENTS_ABI } from '@/services/abis';
import { Contract, EventLog } from 'ethers';
import type { LoanStatus } from '@/types';

/**
 * Loads existing user positions by scanning LoanCoordinator events on-chain.
 * The SDK indexer doesn't work because LoanCoordinator is the requester in OptionFactory,
 * not the user's wallet directly.
 */
export function useLoadPositions() {
  const { address } = useAccount();
  const { service } = useThetanuts();
  const { upsertLoan } = useLoanContext();
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!address || loadedRef.current === address) return;
    loadedRef.current = address;

    async function loadFromChain() {
      try {
        const client = service.getClient();
        const provider = (service as any).coordinatorRead?.runner;
        if (!provider) return;

        // Scan LoanRequested events filtered by requester = user address
        const coordinator = new Contract(LOAN_COORDINATOR_ADDRESS, LOAN_COORDINATOR_ABI, provider);
        const currentBlock = await provider.provider.getBlockNumber();

        // Scan last ~500k blocks (~3 days on Base at ~2 blocks/sec)
        const fromBlock = Math.max(0, currentBlock - 500000);

        console.log(`Loading loans for ${address} from block ${fromBlock}...`);

        const filter = coordinator.filters.LoanRequested(null, address);
        const events = await coordinator.queryFilter(filter, fromBlock, currentBlock);

        console.log(`Found ${events.length} LoanRequested events`);

        const now = Math.floor(Date.now() / 1000);

        for (const event of events) {
          try {
            if (!(event instanceof EventLog)) continue;
            const args = event.args;

            const quotationId = args[0].toString(); // quotationId
            const collateralToken = args[2]; // collateralToken
            const collateralAmount = args[4]; // collateralAmount
            const minSettlementAmount = args[5]; // minSettlementAmount
            const strike = args[6]; // strike
            const expiryTimestamp = Number(args[7]); // expiryTimestamp
            const offerEndTimestamp = Number(args[8]); // offerEndTimestamp

            // Query current loan state from contract
            const loanData = await service.getLoanRequest(BigInt(quotationId));

            let status: LoanStatus = 'requested';
            let optionAddress: string | undefined;

            if (loanData.isSettled && loanData.settledOptionContract && loanData.settledOptionContract !== '0x0000000000000000000000000000000000000000') {
              optionAddress = loanData.settledOptionContract;

              if (expiryTimestamp > 0 && now > expiryTimestamp + 3600) {
                // Past exercise window
                try {
                  const optInfo = await service.getOptionInfo(optionAddress);
                  status = optInfo.isSettled ? 'exercised' : 'expired';
                } catch {
                  status = 'expired';
                }
              } else {
                status = 'active';
              }
            } else if (now > offerEndTimestamp) {
              status = 'cancelled'; // offer window passed without settlement
            } else {
              status = 'competing';
            }

            upsertLoan(quotationId, {
              quotationId: BigInt(quotationId),
              requester: address,
              collateralToken,
              collateralAmount,
              settlementToken: USDC_ADDRESS,
              strike,
              expiryTimestamp,
              offerEndTimestamp,
              minSettlementAmount,
              status,
              optionAddress,
              createdAt: Date.now(),
              offers: [],
            });
          } catch (e) {
            console.warn('Failed to process loan event:', e);
          }
        }
      } catch (e) {
        console.warn('Failed to load positions from chain:', e);
      }
    }

    loadFromChain();
  }, [address, service, upsertLoan]);
}
