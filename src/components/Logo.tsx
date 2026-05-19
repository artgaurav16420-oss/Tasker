import { useId } from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-16 h-16" }: LogoProps) {
  const gradientId = useId();
  const filterId = useId();
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
          
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feOffset dx="0" dy="2" result="offsetBlur" />
            <feFlood floodColor="black" floodOpacity="0.1" result="color" />
            <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
            <feComposite in="SourceGraphic" in2="shadow" operator="over" />
          </filter>
        </defs>

        {/* The Base Circle (The Target Core) */}
        <circle 
          cx="50" cy="50" r="42" 
          fill="#0f172a" /* slate-900 */
          filter={`url(#${filterId})`}
        />

        {/* Subtle Inner Ring */}
        <circle 
          cx="50" cy="50" r="32" 
          stroke="#1e293b" /* slate-800 */
          strokeWidth="1"
          strokeOpacity="0.5"
        />

        {/* The Icon: Minimal "T" that looks like a tactical hit / checkmark */}
        <path
          d="M35 48L47 60L75 32"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Top Bar of the T (Stylized) */}
        <path
          d="M28 35H45"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          className="opacity-20"
        />

        {/* Precision Crosshair Marks (Minimal) */}
        <rect x="49" y="8" width="2" height="6" fill="#10b981" rx="1" className="opacity-40" />
        <rect x="49" y="86" width="2" height="6" fill="#10b981" rx="1" className="opacity-40" />
        <rect x="8" y="49" width="6" height="2" fill="#10b981" rx="1" className="opacity-40" />
        <rect x="86" y="49" width="6" height="2" fill="#10b981" rx="1" className="opacity-40" />

      </svg>
    </div>
  );
}
