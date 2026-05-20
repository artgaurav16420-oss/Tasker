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

        {/* Outer precision ring */}
        <circle cx="50" cy="50" r="46" stroke="#10b981" strokeWidth="1.5" opacity="0.2" />

        {/* Dark circle base with subtle inner glow */}
        <circle cx="50" cy="50" r="42" fill="#0f172a" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="url(#gradientId)" strokeWidth="1" opacity="0.15" />

        {/* Tactical grid - subtle reference lines */}
        <g opacity="0.08">
          <line x1="50" y1="12" x2="50" y2="20" stroke="#10b981" strokeWidth="1" />
          <line x1="50" y1="80" x2="50" y2="88" stroke="#10b981" strokeWidth="1" />
          <line x1="12" y1="50" x2="20" y2="50" stroke="#10b981" strokeWidth="1" />
          <line x1="80" y1="50" x2="88" y2="50" stroke="#10b981" strokeWidth="1" />
          
          {/* Diagonal reference lines for precision - wrapped in group to avoid fragment issues */}
          <g>
            <line x1="30" y1="30" x2="38" y2="38" stroke="#10b981" strokeWidth="0.5" />
            <line x1="62" y1="62" x2="70" y2="70" stroke="#10b981" strokeWidth="0.5" />
            <line x1="62" y1="38" x2="70" y2="30" stroke="#10b981" strokeWidth="0.5" />
            <line x1="30" y1="62" x2="38" y2="70" stroke="#10b981" strokeWidth="0.5" />
          </g>
        </g>

        {/* Premium "T" emblem - optimized for clarity and balance */}
        {/* Top bar of T - wider for better proportions */}
        <path
          d="M28 30 H72"
          stroke={`url(${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Stem of T - more refined checkmark shape */}
        <path
          d="M50 30 V44 L60 56"
          stroke={`url(${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center precision dot - slightly larger for visibility */}
        <circle cx="50" cy="50" r="2.5" fill="#10b981" opacity="0.5" />

        {/* Subtle outer accent ring for depth */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="url(#gradientId)" strokeWidth="0.5" opacity="0.1" />
      </svg>
    </div>
  );
}
