import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { BuildingTabs } from '../components/building/BuildingTabs.tsx';
import { useBuildingMaturity, type CapabilityStatus } from '../hooks/useMaturity.ts';
import { MaturityGauge } from '../components/shared/MaturityGauge.tsx';
import { LEVEL_NAMES } from '../data/maturity.ts';
import './BuildingDetailPage.css';

type Filter = 'alle' | 'aktiv' | 'tilgjengelig' | 'krever_oppgradering';

const LEVEL_COLORS: Record<1 | 2 | 3, string> = {
  1: '#4ade80',
  2: '#22d4e8',
  3: '#FED092',
};

const LEVEL_STATUS_LABELS: Record<1 | 2 | 3, { label: string; color: string }> = {
  1: { label: '● AKTIV', color: '#4ade80' },
  2: { label: 'Koble til ERP →', color: '#22d4e8' },
  3: { label: 'Kontakt salg →', color: '#FED092' },
};

const FILTER_OPTIONS: { key: Filter; label: string }[] = [
  { key: 'alle', label: 'Vis alle' },
  { key: 'aktiv', label: 'Kun aktive' },
  { key: 'tilgjengelig', label: 'Kun tilgjengelige' },
  { key: 'krever_oppgradering', label: 'Kun oppgradering' },
];

function StatusBadge({ status, requiredLevel }: { status: CapabilityStatus; requiredLevel: 1 | 2 | 3 }) {
  if (status === 'aktiv') {
    return (
      <span style={{ display: 'inline-block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 6px', borderRadius: 3, background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
        Aktiv
      </span>
    );
  }
  if (status === 'tilgjengelig') {
    return (
      <span style={{ display: 'inline-block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 6px', borderRadius: 3, background: 'rgba(34,212,232,0.1)', color: '#22d4e8' }}>
        Mangler data
      </span>
    );
  }
  // krever_oppgradering
  if (requiredLevel === 2) {
    return (
      <span style={{ display: 'inline-block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 6px', borderRadius: 3, background: 'rgba(34,212,232,0.1)', color: '#22d4e8' }}>
        Koble til ERP
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 6px', borderRadius: 3, background: 'rgba(254,208,146,0.1)', color: '#FED092' }}>
      Oppgrader
    </span>
  );
}

function LevelBadge({ level }: { level: 1 | 2 | 3 }) {
  const color = LEVEL_COLORS[level];
  return (
    <span style={{ display: 'inline-block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 6px', borderRadius: 3, background: `${color}22`, color }}>
      {level}
    </span>
  );
}

export function BuildingMaturityPage() {
  const { buildingId } = useParams();
  const { buildings } = usePortfolioContext();
  const building = buildings.find((b) => b.id === buildingId);
  const maturity = useBuildingMaturity(buildingId ?? '');
  const [filter, setFilter] = useState<Filter>('alle');

  if (!building || !buildingId || !maturity) return null;

  const filteredCapabilities = maturity.capabilities.filter((c) =>
    filter === 'alle' ? true : c.status === filter,
  );

  // Group by category, preserving order
  const categories: string[] = [];
  for (const c of filteredCapabilities) {
    if (!categories.includes(c.capability.category)) {
      categories.push(c.capability.category);
    }
  }

  return (
    <div className="building-detail">
      {/* Header */}
      <div className="building-detail__header">
        <h1 className="building-detail__name">{building.name}</h1>
        <p className="building-detail__address">
          {building.address.street}, {building.address.postalCode} {building.address.municipality}
        </p>
      </div>
      <BuildingTabs />

      {/* Gauge + Summary */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginBottom: 20 }}>
        <MaturityGauge
          percentage={maturity.percentage}
          size={120}
          label="Datakvalitet"
          sublabel={`Nivå ${maturity.currentLevel} — ${LEVEL_NAMES[maturity.currentLevel].name}`}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.875rem', color: '#e8e8e8', fontWeight: 600 }}>
            {maturity.activeCount} av {maturity.totalCount} funksjoner aktive
          </span>
          <span style={{ fontSize: '0.8125rem', color: '#9a9a9a' }}>
            Nåværende nivå: Nivå {maturity.currentLevel} — {LEVEL_NAMES[maturity.currentLevel].name}
          </span>
          <span style={{ fontSize: '0.8125rem', color: '#9a9a9a' }}>
            Neste steg: Koble til ERP → ~68%
          </span>
        </div>
      </div>

      {/* Level Progress Bars */}
      <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        {([1, 2, 3] as const).map((level) => {
          const lc = maturity.levelCounts.find((l) => l.level === level);
          if (!lc) return null;
          const pct = lc.total > 0 ? (lc.active / lc.total) * 100 : 0;
          const color = LEVEL_COLORS[level];
          const statusInfo = LEVEL_STATUS_LABELS[level];
          return (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: level < 3 ? 12 : 0 }}>
              <span style={{ display: 'inline-block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 6px', borderRadius: 3, background: `${color}22`, color, minWidth: 38, textAlign: 'center' }}>
                Nivå {level}
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#c8c8c8', fontWeight: 500, minWidth: 180 }}>
                {LEVEL_NAMES[level].name}
              </span>
              <div style={{ flex: 1, height: 6, background: '#2a2a2a', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s ease' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#9a9a9a', fontWeight: 600, minWidth: 32, textAlign: 'right' }}>
                {lc.active}/{lc.total}
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: statusInfo.color, minWidth: 100 }}>
                {statusInfo.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {FILTER_OPTIONS.map((opt) => {
          const isActive = filter === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'transparent',
                border: isActive ? '1px solid #FED092' : '1px solid rgba(255,255,255,0.1)',
                color: isActive ? '#FED092' : '#7a7a7a',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Capability Table */}
      <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Kategori', 'Funksjon', 'Beskrivelse', 'Datakilde', 'Nivå', 'Status'].map((col) => (
                <th key={col} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9a9a9a', textAlign: 'left' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const catCaps = filteredCapabilities.filter((c) => c.capability.category === cat);
              return [
                <tr key={`cat-${cat}`}>
                  <td colSpan={6} style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7a7a', padding: 12 }}>
                    {cat}
                  </td>
                </tr>,
                ...catCaps.map((c) => (
                  <tr key={c.capability.id}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8125rem', color: '#c8c8c8' }}>
                      {c.capability.category}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8125rem', color: '#c8c8c8' }}>
                      {c.capability.name}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8125rem', color: '#c8c8c8' }}>
                      {c.capability.description}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8125rem', color: '#c8c8c8' }}>
                      {c.capability.dataSource}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8125rem', color: '#c8c8c8' }}>
                      <LevelBadge level={c.capability.requiredLevel} />
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8125rem', color: '#c8c8c8' }}>
                      <StatusBadge status={c.status} requiredLevel={c.capability.requiredLevel} />
                    </td>
                  </tr>
                )),
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
