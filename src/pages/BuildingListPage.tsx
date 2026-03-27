import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { formatM2, formatPercent } from '../utils/formatters.ts';
import { StatusBadge } from '../components/shared/StatusBadge.tsx';
import { AddBuildingModal } from '../components/building/AddBuildingModal.tsx';
import './BuildingListPage.css';

export function BuildingListPage() {
  const { buildings } = usePortfolioContext();
  const active = buildings.filter((b) => !b.isArchived);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="building-list">
      <div className="building-list__header">
        <div>
          <h1 className="building-list__title">Bygg</h1>
          <p className="building-list__count">{active.length} bygninger i porteføljen</p>
        </div>
        <button className="building-list__add-btn" onClick={() => setShowAddModal(true)}>
          + Legg til bygg
        </button>
      </div>

      <div className="building-list__grid">
        {active.map((b) => (
          <Link key={b.id} to={`/bygg/${b.id}`} className="building-list__card">
            <div className="building-list__card-header">
              <h2 className="building-list__card-name">{b.name}</h2>
              <StatusBadge
                label={b.buildingType}
                variant="muted"
              />
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
                <span className="building-list__card-metric-value">{b.energyLabel ?? '—'}</span>
              </div>
              <div className="building-list__card-metric">
                <span className="building-list__card-metric-label">Standard</span>
                <span className="building-list__card-metric-value">{b.standard ?? '—'}</span>
              </div>
            </div>
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
