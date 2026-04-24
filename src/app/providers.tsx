'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { type ReactNode, useState } from 'react';

const config = getDefaultConfig({
  appName: 'Zend Finance',
  projectId: 'aee60801c5765924c0ad1b6c353a416a',
  chains: [base],
  transports: {
    [base.id]: http('https://rpc.ankr.com/base/5e9458e4bf5a4f8893ad36e5422b9e2289cf89f4b5142312bd9b65ea1162234b'),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
