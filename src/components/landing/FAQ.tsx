'use client';

import { Disclosure, Transition } from '@headlessui/react';
import { ScrollReveal } from './ScrollReveal';

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
    <section className="bg-[#08090f] py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Frequently asked questions</h2>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={faq.question} delay={i * 60}>
              <Disclosure>
                {({ open }) => (
                  <div className="glass-card rounded-xl overflow-hidden border-white/5">
                    <Disclosure.Button className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors duration-200">
                      <span className="text-white font-medium">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-white/30 transition-transform duration-300 flex-shrink-0 ml-4 ${
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
                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="transform scale-y-95 opacity-0"
                      enterTo="transform scale-y-100 opacity-100"
                      leave="transition duration-150 ease-in"
                      leaveFrom="transform scale-y-100 opacity-100"
                      leaveTo="transform scale-y-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-6 pb-5">
                        <p className="text-white/30 leading-relaxed">{faq.answer}</p>
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
