import { Link } from 'react-router-dom';
import { formatNOK } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './PortfolioValueCard.css';

interface Props { kpis: PortfolioKPIs; }

export function PortfolioValueCard({ kpis }: Props) {
  return (
    <div className="pv-card">
      <div className="pv-card__header">
        <span className="pv-card__title">PORTEFØLJEVERDIER</span>
      </div>
      <div className="pv-card__label">Total verdi</div>
      <div className="pv-card__value">{formatNOK(kpis.totalPortfolioValue)}</div>
      <div className="pv-card__funds">
        {kpis.fundValues.map((fv) => (
          <Link key={fv.fund.id} to={`/fond/${fv.fund.id}`} className="pv-card__fund-row">
            <span className="pv-card__fund-name">{fv.fund.name}</span>
            <span className="pv-card__fund-value">{formatNOK(fv.totalValue)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
