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
      {/* Floating Cloud Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cloud 1 — large, slow drift */}
        <div
          className="absolute rounded-full opacity-30 blur-3xl"
          style={{
            width: '600px', height: '300px',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)',
            top: '10%', left: '-5%',
            animation: 'cloud-drift-1 25s ease-in-out infinite',
          }}
        />
        {/* Cloud 2 — medium, opposite drift */}
        <div
          className="absolute rounded-full opacity-25 blur-3xl"
          style={{
            width: '500px', height: '250px',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)',
            top: '30%', right: '-10%',
            animation: 'cloud-drift-2 30s ease-in-out infinite',
          }}
        />
        {/* Cloud 3 — small accent cloud */}
        <div
          className="absolute rounded-full opacity-20 blur-2xl"
          style={{
            width: '400px', height: '200px',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)',
            bottom: '15%', left: '10%',
            animation: 'cloud-drift-3 20s ease-in-out infinite',
          }}
        />
        {/* Cloud 4 — warm tint cloud */}
        <div
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{
            width: '450px', height: '220px',
            background: 'radial-gradient(ellipse, rgba(253,230,138,0.4) 0%, transparent 70%)',
            top: '50%', right: '5%',
            animation: 'cloud-drift-1 35s ease-in-out infinite reverse',
          }}
        />
        {/* Cloud 5 — purple tint */}
        <div
          className="absolute rounded-full opacity-15 blur-3xl"
          style={{
            width: '350px', height: '180px',
            background: 'radial-gradient(ellipse, rgba(196,181,253,0.5) 0%, transparent 70%)',
            top: '5%', right: '20%',
            animation: 'cloud-drift-3 28s ease-in-out infinite',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Animated wave logo */}
        <div className={`mb-10 transition-opacity duration-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>
          <svg
            width="72" height="48" viewBox="0 0 72 48" fill="none"
            className="mx-auto"
          >
            <path
              d="M4 12 C12 4, 20 20, 28 12 C36 4, 44 20, 52 12 C60 4, 68 20, 72 12"
              stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"
              style={{ strokeDasharray: 120, strokeDashoffset: animate ? 0 : 120, transition: 'stroke-dashoffset 1s ease 0.2s' }}
            />
            <path
              d="M4 24 C12 16, 20 32, 28 24 C36 16, 44 32, 52 24 C60 16, 68 32, 72 24"
              stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"
              style={{ strokeDasharray: 120, strokeDashoffset: animate ? 0 : 120, transition: 'stroke-dashoffset 1s ease 0.4s' }}
            />
            <path
              d="M4 36 C12 28, 20 44, 28 36 C36 28, 44 44, 52 36 C60 28, 68 44, 72 36"
              stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"
              style={{ strokeDasharray: 120, strokeDashoffset: animate ? 0 : 120, transition: 'stroke-dashoffset 1s ease 0.6s' }}
            />
          </svg>
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl sm:text-6xl md:text-7xl font-display font-normal text-white leading-tight mb-6 transition-all duration-1000 ${
            animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.3s' }}
        >
          Borrow Without<br />
          Liquidation Risk
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg text-white/90 mb-10 max-w-md mx-auto transition-all duration-1000 ${
            animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.5s' }}
        >
          Fixed terms. Predictable repayment. Peace of mind.
        </p>

        {/* CTA */}
        <div
          className={`transition-all duration-1000 ${
            animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.7s' }}
        >
          <Link
            href="/app"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold text-lg shadow-lg transition-all duration-300 hover:bg-white/90 hover:shadow-xl hover:-translate-y-0.5 hover:scale-105"
          >
            Launch App
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Backed By */}
      <div
        className={`absolute bottom-12 left-0 right-0 transition-all duration-1000 ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '1s' }}
      >
        <p className="text-xs tracking-widest text-white/50 uppercase mb-6 text-center">Backed by</p>
        <div className="overflow-hidden max-w-2xl mx-auto">
          <div className="flex animate-logo-scroll items-center">
            {[...backers, ...backers].map((backer, i) => (
              <div key={i} className="mx-10 shrink-0 opacity-50 hover:opacity-80 transition-opacity duration-300">
                <Image
                  src={backer.logo}
                  alt={backer.name}
                  width={backer.width}
                  height={backer.height}
                  className="h-8 w-auto brightness-0 invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
