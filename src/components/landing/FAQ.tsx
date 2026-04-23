'use client';

import { Disclosure } from '@headlessui/react';

const faqs = [
  {
    question: 'How is liquidation-free borrowing possible?',
    answer:
      'Zend uses physically-settled call options instead of traditional collateral debt positions. Your collateral secures a fixed-term option, so there is no ongoing collateral ratio to monitor and no liquidation trigger — the loan simply expires at a predetermined date.',
  },
  {
    question: 'What happens if my collateral value drops?',
    answer:
      'Nothing changes for your loan. The terms are fixed at origination. If the collateral value drops below the strike price at expiry, you can choose to walk away — keep the USDC you borrowed and let the lender keep the collateral. You are never forced to do anything.',
  },
  {
    question: 'What collateral types are supported?',
    answer:
      'Currently Zend supports ETH (via WETH) and cbBTC on Base mainnet. Additional collateral types may be added as the protocol expands.',
  },
  {
    question: 'How are loan terms determined?',
    answer:
      'When you submit a loan request, market makers compete in a 30-second sealed-bid auction to offer you the best rate. You then accept the best offer — locking in your strike price, loan amount, and expiry date.',
  },
  {
    question: 'Is Zend non-custodial?',
    answer:
      'Yes. Your collateral is held in audited smart contracts on Base. Neither Zend nor any market maker can access your collateral directly. You retain full control through your wallet at all times.',
  },
  {
    question: 'What blockchain is Zend built on?',
    answer:
      'Zend is deployed on Base (chain ID 8453), an Ethereum L2 built by Coinbase. Base offers low transaction fees, fast finality, and deep EVM compatibility.',
  },
];

export function FAQ() {
  return (
    <section className="bg-gray-50 py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <Disclosure key={faq.question}>
              {({ open }) => (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <Disclosure.Button className="w-full flex items-center justify-between px-6 py-5 text-left">
                    <span className="text-gray-900 font-medium">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                        open ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-5">
                    <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}
