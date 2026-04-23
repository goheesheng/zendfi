'use client';

import { useEffect } from 'react';
import { useThetanuts } from '@/context/ThetanutsContext';
import { useLoanContext } from '@/context/LoanContext';
import { useAccount } from 'wagmi';

export function useContractEvents() {
  const { service } = useThetanuts();
  const { upsertLoan, addOffer, setLoanStatus } = useLoanContext();
  const { address } = useAccount();

  useEffect(() => {
    if (!address) return;

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
    };
  }, [address, service, upsertLoan, addOffer, setLoanStatus]);
}
