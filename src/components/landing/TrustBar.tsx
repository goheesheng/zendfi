import { ScrollReveal } from './ScrollReveal';

const badges = [
  { icon: '🔒', label: 'Audited' },
  { icon: '🏛️', label: 'Non-custodial' },
  { icon: '⚡', label: 'Built on Thetanuts V4' },
  { icon: '🌐', label: '24/7 Access' },
];

export function TrustBar() {
  return (
    <div className="bg-white border-t border-gray-100 py-6 px-6">
      <ScrollReveal>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-sm text-gray-500">
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}
