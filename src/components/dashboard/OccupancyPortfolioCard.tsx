import { formatPercent, formatM2 } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './OccupancyPortfolioCard.css';

interface Props { kpis: PortfolioKPIs; }

export function OccupancyPortfolioCard({ kpis }: Props) {
  const pct = kpis.portfolioOccupancyRate * 100;
  return (
    <div className="occ-p-card">
      <span className="occ-p-card__title">UTLEIEGRAD</span>
      <div className="occ-p-card__value">{formatPercent(pct)}</div>
      <div className="occ-p-card__sub">av totalt {formatM2(kpis.totalRentableM2)} ekslusivt areal</div>
      <div className="occ-p-card__bar">
        <div className="occ-p-card__bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className="occ-p-card__bar-label">{formatPercent(pct)}</div>
    </div>
  );
}
