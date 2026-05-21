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

        {/* Calendar body with light emerald fill */}
        <rect x="22" y="28" width="56" height="50" rx="8" fill="#d1fae5" stroke={`url(#${gradientId})`} strokeWidth="3.5" />
        
        {/* Calendar top bar (header) */}
        <path d="M22 40 H78" stroke={`url(#${gradientId})`} strokeWidth="3.5" strokeLinecap="round" />
        
        {/* Calendar top-left date number */}
        <text x="36" y="62" textAnchor="middle" fill="#059669" fontFamily="monospace" fontWeight="800" fontSize="18">
          17
        </text>
        
        {/* Binding rings */}
        <circle cx="32" cy="26" r="3.5" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
        <circle cx="50" cy="26" r="3.5" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
        <circle cx="68" cy="26" r="3.5" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
        
        {/* Subtle dot accents on the date */}
        <circle cx="60" cy="60" r="2.5" fill="#10b981" opacity="0.5" />
        <circle cx="68" cy="60" r="2.5" fill="#10b981" opacity="0.3" />
      </svg>
    </div>
  );
}
