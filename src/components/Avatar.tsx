import { getAvatarColor } from '../lib/utils';

interface AvatarProps {
  name: string;
  className?: string;
  size?: number;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, className = '', size = 40 }: AvatarProps) {
  const initials = getInitials(name);
  const bg = getAvatarColor(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-label={name}
    >
      <circle cx="20" cy="20" r="20" fill={bg} />
      <text
        x="20"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize={initials.length > 1 ? '14' : '18'}
      >
        {initials}
      </text>
    </svg>
  );
}
