import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 py-5">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xl border-b border-white/[0.04]" />

      <span className="relative text-white/50 font-medium text-sm tracking-wide">
        Zend Finance
      </span>

      <Link
        href="/app"
        className="relative px-5 py-2.5 rounded-xl text-white/70 text-xs font-semibold tracking-wide border border-white/10 hover:border-indigo-400/40 hover:text-white hover:shadow-glow transition-all duration-300"
      >
        Launch App
      </Link>
    </nav>
  );
}
