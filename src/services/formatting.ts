import { STRIKE_DECIMALS, HOURS_PER_YEAR } from './constants';

export function formatStrike(strike: bigint): string {
  return (Number(strike) / 10 ** STRIKE_DECIMALS).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export function formatUsdc(amount: bigint): string {
  return (Number(amount) / 1e6).toFixed(2);
}

export function calculateEffectiveApr(
  receiveAmount: bigint,
  repayAmount: bigint,
  hoursToExpiry: number
): number {
  if (receiveAmount === 0n || hoursToExpiry <= 0) return 0;
  const ratio = Number(repayAmount) / Number(receiveAmount);
  return ((ratio - 1) * HOURS_PER_YEAR) / hoursToExpiry * 100;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
