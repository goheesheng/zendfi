'use client';

import { useState, useEffect } from 'react';
import { useLoanContext } from '@/context/LoanContext';
import { useThetanuts } from '@/context/ThetanutsContext';

type StepStatus = 'pending' | 'active' | 'completed';

interface Props {
  onCancel: () => void;
  onDismiss: () => void;
}

export function LoanProgress({ onCancel, onDismiss }: Props) {
  const { state } = useLoanContext();
  const { service } = useThetanuts();
  const [steps, setSteps] = useState<StepStatus[]>(['active', 'pending', 'pending', 'pending']);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const activeLoan = state.activeLoanRequestId
    ? state.loans.get(state.activeLoanRequestId)
    : null;

  // Update steps based on loan status
  useEffect(() => {
    if (!activeLoan) return;

    switch (activeLoan.status) {
      case 'requested':
        setSteps(['completed', 'active', 'pending', 'pending']);
        break;
      case 'competing':
        setSteps(['completed', 'completed', 'active', 'pending']);
        break;
      case 'settled':
      case 'active':
        setSteps(['completed', 'completed', 'completed', 'completed']);
        break;
      default:
        setSteps(['active', 'pending', 'pending', 'pending']);
    }
  }, [activeLoan?.status]);

  // Countdown timer for offer window
  useEffect(() => {
    if (!activeLoan || !activeLoan.offerEndTimestamp) return;

    const interval = setInterval(() => {
      const remaining = activeLoan.offerEndTimestamp - Math.floor(Date.now() / 1000);
      setTimeRemaining(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeLoan?.offerEndTimestamp]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stepData = [
    { title: 'Preparing loan request', desc: 'Your loan request has been submitted to market makers' },
    { title: 'The competition has started', desc: 'Lenders are competing to offer you the best rate' },
    { title: timeRemaining !== null ? `Offers received (${formatTime(timeRemaining)} remaining)` : 'Waiting for offers', desc: 'Choose an offer below or wait for better rates' },
    { title: 'Transaction completed', desc: 'The funds have been sent to your wallet' },
  ];

  const isCompleted = steps[3] === 'completed';

  return (
    <div className="space-y-6">
      {/* Progress Icon */}
      <div className="flex justify-center py-8">
        {isCompleted ? (
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-zend-accent/20 flex items-center justify-center animate-pulse">
            <svg className="w-12 h-12 text-zend-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {stepData.map((step, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all duration-300 ${
              steps[i] === 'completed' ? 'bg-emerald-500 text-white' :
              steps[i] === 'active' ? 'bg-zend-accent text-white animate-pulse' :
              'bg-gray-200 dark:bg-zend-border text-gray-400'
            }`}>
              {steps[i] === 'completed' ? '✓' : i + 1}
            </div>
            <div>
              <div className={`font-semibold text-sm ${steps[i] === 'pending' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Offers list (step 3) */}
      {activeLoan && activeLoan.offers.length > 0 && steps[2] === 'active' && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Offers received:</h4>
          {activeLoan.offers.map((offer, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zend-input rounded-xl border border-gray-200 dark:border-zend-border">
              <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                  {offer.offeror.slice(0, 6)}...{offer.offeror.slice(-4)}
                </div>
                <div className="text-xs text-emerald-500">
                  {offer.calculatedApr ? `${offer.calculatedApr.toFixed(1)}% APR` : 'Encrypted'}
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!offer.decryptedAmount || !offer.nonce) return;
                  try {
                    await service.acceptOffer(BigInt(state.activeLoanRequestId!), offer.decryptedAmount, offer.nonce, offer.offeror);
                  } catch (e: any) {
                    alert(e.message);
                  }
                }}
                disabled={!offer.decryptedAmount}
                className="px-4 py-1.5 rounded-lg bg-zend-accent text-white text-xs font-semibold hover:bg-zend-accent-hover disabled:opacity-40 transition-colors"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-4">
        {isCompleted ? (
          <button onClick={onDismiss} className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-indigo-400 to-zend-accent transition-all">
            View Loan Details
          </button>
        ) : (
          <button onClick={onCancel} className="w-full py-3 rounded-xl font-semibold border border-gray-200 dark:border-zend-border text-gray-500 dark:text-gray-400 hover:border-red-500 hover:text-red-500 transition-colors">
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
}
