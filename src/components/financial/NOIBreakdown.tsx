import { useMemo } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, isNegative } from '../../utils/formatters.ts';
import './NOIBreakdown.css';

interface NOIBreakdownProps {
  buildingId: string;
}

export function NOIBreakdown({ buildingId }: NOIBreakdownProps) {
  const { contracts, costs, buildings } = usePortfolioContext();

  const data = useMemo(() => {
    const building = buildings.find((b) => b.id === buildingId);
    const active = contracts.filter(
      (c) => c.buildingId === buildingId && (c.status === 'active' || c.status === 'expiring_soon'),
    );
    const grossRentalIncome = active.reduce((s, c) => s + c.annualRent, 0);

    const buildingCosts = costs.filter((c) => c.buildingId === buildingId);
    // Annualize: sum all costs and scale to 12 months
    const months = new Set(buildingCosts.map((c) => `${c.year}-${c.month}`)).size;
    const totalCosts = buildingCosts.reduce((s, c) => s + c.amount, 0);
    const annualizedCosts = months > 0 ? (totalCosts / months) * 12 : 0;

    const noi = grossRentalIncome - annualizedCosts;
    const noiMargin = grossRentalIncome > 0 ? (noi / grossRentalIncome) * 100 : 0;
    const noiPerM2 = building && building.totalRentableM2 > 0 ? noi / building.totalRentableM2 : 0;
    const costPerM2 = building && building.totalRentableM2 > 0 ? annualizedCosts / building.totalRentableM2 : 0;

    const yield_ = building?.estimatedMarketValue
      ? (noi / building.estimatedMarketValue) * 100
      : null;

    return { grossRentalIncome, annualizedCosts, noi, noiMargin, noiPerM2, costPerM2, yield: yield_ };
  }, [contracts, costs, buildings, buildingId]);

  return (
    <div className="noi-breakdown">
      <h3 className="noi-breakdown__title">NOI OVERSIKT</h3>
      <div className="noi-breakdown__grid">
        <div className="noi-breakdown__metric">
          <span className="noi-breakdown__label">Leieinntekter (årlig)</span>
          <span className="noi-breakdown__value">{formatNOK(data.grossRentalIncome)}</span>
        </div>
        <div className="noi-breakdown__metric">
          <span className="noi-breakdown__label">Driftskostnader (annualisert)</span>
          <span className="noi-breakdown__value noi-breakdown__value--expense">
            −{formatNOK(data.annualizedCosts)}
          </span>
        </div>
        <div className="noi-breakdown__metric noi-breakdown__metric--highlight">
          <span className="noi-breakdown__label">NOI</span>
          <span className={`noi-breakdown__value ${isNegative(data.noi) ? 'negative' : ''}`}>
            {formatNOK(data.noi)}
          </span>
        </div>
        <div className="noi-breakdown__metric">
          <span className="noi-breakdown__label">NOI-margin</span>
          <span className="noi-breakdown__value">{formatPercent(data.noiMargin)}</span>
        </div>
        <div className="noi-breakdown__metric">
          <span className="noi-breakdown__label">NOI per m²</span>
          <span className="noi-breakdown__value">{formatNOK(data.noiPerM2)}</span>
        </div>
        <div className="noi-breakdown__metric">
          <span className="noi-breakdown__label">Kostnad per m²</span>
          <span className="noi-breakdown__value">{formatNOK(data.costPerM2)}</span>
        </div>
        {data.yield !== null && (
          <div className="noi-breakdown__metric">
            <span className="noi-breakdown__label">Yield (NIY)</span>
            <span className="noi-breakdown__value">{formatPercent(data.yield)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
