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
  useEffect(() => {
    if (!address || !state.activeLoanRequestId || subscribedRef.current) return;

    subscribedRef.current = true;

    const unsubscribe = service.subscribeToFactory({
      onOfferMade: (event: any) => {
        const id = event.quotationId?.toString();
        if (!id || id !== state.activeLoanRequestId) return;
        addOffer(id, {
          offeror: event.offeror || '',
          encryptedAmount: event.offerSignature || event.encryptedAmount || '',
          signingKey: event.signingKey || '',
        });
      },
      onSettled: (event: any) => {
        const id = event.quotationId?.toString();
        if (!id || id !== state.activeLoanRequestId) return;
        upsertLoan(id, { status: 'active', optionAddress: event.optionAddress });
      },
      onCancelled: (event: any) => {
        const id = event.quotationId?.toString();
        if (!id) return;
        setLoanStatus(id, 'cancelled');
      },
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      subscribedRef.current = false;
    };
  }, [address, state.activeLoanRequestId, service, upsertLoan, addOffer, setLoanStatus]);
}
