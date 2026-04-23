'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Providers } from '@/app/providers';
import { LoanProvider } from '@/context/LoanContext';
import { ThetanutsProvider } from '@/context/ThetanutsContext';
import { Header } from '@/components/app/Header';
import { TabNav } from '@/components/app/TabNav';
import { SettingsModal } from '@/components/app/modals/SettingsModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  return (
    <Providers>
      <LoanProvider>
        <ThetanutsProvider>
          <main className="min-h-screen bg-white dark:bg-zend-bg text-gray-900 dark:text-gray-50">
            <div className="max-w-app mx-auto px-4 py-6">
              <Header onOpenSettings={() => setSettingsOpen(true)} />
              <TabNav />
              {children}
            </div>
          </main>
          <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </ThetanutsProvider>
      </LoanProvider>
    </Providers>
  );
}
