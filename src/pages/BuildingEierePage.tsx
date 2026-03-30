import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { BuildingTabs } from '../components/building/BuildingTabs.tsx';
import { formatPercent } from '../utils/formatters.ts';
import './BuildingDetailPage.css';

export function BuildingEierePage() {
  const { buildingId } = useParams();
  const { buildings } = usePortfolioContext();
  const building = buildings.find((b) => b.id === buildingId);

  if (!building) return null;

  const totalShare = building.owners.reduce((s, o) => s + o.ownershipShare, 0);

  return (
    <div className="building-detail">
      <div className="building-detail__header">
        <h1 className="building-detail__name">{building.name}</h1>
        <p className="building-detail__address">
          {building.address.street}, {building.address.postalCode} {building.address.municipality}
        </p>
      </div>
      <BuildingTabs />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {building.owners.map((owner) => (
          <div
            key={owner.id}
            style={{
              background: 'var(--app-surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, color: 'var(--app-text)', fontSize: '0.9375rem' }}>{owner.name}</span>
              {owner.role && (
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '1px 6px',
                  borderRadius: 3,
                  color: owner.role === 'eier' ? '#4ade80' : '#22d4e8',
                  background: owner.role === 'eier' ? 'rgba(74,222,128,0.12)' : 'rgba(34,212,232,0.12)',
                }}>
                  {owner.role === 'eier' ? 'Eier' : 'Investor'}
                </span>
              )}
            </div>

            <span style={{ color: '#9a9a9a', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
              Org.nr: {owner.orgNr || '—'}
            </span>

            <div>
              <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.8125rem' }}>
                Eierandel: {formatPercent(owner.ownershipShare)}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ background: '#2a2a2a', borderRadius: 3, height: 6, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${owner.ownershipShare}%`,
                  height: '100%',
                  background: '#22d4e8',
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ color: 'var(--app-text-muted)', fontSize: '0.8125rem' }}>
          Total: {formatPercent(totalShare)}
        </span>
        <button
          style={{
            background: 'transparent',
            color: '#FED092',
            border: '1px solid rgba(254,208,146,0.3)',
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={() => {/* placeholder — no modal yet */}}
        >
          + Legg til eier
        </button>
      </div>
    </div>
  );
}
