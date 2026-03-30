interface MaturityGaugeProps {
  percentage: number;
  size?: number;
  label?: string;
  sublabel?: string;
  onClick?: () => void;
}

export function MaturityGauge({ percentage, size = 100, label, sublabel, onClick }: MaturityGaugeProps) {
  const stroke = size * 0.08;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * radius;
  const filled = (percentage / 100) * circumference;

  const color = percentage >= 60 ? '#4ade80' : percentage >= 30 ? '#22d4e8' : '#f87171';

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
    >
      <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`}>
        {/* Background arc */}
        <path
          d={`M ${stroke / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${cy}`}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${stroke / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference - filled}
        />
        {/* Percentage text */}
        <text x={cx} y={cy - 2} textAnchor="middle" fill="#e8e8e8" fontSize={size * 0.22} fontWeight={800} fontFamily="Inter, sans-serif">
          {percentage}%
        </text>
      </svg>
      {label && (
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      )}
      {sublabel && (
        <span style={{ fontSize: '0.6875rem', color: '#7a7a7a' }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

/** Tiny inline gauge for building cards */
export function MiniGauge({ percentage, size = 22 }: { percentage: number; size?: number }) {
  const color = percentage >= 60 ? '#4ade80' : percentage >= 30 ? '#22d4e8' : '#f87171';
  const r = size / 2 - 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;

  return (
    <svg width={size} height={size} style={{ verticalAlign: 'middle' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2a2a" strokeWidth={2.5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={2.5}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={7} fontWeight={800} fontFamily="Inter, sans-serif">
        {percentage}
      </text>
    </svg>
  );
}
