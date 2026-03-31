import { Link } from 'react-router-dom';
import { usePortfolioMaturity } from '../hooks/useMaturity.ts';
import { MaturityGauge, MiniGauge } from '../components/shared/MaturityGauge.tsx';
import { LEVEL_NAMES } from '../data/maturity.ts';
import { formatPercent } from '../utils/formatters.ts';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { usePageTitle } from '../hooks/usePageTitle.ts';

const LEVEL_COLORS: Record<1 | 2 | 3, string> = {
  1: '#4ade80',
  2: '#22d4e8',
  3: '#d4c090',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--app-surface)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 8,
  padding: 20,
};

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  fontSize: '0.6875rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#9a9a9a',
  textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  fontSize: '0.8125rem',
  color: '#c8c8c8',
};

export function InnsiktsnivåPage() {
  usePageTitle('Innsiktsnivå');
  const data = usePortfolioMaturity();
  const { buildings } = usePortfolioContext();

  const aggregateLevelCounts = ([1, 2, 3] as const).map((level) => {
    let active = 0;
    let total = 0;
    for (const m of data.buildings) {
      const lc = m.levelCounts.find((l) => l.level === level);
      if (lc) {
        active += lc.active;
        total += lc.total;
      }
    }
    return { level, active, total };
  });

  const sortedBuildings = [...data.buildings].sort((a, b) => b.percentage - a.percentage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--app-text)', margin: 0 }}>
          Innsiktsnivå
        </h1>
        <span style={{ fontSize: '0.8125rem', color: '#9a9a9a' }}>Porteføljeoversikt</span>
      </div>

      {/* Top section */}
      <div style={{ ...cardStyle, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Left: gauge */}
        <MaturityGauge
          percentage={data.averagePercentage}
          size={140}
          label="Innsiktsnivå"
          sublabel="Portefølje gjennomsnitt"
        />

        {/* Right: level summary */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 280 }}>
          {([1, 2, 3] as const).map((level) => {
            const info = LEVEL_NAMES[level];
            const agg = aggregateLevelCounts.find((a) => a.level === level)!;
            const color = LEVEL_COLORS[level];
            const isActive = level === 1;
            const pct = agg.total > 0 ? Math.round((agg.active / agg.total) * 100) : 0;

            return (
              <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Badge */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    background: `${color}22`,
                    color,
                    flexShrink: 0,
                  }}
                >
                  {level}
                </span>

                {/* Name */}
                <span style={{ fontSize: '0.8125rem', color: '#c8c8c8', minWidth: 170, flexShrink: 0 }}>
                  {info.name}
                </span>

                {/* Progress bar */}
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: '#2a2a2a',
                    overflow: 'hidden',
                    minWidth: 80,
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: color,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  )}
                </div>

                {/* Status */}
                {isActive ? (
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      flexShrink: 0,
                      minWidth: 100,
                      textAlign: 'right',
                    }}
                  >
                    AKTIV — {agg.active}/{agg.total}
                  </span>
                ) : level === 2 ? (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: '#22d4e8',
                      cursor: 'pointer',
                      flexShrink: 0,
                      minWidth: 100,
                      textAlign: 'right',
                    }}
                  >
                    Koble til ERP &rarr;
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: '#d4c090',
                      cursor: 'pointer',
                      flexShrink: 0,
                      minWidth: 100,
                      textAlign: 'right',
                    }}
                  >
                    Kontakt salg &rarr;
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Building table */}
      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Bygg</th>
              <th style={thStyle}>Nivå</th>
              <th style={thStyle}>Innsiktsnivå</th>
              <th style={thStyle}>Nivå 1</th>
              <th style={thStyle}>Neste steg</th>
            </tr>
          </thead>
          <tbody>
            {sortedBuildings.map((m) => {
              const building = buildings.find((b) => b.id === m.buildingId);
              const level1 = m.levelCounts.find((l) => l.level === 1);

              return (
                <tr key={m.buildingId}>
                  <td style={tdStyle}>
                    <Link
                      to={`/bygg/${m.buildingId}/innsiktsniva`}
                      style={{ color: '#e8e8e8', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {building?.name ?? m.buildingId}
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        background: `${LEVEL_COLORS[m.currentLevel]}22`,
                        color: LEVEL_COLORS[m.currentLevel],
                      }}
                    >
                      {m.currentLevel}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MiniGauge percentage={m.percentage} />
                      <span>{formatPercent(m.percentage)}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {level1 ? `${level1.active}/${level1.total}` : '—'}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: '#22d4e8', cursor: 'pointer', fontSize: '0.8125rem' }}>
                      Koble til ERP &rarr;
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CTA section */}
      <div
        style={{
          ...cardStyle,
          borderLeft: '3px solid #d4c090',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e8e8e8' }}>
            Koble til ERP for alle bygg
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9a9a9a', marginTop: 4 }}>
            Få live data fra regnskapssystemet og lås opp Nivå 2-funksjoner.
          </div>
        </div>
        <button
          style={{
            background: 'transparent',
            border: '1px solid #d4c090',
            borderRadius: 6,
            padding: '8px 16px',
            color: '#d4c090',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Kontakt oss &rarr;
        </button>
      </div>
    </div>
  );
}
