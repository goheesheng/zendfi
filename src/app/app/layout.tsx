'use client';

import { useState } from 'react';
import { Providers } from '@/app/providers';
import { LoanProvider } from '@/context/LoanContext';
import { ThetanutsProvider } from '@/context/ThetanutsContext';
import { Header } from '@/components/app/Header';
import { TabNav } from '@/components/app/TabNav';
import { SettingsModal } from '@/components/app/modals/SettingsModal';
import { ToastProvider } from '@/components/ui/Toast';
import { useContractEvents } from '@/hooks/useContractEvents';
import { useLoadPositions } from '@/hooks/useLoadPositions';

function AppInner({ children }: { children: React.ReactNode }) {
  useContractEvents();
  useLoadPositions();
  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Providers>
      <LoanProvider>
        <ThetanutsProvider>
          <ToastProvider>
            <main className="min-h-screen bg-gray-50 dark:bg-zend-bg text-gray-900 dark:text-white">
              <div className="max-w-[1100px] mx-auto px-6 py-6">
                <Header onOpenSettings={() => setSettingsOpen(true)} />
                <TabNav />
                <AppInner>{children}</AppInner>
              </div>
            </main>
            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
          </ToastProvider>
        </ThetanutsProvider>
      </LoanProvider>
    </Providers>
  );
}
