import { Link } from 'react-router-dom';
import { usePersona } from '../../context/PersonaContext.tsx';
import { formatNOK } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './PortfolioValueCard.css';

interface Props { kpis: PortfolioKPIs; }

export function PortfolioValueCard({ kpis }: Props) {
  const { config, clients } = usePersona();

  return (
    <div className="pv-card">
      <div className="pv-card__header">
        <span className="pv-card__title">PORTEFØLJEVERDIER</span>
      </div>
      <div className="pv-card__label">Total verdi</div>
      <div className="pv-card__value">{formatNOK(kpis.totalPortfolioValue)}</div>

      {config.showFundBreakdown && (
        <div className="pv-card__funds">
          {kpis.fundValues.map((fv) => (
            <Link key={fv.fund.id} to={`/fond/${fv.fund.id}`} className="pv-card__fund-row">
              <span className="pv-card__fund-name">{fv.fund.name}</span>
              <span className="pv-card__fund-value">{formatNOK(fv.totalValue)}</span>
            </Link>
          ))}
        </div>
      )}

      {config.showClientBreakdown && (
        <div className="pv-card__funds">
          {clients.map((client) => {
            const clientValue = kpis.filteredBuildings
              .filter((b) => client.buildingIds.includes(b.id))
              .reduce((s, b) => s + (b.estimatedMarketValue ?? 0), 0);
            if (clientValue === 0) return null;
            return (
              <div key={client.id} className="pv-card__fund-row">
                <span className="pv-card__fund-name">{client.name}</span>
                <span className="pv-card__fund-value">{formatNOK(clientValue)}</span>
              </div>
            );
          })}
        </div>
      )}

      {!config.showFundBreakdown && !config.showClientBreakdown && (
        <div className="pv-card__funds">
          <div className="pv-card__fund-row">
            <span className="pv-card__fund-name">{kpis.buildingCount} bygninger</span>
            <span className="pv-card__fund-value">{formatNOK(kpis.totalPortfolioValue)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
