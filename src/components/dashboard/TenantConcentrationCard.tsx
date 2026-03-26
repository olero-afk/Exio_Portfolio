import { formatNOK, formatPercent } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './TenantConcentrationCard.css';

interface Props { kpis: PortfolioKPIs; }

export function TenantConcentrationCard({ kpis }: Props) {
  const { topTenants, topTenCoverage, totalGrossRentalIncome } = kpis;
  const maxPct = topTenants.length > 0 ? topTenants[0].percentOfPortfolio : 100;

  return (
    <div className="tc-card">
      <span className="tc-card__title">TOP 10 LEIETAKERE</span>
      <div className="tc-card__list">
        {topTenants.map((t, i) => (
          <div key={t.tenantName} className="tc-card__row">
            <div className="tc-card__row-header">
              <span className="tc-card__rank">{i + 1}.</span>
              <span className="tc-card__name">
                {t.tenantName}
                {t.isBankrupt && <span className="tc-card__bankrupt">KONKURS</span>}
              </span>
              <span className="tc-card__pct">{formatPercent(t.percentOfPortfolio)}</span>
            </div>
            <div className="tc-card__bar-track">
              <div
                className="tc-card__bar-fill"
                style={{ width: `${(t.percentOfPortfolio / maxPct) * 100}%` }}
              />
            </div>
            <span className="tc-card__rent">{formatNOK(t.totalAnnualRent)}</span>
          </div>
        ))}
      </div>
      {totalGrossRentalIncome > 0 && (
        <div className="tc-card__footer">
          Topp 10 dekker: <strong>{formatPercent(topTenCoverage)}</strong> av total
        </div>
      )}
    </div>
  );
}
