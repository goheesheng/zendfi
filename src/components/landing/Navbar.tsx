import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <span className="text-white/80 text-lg font-semibold tracking-wide">
        Zend Finance
      </span>
      <Link
        href="/app"
        className="px-5 py-2 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#22d3ee' }}
      >
        Launch App
      </Link>
    </nav>
  );
}
