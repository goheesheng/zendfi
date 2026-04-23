'use client';

import { createContext, useContext, useMemo, useEffect, useRef, useCallback, useState, type ReactNode } from 'react';
import { JsonRpcProvider, BrowserProvider } from 'ethers';
import { useWalletClient } from 'wagmi';
import { ThetanutsService } from '@/services/thetanuts';
import { CHAIN_ID } from '@/services/constants';

let _readProvider: JsonRpcProvider | null = null;
function getReadProvider(): JsonRpcProvider {
  if (!_readProvider) {
    _readProvider = new JsonRpcProvider('https://mainnet.base.org', CHAIN_ID, {
      staticNetwork: true,
      polling: true,
      pollingInterval: 15000,
    });
  }
  return _readProvider;
}

interface ThetanutsContextValue {
  service: ThetanutsService;
}

const ThetanutsContext = createContext<ThetanutsContextValue | null>(null);

export function ThetanutsProvider({ children }: { children: ReactNode }) {
  const { data: walletClient } = useWalletClient();
  const serviceRef = useRef<ThetanutsService | null>(null);
  const [, forceUpdate] = useState(0);

  // Lazy-init the service on first render (client-side only)
  if (!serviceRef.current) {
    serviceRef.current = new ThetanutsService(getReadProvider());
  }

  useEffect(() => {
    if (!walletClient || !serviceRef.current) return;
    const { account, transport } = walletClient;
    const provider = new BrowserProvider(transport);
    provider.getSigner().then((signer) => {
      serviceRef.current!.setSigner(signer, account.address);
      forceUpdate((n) => n + 1);
    });
  }, [walletClient]);

  const value = useMemo(() => ({ service: serviceRef.current! }), []);

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
