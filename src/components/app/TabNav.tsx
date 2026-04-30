'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'Borrow', href: '/app' },
  { label: 'Loans', href: '/app/loans' },
  { label: 'History', href: '/app/history' },
  { label: 'Lend', href: '/app/lend' },
] as const;

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6 mb-6 border-b border-gray-200 dark:border-zend-border">
      {tabs.map((tab) => {
        const isActive = tab.href === '/app' ? pathname === '/app' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-3 pt-1 px-1 text-sm font-medium transition-colors border-b-2 -mb-px min-h-[44px] flex items-center ${
              isActive
                ? 'text-gray-900 dark:text-white border-zend-blue'
                : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
