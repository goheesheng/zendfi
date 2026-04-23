import Link from 'next/link';

export function Hero() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center text-center px-6"
      style={{
        background:
          'linear-gradient(135deg, #c4b5fd 0%, #93c5fd 25%, #e0c3fc 50%, #fde68a 75%, #93c5fd 100%)',
      }}
    >
      {/* Wave logo SVG */}
      <div className="mb-8">
        <svg
          width="72"
          height="48"
          viewBox="0 0 72 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Zend wave logo"
        >
          <path
            d="M4 12 C12 4, 20 20, 28 12 C36 4, 44 20, 52 12 C60 4, 68 20, 72 12"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M4 24 C12 16, 20 32, 28 24 C36 16, 44 32, 52 24 C60 16, 68 32, 72 24"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M4 36 C12 28, 20 44, 28 36 C36 28, 44 44, 52 36 C60 28, 68 44, 72 36"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-light text-white leading-tight mb-6">
        Borrow Without
        <br />
        Liquidation Risk
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-white/70 mb-10 max-w-md">
        Fixed terms. Predictable repayment. Peace of mind.
      </p>

      {/* CTA */}
      <Link
        href="/app"
        className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-lg text-base hover:shadow-xl transition-shadow"
      >
        Launch App →
      </Link>

      {/* Backed by */}
      <div className="mt-16">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-4">Backed by</p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {['Polychain Capital', 'Deribit', 'QCP', 'Jump'].map((name) => (
            <span key={name} className="text-white/40 text-sm font-medium">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
