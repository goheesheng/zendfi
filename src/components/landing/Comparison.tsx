import { ScrollReveal } from './ScrollReveal';

const rows = [
  { feature: 'Liquidation Risk', zend: 'None', others: 'High', good: true },
  { feature: 'Repayment Terms', zend: 'Fixed', others: 'Variable', good: true },
  { feature: 'Rate Certainty', zend: 'Locked in', others: 'Fluctuates', good: true },
  { feature: 'Margin Calls', zend: 'Never', others: 'Frequent', good: true },
  { feature: 'Price Protection', zend: 'Built-in options', others: 'None', good: true },
  { feature: 'Custody', zend: 'Non-custodial', others: 'Non-custodial', good: false },
];

export function Comparison() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display text-gray-900 mb-4">
              Zend vs Traditional DeFi Lending
            </h2>
            <p className="text-gray-500">
              See why borrowers are switching to liquidation-free loans
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-400">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-zend-blue">Zend</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-400">Others</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.feature} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 text-gray-600 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5">
                        {row.good && (
                          <svg className="w-4 h-4 text-zend-blue" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        )}
                        <span className="text-zend-blue font-semibold">{row.zend}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
