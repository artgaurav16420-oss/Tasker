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

function getColor(name: string) {
  const colors = [
    '#10b981', '#059669', '#0891b2', '#0284c7',
    '#4f46e5', '#7c3aed', '#a855f7', '#d946ef',
    '#db2777', '#e11d48', '#ea580c', '#ca8a04',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, className = '', size = 40 }: AvatarProps) {
  const initials = getInitials(name);
  const bg = getColor(name);
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
