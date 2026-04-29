interface Props {
  symbol: string;
  size?: number;
  className?: string;
}

export function TokenIcon({ symbol, size = 20, className = '' }: Props) {
  const s = symbol.toUpperCase();

  if (s === 'ETH' || s === 'WETH') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
        <circle cx="16" cy="16" r="16" fill="#627EEA" />
        <path d="M16.498 4v8.87l7.497 3.35L16.498 4z" fill="#fff" fillOpacity="0.6" />
        <path d="M16.498 4L9 16.22l7.498-3.35V4z" fill="#fff" />
        <path d="M16.498 21.968v6.027L24 17.616l-7.502 4.352z" fill="#fff" fillOpacity="0.6" />
        <path d="M16.498 27.995v-6.028L9 17.616l7.498 10.379z" fill="#fff" />
        <path d="M16.498 20.573l7.497-4.353-7.497-3.348v7.701z" fill="#fff" fillOpacity="0.2" />
        <path d="M9 16.22l7.498 4.353v-7.701L9 16.22z" fill="#fff" fillOpacity="0.6" />
      </svg>
    );
  }

  if (s === 'BTC' || s === 'CBBTC') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
        <circle cx="16" cy="16" r="16" fill="#F7931A" />
        <path d="M22.5 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.7-1.7-.4-.7 2.7c-.3-.1-.7-.2-1-.2v0l-2.3-.6-.4 1.8s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .1 0l-.1 0-1.1 4.5c-.1.2-.3.5-.7.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.1-4.1 1-5.2.7l.9-3.7c1.2.3 4.9.9 4.3 3zm.5-5.3c-.5 1.9-3.4.9-4.4.7l.8-3.4c1 .2 4.1.7 3.6 2.7z" fill="#fff" />
      </svg>
    );
  }

  if (s === 'USDC') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
        <circle cx="16" cy="16" r="16" fill="#2775CA" />
        <path d="M20.6 18.5c0-2.1-1.3-2.8-3.8-3.1-1.8-.3-2.1-.7-2.1-1.5s.7-1.3 1.8-1.3c1 0 1.6.4 1.9 1.2.1.2.2.3.4.3h1c.2 0 .4-.2.3-.4-.3-1.2-1.2-2.2-2.6-2.4v-1.4c0-.2-.2-.4-.5-.4h-.8c-.2 0-.4.2-.5.4v1.3c-1.7.3-2.8 1.4-2.8 2.8 0 2 1.2 2.7 3.7 3.1 1.6.3 2.2.7 2.2 1.6 0 .9-.8 1.5-1.9 1.5-1.5 0-2-.6-2.2-1.5-.1-.2-.2-.3-.4-.3h-1c-.2 0-.4.2-.3.4.3 1.5 1.2 2.3 3 2.7v1.4c0 .2.2.4.5.4h.8c.2 0 .4-.2.5-.4v-1.4c1.7-.3 2.8-1.4 2.8-2.9z" fill="#fff" />
        <path d="M13.1 24.6c-4.7-1.7-7.2-7-5.5-11.8 1-2.7 3.2-4.7 5.9-5.5.2-.1.4-.3.4-.5v-.9c0-.2-.2-.4-.4-.4h-.1c-5.5 1.5-8.8 7.3-7.2 12.8 1 3.3 3.6 5.9 7 6.9.2.1.4-.1.4-.3v-.9c0-.2-.1-.3-.3-.4h-.2zm5.9-18.8c-.2-.1-.4.1-.4.3v.9c0 .2.2.4.4.5 4.7 1.7 7.2 7 5.5 11.8-1 2.7-3.2 4.7-5.9 5.5-.2.1-.4.3-.4.5v.9c0 .2.2.4.4.4h.1c5.5-1.5 8.8-7.3 7.2-12.8-1-3.3-3.6-5.9-7-6.9 0 0 .1 0 .1-.1z" fill="#fff" />
      </svg>
    );
  }

  // Fallback
  return (
    <div
      className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {s.slice(0, 2)}
    </div>
  );
}
