import { useMemo } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, formatYears } from '../../utils/formatters.ts';
import type { Building } from '../../types/index.ts';
import './BuildingKPIs.css';

interface BuildingKPIsProps {
  building: Building;
}

export function BuildingKPIs({ building }: BuildingKPIsProps) {
  const { contracts, costs } = usePortfolioContext();

  const kpis = useMemo(() => {
    const active = contracts.filter(
      (c) => c.buildingId === building.id && (c.status === 'active' || c.status === 'expiring_soon'),
    );
    const income = active.reduce((s, c) => s + c.annualRent, 0);

    const bc = costs.filter((c) => c.buildingId === building.id);
    const ms = new Set(bc.map((c) => `${c.year}-${c.month}`)).size;
    const totalCost = bc.reduce((s, c) => s + c.amount, 0);
    const annualized = ms > 0 ? (totalCost / ms) * 12 : 0;

    const noi = income - annualized;
    const noiMargin = income > 0 ? (noi / income) * 100 : 0;
    const noiPerM2 = building.totalRentableM2 > 0 ? noi / building.totalRentableM2 : 0;

    const totalRent = active.reduce((s, c) => s + c.annualRent, 0);
    const wault = totalRent > 0
      ? active.reduce((sum, c) => sum + Math.max(0, c.remainingTermYears) * c.annualRent, 0) / totalRent
      : 0;
    const effectiveWault = totalRent > 0
      ? active.reduce((sum, c) => sum + Math.max(0, c.effectiveRemainingYears) * c.annualRent, 0) / totalRent
      : 0;

    const vacancyCost = (building.totalRentableM2 - building.committedM2) * (building.marketRentPerM2 ?? 0);

    const yield_ = building.estimatedMarketValue
      ? (noi / building.estimatedMarketValue) * 100
      : null;

    const felleskostPct = income > 0 ? (annualized / income) * 100 : 0;

    return { noi, noiMargin, noiPerM2, wault, effectiveWault, vacancyCost, yield: yield_, activeContracts: active.length, income, felleskostPct };
  }, [building, contracts, costs]);

  return (
    <div className="building-kpis">
      <h3 className="building-kpis__title">NØKKELTALL</h3>
      <div className="building-kpis__grid">
        <div className="building-kpis__metric">
          <span className="building-kpis__label">NOI (annualisert)</span>
          <span className="building-kpis__value">{formatNOK(kpis.noi)}</span>
        </div>
        <div className="building-kpis__metric">
          <span className="building-kpis__label">Utleiegrad</span>
          <span className="building-kpis__value">{formatPercent(building.occupancyRate * 100)}</span>
        </div>
        <div className="building-kpis__metric">
          <span className="building-kpis__label">WAULT</span>
          <span className="building-kpis__value">{formatYears(kpis.wault)}</span>
        </div>
        <div className="building-kpis__metric">
          <span className="building-kpis__label">Effektiv WAULT</span>
          <span className="building-kpis__value">{formatYears(kpis.effectiveWault)}</span>
        </div>
        <div className="building-kpis__metric">
          <span className="building-kpis__label">Brutto leieinntekt</span>
          <span className="building-kpis__value">{formatNOK(kpis.income)}</span>
        </div>
        <div className="building-kpis__metric">
          <span className="building-kpis__label">Felleskost % av leie</span>
          <span className="building-kpis__value">{formatPercent(kpis.felleskostPct)}</span>
        </div>
        <div className="building-kpis__metric">
          <span className="building-kpis__label">NOI per m²</span>
          <span className="building-kpis__value">{formatNOK(kpis.noiPerM2)}</span>
        </div>
        {kpis.yield !== null && (
          <div className="building-kpis__metric">
            <span className="building-kpis__label">Yield (NIY)</span>
            <span className="building-kpis__value">{formatPercent(kpis.yield)}</span>
          </div>
        )}
        <div className="building-kpis__metric">
          <span className="building-kpis__label">Ledighetskostnad</span>
          <span className={`building-kpis__value ${kpis.vacancyCost > 0 ? 'negative' : ''}`}>
            {formatNOK(kpis.vacancyCost)}
          </span>
        </div>
        <div className="building-kpis__metric">
          <span className="building-kpis__label">Aktive kontrakter</span>
          <span className="building-kpis__value">{kpis.activeContracts}</span>
        </div>
        {building.ownershipShare < 100 && (
          <div className="building-kpis__metric">
            <span className="building-kpis__label">Eierbrøk</span>
            <span className="building-kpis__value">{formatPercent(building.ownershipShare)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
