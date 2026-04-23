const steps = [
  {
    number: '01',
    title: 'Deposit Collateral',
    description:
      'Deposit ETH or cbBTC as collateral. Your assets are locked in a non-custodial smart contract.',
  },
  {
    number: '02',
    title: 'Market Makers Compete',
    description:
      'Market makers submit encrypted offers in a 30-second sealed-bid auction to provide you the best rate.',
  },
  {
    number: '03',
    title: 'Receive USDC',
    description:
      'Accept the best offer and instantly receive USDC. Your loan terms are fixed from this moment forward.',
  },
  {
    number: '04',
    title: 'Repay or Walk Away',
    description:
      'At expiry, repay the fixed USDC amount to reclaim your collateral — or keep the USDC and let the lender settle.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-gray-50 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Four simple steps from collateral to cash — with no liquidation risk along the way.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-start">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm mb-4 flex-shrink-0">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400">
          Built on Thetanuts V4 RFQ — enterprise-grade options infrastructure
        </p>
      </div>
    </section>
  );
}
