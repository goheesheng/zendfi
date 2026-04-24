'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const backers = [
  { name: 'Polychain Capital', logo: '/investors/polychain.svg', width: 140, height: 40 },
  { name: 'Deribit', logo: '/investors/deribit.svg', width: 100, height: 40 },
  { name: 'QCP', logo: '/investors/qcp.svg', width: 40, height: 40 },
  { name: 'Jump', logo: '/investors/jump.svg', width: 80, height: 40 },
];

export function Hero() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[#06070c]">
      {/* Aurora background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary aurora — deep indigo/violet */}
        <div
          className="absolute animate-aurora"
          style={{
            width: '140%', height: '60%',
            top: '5%', left: '-20%',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.05) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Secondary aurora — warm accent */}
        <div
          className="absolute animate-aurora-2"
          style={{
            width: '120%', height: '50%',
            bottom: '0%', right: '-10%',
            background: 'radial-gradient(ellipse at 60% 50%, rgba(129,140,248,0.1) 0%, rgba(99,102,241,0.03) 40%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        {/* Subtle center glow */}
        <div
          className="absolute"
          style={{
            width: '600px', height: '600px',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Grain texture overlay */}
      <div className="absolute inset-0 grain pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Animated wave logo */}
        <div className={`mb-12 transition-all duration-1500 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <svg
            width="56" height="40" viewBox="0 0 56 40" fill="none"
            className="mx-auto"
          >
            <path
              d="M4 10 C10 4, 18 16, 24 10 C30 4, 38 16, 44 10 C50 4, 52 10, 54 8"
              stroke="url(#wave-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none"
              style={{ strokeDasharray: 80, strokeDashoffset: animate ? 0 : 80, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s' }}
            />
            <path
              d="M4 20 C10 14, 18 26, 24 20 C30 14, 38 26, 44 20 C50 14, 52 20, 54 18"
              stroke="url(#wave-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none"
              style={{ strokeDasharray: 80, strokeDashoffset: animate ? 0 : 80, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) 0.5s' }}
            />
            <path
              d="M4 30 C10 24, 18 36, 24 30 C30 24, 38 36, 44 30 C50 24, 52 30, 54 28"
              stroke="url(#wave-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none"
              style={{ strokeDasharray: 80, strokeDashoffset: animate ? 0 : 80, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) 0.7s' }}
            />
            <defs>
              <linearGradient id="wave-grad" x1="0" y1="0" x2="54" y2="0">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl sm:text-6xl md:text-[5.5rem] font-display font-normal text-white leading-[1.05] tracking-[-0.02em] mb-8 transition-all duration-1000 ${
            animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '0.4s' }}
        >
          Borrow Without<br />
          <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Liquidation Risk
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg md:text-xl text-white/40 mb-12 max-w-lg mx-auto font-light leading-relaxed transition-all duration-1000 ${
            animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '0.6s' }}
        >
          Fixed terms. Predictable repayment. Peace of mind.
        </p>

        {/* CTA */}
        <div
          className={`transition-all duration-1000 ${
            animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '0.8s' }}
        >
          <Link
            href="/app"
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm tracking-wide text-white overflow-hidden transition-all duration-300 hover:shadow-glow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            {/* Shimmer effect on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s ease-in-out infinite' }} />
            <span className="relative">Launch App</span>
            <svg className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Backed By — bottom of hero */}
      <div
        className={`absolute bottom-12 left-0 right-0 transition-all duration-1000 ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '1.2s' }}
      >
        <p className="text-[10px] tracking-[0.2em] text-white/20 uppercase mb-5 text-center">Backed by</p>
        <div className="overflow-hidden max-w-xl mx-auto">
          <div className="flex animate-logo-scroll items-center">
            {[...backers, ...backers].map((backer, i) => (
              <div key={i} className="mx-10 shrink-0 opacity-30 hover:opacity-60 transition-opacity duration-500">
                <Image
                  src={backer.logo}
                  alt={backer.name}
                  width={backer.width}
                  height={backer.height}
                  className="h-6 w-auto brightness-0 invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-[#06070c] to-transparent pointer-events-none" />
    </section>
  );
}
