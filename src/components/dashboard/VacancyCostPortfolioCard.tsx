import { formatNOK, formatM2 } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './VacancyCostPortfolioCard.css';

interface Props { kpis: PortfolioKPIs; }

export function VacancyCostPortfolioCard({ kpis }: Props) {
  return (
    <div className="vc-p-card">
      <span className="vc-p-card__title">LEDIGHETSKOSTNAD</span>
      <div className="vc-p-card__value">{formatNOK(kpis.totalVacancyCost)}</div>
      <div className="vc-p-card__details">
        <div className="vc-p-card__row">
          <span>Bygg med &gt;10% ledighet:</span>
          <span className="vc-p-card__row-value">{kpis.buildingsHighVacancy}</span>
        </div>
        <div className="vc-p-card__row">
          <span>Total ledig m²:</span>
          <span className="vc-p-card__row-value">{formatM2(kpis.totalVacantM2)}</span>
        </div>
      </div>
    </div>
  );
}
