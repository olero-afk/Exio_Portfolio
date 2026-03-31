import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { formatM2, formatPercent } from '../utils/formatters.ts';
import { StatusBadge } from '../components/shared/StatusBadge.tsx';
import { AddBuildingModal } from '../components/building/AddBuildingModal.tsx';
import { MiniGauge } from '../components/shared/MaturityGauge.tsx';
import { usePortfolioMaturity } from '../hooks/useMaturity.ts';
import { usePageTitle } from '../hooks/usePageTitle.ts';
import './BuildingListPage.css';

export function BuildingListPage() {
  usePageTitle('Bygg');
  const { buildings } = usePortfolioContext();
  const active = buildings.filter((b) => !b.isArchived);
  const [showAddModal, setShowAddModal] = useState(false);
  const maturity = usePortfolioMaturity();
  const maturityMap = new Map(maturity.buildings.map((m) => [m.buildingId, m.percentage]));

  return (
    <div className="building-list">
      <div className="building-list__header">
        <div>
          <h1 className="building-list__title">Bygg</h1>
          <p className="building-list__count">{active.length} bygninger i porteføljen</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="building-list__add-btn" onClick={() => setShowAddModal(true)}>
            + Legg til bygg
          </button>
          <span style={{ padding: '6px 12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#7a7a7a', fontSize: '0.75rem', fontWeight: 500, cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Prosjektportefølje
            <span style={{ fontSize: '0.55rem', fontWeight: 800, background: 'rgba(254,208,146,0.15)', color: '#FED092', padding: '1px 5px', borderRadius: 3 }}>Kommer snart</span>
          </span>
        </div>
      </div>

      <div className="building-list__grid">
        {active.map((b) => (
          <Link key={b.id} to={`/bygg/${b.id}`} className="building-list__card">
            <div className="building-list__card-header">
              <h2 className="building-list__card-name">{b.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MiniGauge percentage={maturityMap.get(b.id) ?? 0} />
                <StatusBadge label={b.buildingType} variant="muted" />
              </div>
            </div>
            <p className="building-list__card-address">
              {b.address.street}, {b.address.postalCode} {b.address.municipality}
            </p>
            <div className="building-list__card-metrics">
              <div className="building-list__card-metric">
                <span className="building-list__card-metric-label">Totalt</span>
                <span className="building-list__card-metric-value">{formatM2(b.totalAreaM2)}</span>
              </div>
              <div className="building-list__card-metric">
                <span className="building-list__card-metric-label">Utleiegrad</span>
                <span className="building-list__card-metric-value">{formatPercent(b.occupancyRate * 100)}</span>
              </div>
              <div className="building-list__card-metric">
                <span className="building-list__card-metric-label">Energi</span>
                <span className="building-list__card-metric-value">
                  {b.energyLabel ?? '—'}
                  {b.energyLabelDate && new Date(b.energyLabelDate).getFullYear() + 10 <= new Date().getFullYear() && (
                    <span style={{ color: '#f87171', fontSize: '0.65rem', marginLeft: 3 }} title="Energimerke utløpt">⚠</span>
                  )}
                </span>
              </div>
              <div className="building-list__card-metric">
                <span className="building-list__card-metric-label">Standard</span>
                <span className="building-list__card-metric-value">{b.standard ?? '—'}</span>
              </div>
            </div>
            {b.owners.length > 1 && (
              <Link
                to={`/bygg/${b.id}/eiere`}
                className="building-list__card-owners"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#9a9a9a', fontSize: '0.75rem', textDecoration: 'none', cursor: 'pointer', marginTop: 4 }}
              >
                Eierbrøk: {b.owners.map((o) => `${o.name.split(' ')[0]} ${formatPercent(o.ownershipShare)}`).join(' · ')}
              </Link>
            )}
            {b.vacancyRate > 0.15 && (
              <div className="building-list__card-warning">
                Høy ledighet: {formatPercent(b.vacancyRate * 100)}
              </div>
            )}
          </Link>
        ))}
      </div>

      {showAddModal && <AddBuildingModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
