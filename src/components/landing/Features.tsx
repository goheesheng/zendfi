import { ScrollReveal } from './ScrollReveal';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'No Liquidations',
    description: 'Your position is never force-liquidated. Borrow with confidence, no matter how volatile the market gets.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Fixed Terms',
    description: 'Know exactly when your loan expires and what you owe from day one. No surprises, no variable rate shocks.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Competitive Rates',
    description: 'Market makers compete in a sealed-bid auction to give you the best borrowing rate available.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
      </svg>
    ),
    title: 'Options Protection',
    description: 'Built on physically-settled call options via Thetanuts V4 RFQ — your collateral is always fully accounted for.',
  },
];

export function Features() {
  return (
    <section className="bg-[#06070c] py-28 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display text-white mb-5 tracking-tight">
              Borrowing, reimagined
            </h2>
            <p className="text-base text-white/30 max-w-lg mx-auto leading-relaxed">
              Traditional DeFi lending means constant liquidation anxiety. Zend changes everything.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 80}>
              <div className="group glass-card rounded-2xl p-8 transition-all duration-500 hover:border-indigo-500/20 hover:shadow-glow">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:bg-indigo-500/15 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
