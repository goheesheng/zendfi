import { ScrollReveal } from './ScrollReveal';

const steps = [
  {
    number: '01',
    title: 'Deposit Collateral',
    description: 'Deposit ETH or BTC as collateral. Your assets remain yours — we never take custody.',
  },
  {
    number: '02',
    title: 'Request a Quote',
    description: 'Specify your loan amount and term. Lenders compete to offer you the best rates.',
  },
  {
    number: '03',
    title: 'Accept & Borrow',
    description: 'Choose the best offer and receive your loan instantly. Fixed terms, no surprises.',
  },
  {
    number: '04',
    title: 'Repay & Reclaim',
    description: 'Repay your loan at maturity to reclaim your collateral. Or walk away — your choice.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-gray-50 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Four simple steps to liquidation-free borrowing
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-6 mb-12">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 100}>
              <div className="flex items-start gap-5 bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-zend-blue/10 flex items-center justify-center text-zend-blue font-bold text-sm flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={500}>
          <p className="text-center text-sm text-gray-400">
            Built on <span className="text-zend-blue font-medium">Thetanuts V4 RFQ</span> — enterprise-grade options infrastructure
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
