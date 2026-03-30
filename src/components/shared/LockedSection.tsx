import { LEVEL_NAMES } from '../../data/maturity.ts';

interface LockedSectionProps {
  requiredLevel: 2 | 3;
  title: string;
  description: string;
  currentLevel: 1 | 2 | 3;
  children: React.ReactNode;
}

const LEVEL_COLORS: Record<2 | 3, string> = { 2: '#22d4e8', 3: '#FED092' };

export function LockedSection({ requiredLevel, title, description, currentLevel, children }: LockedSectionProps) {
  if (currentLevel >= requiredLevel) {
    return <>{children}</>;
  }

  const color = LEVEL_COLORS[requiredLevel];
  const level = LEVEL_NAMES[requiredLevel];
  const ctaLabel = requiredLevel === 2 ? 'Koble til ERP →' : 'Aktiver Kontraktsforvaltning →';
  const requiresText = requiredLevel === 2
    ? 'Krever: Tripletex, XLedger eller PoGo'
    : 'Krever: Exio Kontraktsforvaltning';

  return (
    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
      {/* Blurred content */}
      <div style={{ filter: 'blur(6px)', opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(26,26,26,0.6)', zIndex: 10,
      }}>
        <div style={{
          background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
          padding: '28px 32px', textAlign: 'center', maxWidth: 400,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          {/* Lock + level badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <span style={{
              fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
              padding: '2px 8px', borderRadius: 3, color, background: `${color}15`,
            }}>
              Nivå {requiredLevel}
            </span>
          </div>

          {/* Title */}
          <span style={{ fontWeight: 700, color: '#e8e8e8', fontSize: '0.9375rem' }}>{title}</span>

          {/* Description */}
          <span style={{ color: '#9a9a9a', fontSize: '0.8125rem', lineHeight: 1.5 }}>{description}</span>

          {/* Requires */}
          <span style={{ color: '#7a7a7a', fontSize: '0.75rem' }}>{requiresText}</span>

          {requiredLevel === 3 && (
            <span style={{ color: '#7a7a7a', fontSize: '0.7rem', fontStyle: 'italic' }}>
              Erstatter Fenistra, Fazile og Excel
            </span>
          )}

          {/* Integration names */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
            {level.integrations.map((name) => (
              <span key={name} style={{
                padding: '3px 8px', background: '#2a2a2a', borderRadius: 4,
                fontSize: '0.6875rem', color: '#9a9a9a',
              }}>{name}</span>
            ))}
          </div>

          {/* CTA */}
          <button style={{
            marginTop: 6, background: 'transparent', color, border: `1px solid ${color}50`,
            borderRadius: 6, padding: '8px 20px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
          }}>
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
