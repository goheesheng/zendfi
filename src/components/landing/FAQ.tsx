'use client';

import { Disclosure, Transition } from '@headlessui/react';
import { ScrollReveal } from './ScrollReveal';

const faqs = [
  {
    question: 'How is liquidation-free borrowing possible?',
    answer:
      'When you deposit collateral, lenders simultaneously sell you a put option at your loan\'s strike price. This gives you the right — but not obligation — to sell your collateral at that price. If the market drops, you can simply walk away, keeping your loan while the lender keeps your collateral. No forced liquidations, ever.',
  },
  {
    question: 'What happens if my collateral value drops?',
    answer:
      'Nothing happens to your position. Unlike traditional lending where a price drop triggers liquidation, Zend\'s options-based structure means you\'re protected. You can choose to repay and reclaim your collateral, or walk away if it\'s worth less than your loan.',
  },
  {
    question: 'What collateral types are supported?',
    answer:
      'Zend currently supports ETH and BTC as collateral. We\'re working on expanding to additional assets based on liquidity and demand.',
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
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display text-gray-900 mb-4">Frequently asked questions</h2>
            <p className="text-gray-500">Everything you need to know about liquidation-free borrowing</p>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={faq.question} delay={i * 60}>
              <Disclosure>
                {({ open }) => (
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
                    <Disclosure.Button className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-gray-900 font-medium">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                          open ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="transform scale-y-95 opacity-0"
                      enterTo="transform scale-y-100 opacity-100"
                      leave="transition duration-150 ease-in"
                      leaveFrom="transform scale-y-100 opacity-100"
                      leaveTo="transform scale-y-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-6 pb-5">
                        <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                      </Disclosure.Panel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
