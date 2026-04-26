import Link from 'next/link';
import { ScrollReveal } from './ScrollReveal';

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
      <div className="max-w-2xl mx-auto relative z-10">
        <ScrollReveal>
          <h2 className="text-4xl font-display text-white mb-4">Ready for peace of mind?</h2>
          <p className="text-lg text-white/80 mb-10">
            Join the growing community of borrowers who never worry about liquidations.
          </p>
          <Link
            href="/app"
            className="inline-block px-8 py-4 rounded-xl font-semibold text-gray-900 text-base bg-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Start Borrowing →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
