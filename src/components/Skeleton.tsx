interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const base = 'animate-pulse bg-slate-200';
  const shapes = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };
  return <div className={`${base} ${shapes[variant]} ${className}`} />;
}
