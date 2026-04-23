import Link from 'next/link';

export function CTA() {
  return (
    <section className="bg-gray-50 py-24 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready for peace of mind?</h2>
        <p className="text-lg text-gray-500 mb-10">
          Join the growing community of borrowers who never worry about liquidations.
        </p>
        <Link
          href="/app"
          className="inline-block px-8 py-4 rounded-xl font-semibold text-white text-base transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#22d3ee' }}
        >
          Start Borrowing →
        </Link>
      </div>
    </section>
  );
}
