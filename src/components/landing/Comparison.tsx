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
    <section className="bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Zend vs Traditional DeFi Lending
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Feature</th>
                <th className="px-6 py-4 text-center font-semibold text-blue-600">Zend</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-400">Others</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                >
                  <td className="px-6 py-4 text-gray-700 font-medium">{row.feature}</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">
                    {row.zend}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">{row.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
