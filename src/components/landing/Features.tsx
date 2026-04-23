const features = [
  {
    icon: '🛡️',
    title: 'No Liquidations',
    description:
      'Your position is never force-liquidated. Borrow with confidence, no matter how volatile the market gets.',
  },
  {
    icon: '⏰',
    title: 'Fixed Terms',
    description:
      'Know exactly when your loan expires and what you owe from day one. No surprises, no variable rate shocks.',
  },
  {
    icon: '📈',
    title: 'Competitive Rates',
    description:
      'Market makers compete in a sealed-bid auction to give you the best borrowing rate available.',
  },
  {
    icon: '📦',
    title: 'Options Protection',
    description:
      'Built on physically-settled call options via Thetanuts V4 RFQ — your collateral is always fully accounted for.',
  },
];

export function Features() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Borrowing, reimagined</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Traditional DeFi lending means constant liquidation anxiety. Zend changes everything.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-gray-50 rounded-2xl p-8">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
