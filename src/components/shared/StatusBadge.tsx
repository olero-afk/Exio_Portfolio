import './StatusBadge.css';

type Variant = 'green' | 'red' | 'yellow' | 'cyan' | 'muted';

interface StatusBadgeProps {
  label: string;
  variant: Variant;
}

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${variant}`}>
      {label}
    </span>
  );
}
