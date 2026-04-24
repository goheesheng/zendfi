import Link from 'next/link';
import { ScrollReveal } from './ScrollReveal';

export function CTA() {
  return (
    <section className="bg-[#08090f] py-24 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <ScrollReveal>
          <h2 className="text-4xl font-bold text-white mb-4">Ready for peace of mind?</h2>
          <p className="text-lg text-white/30 mb-10">
            Join the growing community of borrowers who never worry about liquidations.
          </p>
          <Link
            href="/app"
            className="inline-block px-8 py-4 rounded-xl font-semibold text-white text-base bg-gradient-to-br from-indigo-500 to-indigo-700 transition-all duration-300 hover:from-indigo-400 hover:to-indigo-600 hover:scale-105 hover:shadow-[0_0_32px_rgba(99,102,241,0.4)] shadow-[0_4px_16px_rgba(99,102,241,0.25)]"
          >
            Start Borrowing →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
