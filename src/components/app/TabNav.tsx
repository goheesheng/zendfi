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
    <nav className="flex mb-8 bg-zend-surface p-1 rounded-2xl border border-zend-border shadow-card gap-1">
      {tabs.map((tab) => {
        const isActive = tab.href === '/app' ? pathname === '/app' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 text-center py-2.5 px-3 rounded-xl font-heading font-semibold text-[13px] tracking-wide transition-all duration-200 ${
              isActive
                ? 'bg-zend-coral text-white shadow-coral-glow'
                : 'text-zend-ink-secondary hover:text-zend-ink hover:bg-zend-surface-alt'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
