'use client';

import { useEffect, useRef } from 'react';
import { useThetanuts } from '@/context/ThetanutsContext';
import { useLoanContext } from '@/context/LoanContext';
import { useAccount } from 'wagmi';

export function useContractEvents() {
  const { service } = useThetanuts();
  const { state, upsertLoan, addOffer, setLoanStatus } = useLoanContext();
  const { address } = useAccount();
  const subscribedRef = useRef(false);

  // Only subscribe to events when there's an active loan request
  // This avoids the "filter not found" errors from constant RPC polling
  useEffect(() => {
    if (!address || !state.activeLoanRequestId || subscribedRef.current) return;

    subscribedRef.current = true;

    const unsubOffer = service.onOfferMade((quotationId, offeror, ...args) => {
      const id = quotationId.toString();
      addOffer(id, {
        offeror,
        encryptedAmount: args[0] || '',
        signingKey: args[1] || '',
      });
    });

    const unsubSettled = service.onQuotationSettled((quotationId, _requester, _winner, optionAddress) => {
      const id = quotationId.toString();
      upsertLoan(id, { status: 'active', optionAddress });
    });

    const unsubCancelled = service.onQuotationCancelled((quotationId) => {
      setLoanStatus(quotationId.toString(), 'cancelled');
    });

    return () => {
      unsubOffer();
      unsubSettled();
      unsubCancelled();
      subscribedRef.current = false;
    };
  }, [address, state.activeLoanRequestId, service, upsertLoan, addOffer, setLoanStatus]);
}
