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
    <nav className="flex mb-6 bg-gray-100 dark:bg-zend-input p-[5px] rounded-[36px] border border-gray-200 dark:border-zend-border gap-1">
      {tabs.map((tab) => {
        const isActive = tab.href === '/app' ? pathname === '/app' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 text-center py-3 px-2 rounded-[30px] font-semibold text-[13px] transition-all ${
              isActive
                ? 'bg-gradient-to-br from-indigo-400 to-zend-accent text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)]'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
