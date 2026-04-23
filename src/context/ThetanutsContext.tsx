'use client';

import { createContext, useContext, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { JsonRpcProvider, BrowserProvider } from 'ethers';
import { useWalletClient } from 'wagmi';
import { ThetanutsService } from '@/services/thetanuts';
import { CHAIN_ID } from '@/services/constants';

const readProvider = new JsonRpcProvider('https://mainnet.base.org', CHAIN_ID);

interface ThetanutsContextValue {
  service: ThetanutsService;
}

const ThetanutsContext = createContext<ThetanutsContextValue | null>(null);

export function ThetanutsProvider({ children }: { children: ReactNode }) {
  const { data: walletClient } = useWalletClient();
  const serviceRef = useRef(new ThetanutsService(readProvider));

  useEffect(() => {
    if (!walletClient) return;
    const { account, transport } = walletClient;
    const provider = new BrowserProvider(transport);
    provider.getSigner().then((signer) => {
      serviceRef.current.setSigner(signer, account.address);
    });
  }, [walletClient]);

  const value = useMemo(() => ({ service: serviceRef.current }), []);

  return (
    <ThetanutsContext.Provider value={value}>
      {children}
    </ThetanutsContext.Provider>
  );
}

export function useThetanuts() {
  const ctx = useContext(ThetanutsContext);
  if (!ctx) throw new Error('useThetanuts must be used within ThetanutsProvider');
  return ctx;
}
