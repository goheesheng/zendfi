'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
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
  const { setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  return (
    <Providers>
      <LoanProvider>
        <ThetanutsProvider>
          <ToastProvider>
            <main className="min-h-screen bg-zend-bg bg-surface-mesh text-zend-ink">
              <div className="max-w-[520px] mx-auto px-5 py-8">
                <Header onOpenSettings={() => setSettingsOpen(true)} />
                <TabNav />
                <div className="animate-slide-up">
                  <AppInner>{children}</AppInner>
                </div>
              </div>
            </main>
            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
          </ToastProvider>
        </ThetanutsProvider>
      </LoanProvider>
    </Providers>
  );
}
