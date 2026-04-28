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
    <nav className="flex mb-6 bg-white p-[5px] rounded-[36px] border border-gray-200 gap-1 shadow-sm">
      {tabs.map((tab) => {
        const isActive = tab.href === '/app' ? pathname === '/app' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 text-center py-3 px-2 rounded-[30px] font-semibold text-[13px] transition-all ${
              isActive
                ? 'bg-zend-blue text-white shadow-[0_4px_12px_rgba(6,214,160,0.3)]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
