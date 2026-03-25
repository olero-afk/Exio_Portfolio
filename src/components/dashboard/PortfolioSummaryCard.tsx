import { useState } from 'react';
import { formatM2, formatPercent } from '../../utils/formatters.ts';
import type { DashboardKPIs } from '../../hooks/useKPI.ts';
import './PortfolioSummaryCard.css';

interface PortfolioSummaryCardProps {
  kpis: DashboardKPIs;
}

export function PortfolioSummaryCard({ kpis }: PortfolioSummaryCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="portfolio-summary">
      <div className="portfolio-summary__header">
        <span className="portfolio-summary__title">PORTEFØLJE</span>
        <div
          className="portfolio-summary__info"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span className="portfolio-summary__info-icon">ⓘ</span>
          {showTooltip && (
            <div className="portfolio-summary__tooltip">
              <div className="portfolio-summary__tooltip-title">Porteføljeoversikt</div>
              <div className="portfolio-summary__tooltip-row">
                <span className="portfolio-summary__tooltip-label">Formel:</span>
                <span>Antall aktive bygninger og sum totalareal</span>
              </div>
              <div className="portfolio-summary__tooltip-row">
                <span className="portfolio-summary__tooltip-label">Kilde:</span>
                <span>Porteføljedata</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="portfolio-summary__metrics">
        <div className="portfolio-summary__metric">
          <span className="portfolio-summary__value">{kpis.buildingCount}</span>
          <span className="portfolio-summary__label">Antall bygg</span>
        </div>

        <div className="portfolio-summary__divider" />

        <div className="portfolio-summary__metric">
          <span className="portfolio-summary__value">{formatM2(kpis.totalM2)}</span>
          <span className="portfolio-summary__label">Total m²</span>
        </div>
      </div>

      <div className="portfolio-summary__details">
        <div className="portfolio-summary__detail-row">
          <span className="portfolio-summary__detail-label">Ekslusivt areal</span>
          <span className="portfolio-summary__detail-value">{formatM2(kpis.totalRentableM2)}</span>
        </div>
        <div className="portfolio-summary__detail-row">
          <span className="portfolio-summary__detail-label">Utleid</span>
          <span className="portfolio-summary__detail-value">{formatM2(kpis.totalCommittedM2)}</span>
        </div>
        <div className="portfolio-summary__detail-row">
          <span className="portfolio-summary__detail-label">Ledig</span>
          <span className="portfolio-summary__detail-value portfolio-summary__detail-value--warning">
            {formatM2(kpis.totalRentableM2 - kpis.totalCommittedM2)}
          </span>
        </div>
        <div className="portfolio-summary__detail-row">
          <span className="portfolio-summary__detail-label">Utleiegrad</span>
          <span className="portfolio-summary__detail-value">
            {formatPercent(kpis.portfolioOccupancyRate * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}
