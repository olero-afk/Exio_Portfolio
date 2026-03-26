import { formatYears, formatNOK, formatPercent } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './WAULTPortfolioCard.css';

interface Props { kpis: PortfolioKPIs; }

export function WAULTPortfolioCard({ kpis }: Props) {
  return (
    <div className="wault-p-card">
      <span className="wault-p-card__title">WAULT</span>
      <div className="wault-p-card__value">{formatYears(kpis.portfolioWAULT)}</div>
      <div className="wault-p-card__sub">Effektiv WAULT: {formatYears(kpis.effectiveWAULT)}</div>
      <div className="wault-p-card__risk">
        <span className="wault-p-card__risk-label">Inntekt i risiko (12 mnd):</span>
        <span className="wault-p-card__risk-value">
          {formatNOK(kpis.incomeAtRisk)} ({formatPercent(kpis.incomeAtRiskPercent)} av total)
        </span>
      </div>
    </div>
  );
}
