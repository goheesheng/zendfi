'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <span className="font-display text-lg font-semibold text-gray-900 tracking-tight">Zend<span className="text-zend-blue">Fi</span></span>
      <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-zend-blue/40 hover:text-gray-600 transition-all"
          title="Settings"
          aria-label="Open settings"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>
    </div>
  );
}
