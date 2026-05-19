import { useId } from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-16 h-16" }: LogoProps) {
  const gradientId = useId();
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Dark circle base */}
        <circle cx="50" cy="50" r="44" fill="#0f172a" />

        {/* Subtle inner ring */}
        <circle cx="50" cy="50" r="36" stroke="#1e293b" strokeWidth="1" strokeOpacity="0.6" />

        {/* Crosshair marks — subtle, integrated into the design */}
        <line x1="50" y1="10" x2="50" y2="22" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <line x1="50" y1="78" x2="50" y2="90" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <line x1="10" y1="50" x2="22" y2="50" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <line x1="78" y1="50" x2="90" y2="50" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

        {/* Bold "T" — the hero mark. Crossbar doubles as target ring, vertical stem is the crosshair */}
        {/* Horizontal crossbar of T */}
        <path
          d="M30 32H70"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Vertical stem of T — extends downward like a checkmark/crosshair */}
        <path
          d="M50 32V52L62 68"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center dot — precision point */}
        <circle cx="50" cy="50" r="2" fill="#10b981" opacity="0.4" />
      </svg>
    </div>
  );
}
