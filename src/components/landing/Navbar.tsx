'use client';

import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 py-4 bg-white/10 backdrop-blur-md">
      <span className="text-white font-semibold text-sm tracking-wide">
        Zend Finance
      </span>

      <Link
        href="/app"
        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-zend-blue text-white hover:bg-zend-blue-dark transition-all duration-200"
      >
        Launch App
      </Link>
    </nav>
  );
}
