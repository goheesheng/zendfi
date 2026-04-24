import { ScrollReveal } from './ScrollReveal';

const rows = [
  { feature: 'Liquidation Risk', zend: 'None', others: 'High' },
  { feature: 'Repayment Terms', zend: 'Fixed', others: 'Variable' },
  { feature: 'Rate Certainty', zend: 'Locked in', others: 'Fluctuates' },
  { feature: 'Margin Calls', zend: 'Never', others: 'Frequent' },
  { feature: 'Price Protection', zend: 'Built-in options', others: 'None' },
  { feature: 'Custody', zend: 'Non-custodial', others: 'Non-custodial' },
];

export function Comparison() {
  return (
    <section className="bg-[#06070c] py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Zend vs Traditional DeFi Lending
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="glass-card overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-left font-semibold text-white/30">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-indigo-400">Zend</th>
                  <th className="px-6 py-4 text-center font-semibold text-white/30">Others</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                  >
                    <td className="px-6 py-4 text-white/30 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-indigo-400 font-semibold">
                      {row.zend}
                    </td>
                    <td className="px-6 py-4 text-center text-white/30">{row.others}</td>
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
