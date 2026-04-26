import Link from 'next/link';
import { ScrollReveal } from './ScrollReveal';

const badges = [
  { icon: '🔒', label: 'Audited' },
  { icon: '🏛️', label: 'Non-custodial' },
  { icon: '⚡', label: 'Built on Thetanuts V4' },
  { icon: '🌐', label: '24/7 Access' },
];

export function CTA() {
  return (
    <section
      className="py-24 px-6 text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #c4b5fd 0%, #93c5fd 20%, #e0c3fc 40%, #fde68a 60%, #bfdbfe 80%, #c4b5fd 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 15s ease infinite',
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <ScrollReveal>
          <h2 className="text-4xl font-display text-white mb-4">Ready for peace of mind?</h2>
          <p className="text-lg text-white/90 mb-10">
            Join the growing community of borrowers who never worry about liquidations.
          </p>
          <Link
            href="/app"
            className="inline-block px-8 py-4 rounded-xl font-semibold text-gray-900 text-base bg-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Start Borrowing →
          </Link>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            {badges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-sm text-white/70">
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
