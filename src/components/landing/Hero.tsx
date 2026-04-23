'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const backers = ['Polychain Capital', 'Deribit', 'QCP', 'Jump'];

export function Hero() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #c4b5fd 0%, #93c5fd 20%, #e0c3fc 40%, #fde68a 60%, #bfdbfe 80%, #c4b5fd 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 15s ease infinite',
      }}
    >
      {/* Animated SVG Wave Logo */}
      <div className={`mb-8 transition-opacity duration-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>
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
            style={{
              strokeDasharray: 120,
              strokeDashoffset: animate ? 0 : 120,
              transition: 'stroke-dashoffset 1s ease 0.2s',
            }}
          />
          <path
            d="M4 24 C12 16, 20 32, 28 24 C36 16, 44 32, 52 24 C60 16, 68 32, 72 24"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: 120,
              strokeDashoffset: animate ? 0 : 120,
              transition: 'stroke-dashoffset 1s ease 0.4s',
            }}
          />
          <path
            d="M4 36 C12 28, 20 44, 28 36 C36 28, 44 44, 52 36 C60 28, 68 44, 72 36"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: 120,
              strokeDashoffset: animate ? 0 : 120,
              transition: 'stroke-dashoffset 1s ease 0.6s',
            }}
          />
        </svg>
      </div>

      {/* Headline with staggered fade-in */}
      <h1
        className={`text-5xl md:text-7xl font-light text-white mb-6 leading-tight transition-all duration-1000 delay-300 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        Borrow Without
        <br />
        Liquidation Risk
      </h1>

      <p
        className={`text-lg text-white/70 mb-10 max-w-md transition-all duration-1000 delay-500 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        Fixed terms. Predictable repayment. Peace of mind.
      </p>

      <Link
        href="/app"
        className={`group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold text-lg shadow-lg transition-all duration-300 hover:bg-white/90 hover:shadow-xl hover:-translate-y-0.5 ${
          animate
            ? 'opacity-100 translate-y-0 transition-all duration-1000 delay-700'
            : 'opacity-0 translate-y-8 transition-all duration-1000 delay-700'
        }`}
      >
        Launch App
        <svg
          className="w-5 h-5 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>

      {/* Backed By Marquee */}
      <div
        className={`mt-16 w-full transition-all duration-1000 delay-1000 ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-xs tracking-widest text-white/50 uppercase mb-4">Backed by</p>
        <div className="overflow-hidden max-w-lg mx-auto">
          <div className="flex animate-logo-scroll">
            {[...backers, ...backers].map((name, i) => (
              <span key={i} className="text-white/40 text-sm font-medium mx-8 whitespace-nowrap">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
