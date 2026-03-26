import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { useFilterContext } from '../context/FilterContext.tsx';
import { usePortfolioKPI } from '../hooks/usePortfolioKPI.ts';
import { ModuleTabs } from '../components/dashboard/ModuleTabs.tsx';
import { PeriodSelector } from '../components/dashboard/PeriodSelector.tsx';
import { PortfolioValueCard } from '../components/dashboard/PortfolioValueCard.tsx';
import { NOIYieldCard } from '../components/dashboard/NOIYieldCard.tsx';
import { CashFlowCard } from '../components/dashboard/CashFlowCard.tsx';
import { WAULTPortfolioCard } from '../components/dashboard/WAULTPortfolioCard.tsx';
import { OccupancyPortfolioCard } from '../components/dashboard/OccupancyPortfolioCard.tsx';
import { VacancyCostPortfolioCard } from '../components/dashboard/VacancyCostPortfolioCard.tsx';
import { DiversificationCard } from '../components/dashboard/DiversificationCard.tsx';
import { TenantConcentrationCard } from '../components/dashboard/TenantConcentrationCard.tsx';
import { ExpiryProfileCard } from '../components/dashboard/ExpiryProfileCard.tsx';
import { CovenantCard } from '../components/dashboard/CovenantCard.tsx';
import { formatM2, formatPercent, formatNOK, formatYears } from '../utils/formatters.ts';
import type { Building, Contract } from '../types/index.ts';
import './FundViewPage.css';

interface BuildingRow {
  building: Building;
  noi: number;
  wault: number;
  vacancyCost: number;
}

export function FundViewPage() {
  const { fondId } = useParams();
  const { funds, contracts, costs } = usePortfolioContext();
  const { setSelectedFundId } = useFilterContext();
  const fund = funds.find((f) => f.id === fondId);

  useEffect(() => {
    if (fondId) setSelectedFundId(fondId);
    return () => setSelectedFundId(null);
  }, [fondId, setSelectedFundId]);

  const kpis = usePortfolioKPI();

  const buildingRows: BuildingRow[] = useMemo(() => {
    return kpis.filteredBuildings.map((b) => {
      const active = contracts.filter(
        (c: Contract) => c.buildingId === b.id && (c.status === 'active' || c.status === 'expiring_soon'),
      );
      const income = active.reduce((s: number, c: Contract) => s + c.annualRent, 0);
      const bc = costs.filter((c) => c.buildingId === b.id);
      const ms = new Set(bc.map((c) => `${c.year}-${c.month}`)).size;
      const totalCost = bc.reduce((s, c) => s + c.amount, 0);
      const annualized = ms > 0 ? (totalCost / ms) * 12 : 0;
      const noi = income - annualized;

      const totalRent = active.reduce((s: number, c: Contract) => s + c.annualRent, 0);
      const wault = totalRent > 0
        ? active.reduce((sum: number, c: Contract) => sum + Math.max(0, c.remainingTermYears) * c.annualRent, 0) / totalRent
        : 0;

      const vacancyCost = (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0);

      return { building: b, noi, wault, vacancyCost };
    });
  }, [kpis.filteredBuildings, contracts, costs]);

  if (!fund) {
    return <div style={{ color: 'var(--color-red)', fontSize: '1.25rem', fontWeight: 700 }}>Fond ikke funnet</div>;
  }

  return (
    <div className="fund-view">
      <div className="fund-view__header">
        <h1 className="fund-view__title">{fund.name}</h1>
        <span className="fund-view__strategy">{fund.strategy === 'value_add' ? 'Value-Add' : 'Core'}</span>
        {fund.vintage && <span className="fund-view__vintage">Årgang {fund.vintage}</span>}
      </div>

      <ModuleTabs />
      <div className="fund-view__controls">
        <PeriodSelector />
      </div>

      <div className="dashboard__grid">
        <div className="dashboard__row-2-1">
          <NOIYieldCard kpis={kpis} />
          <PortfolioValueCard kpis={kpis} />
        </div>
        <div className="dashboard__row-3">
          <CashFlowCard kpis={kpis} />
          <WAULTPortfolioCard kpis={kpis} />
          <OccupancyPortfolioCard kpis={kpis} />
        </div>
        <div className="dashboard__row-3">
          <VacancyCostPortfolioCard kpis={kpis} />
          <ExpiryProfileCard kpis={kpis} />
          <CovenantCard />
        </div>
        <DiversificationCard kpis={kpis} />
        <TenantConcentrationCard kpis={kpis} />
      </div>

      <div className="fund-view__buildings">
        <h2 className="fund-view__section-title">BYGNINGER I FONDET</h2>
        <div className="fund-view__table-scroll">
          <table className="fund-view__table">
            <thead>
              <tr>
                <th>Bygning</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>m²</th>
                <th style={{ textAlign: 'right' }}>Utleiegrad</th>
                <th style={{ textAlign: 'right' }}>NOI</th>
                <th style={{ textAlign: 'right' }}>WAULT</th>
                <th style={{ textAlign: 'right' }}>Ledighetskostnad</th>
              </tr>
            </thead>
            <tbody>
              {buildingRows.map((row) => (
                <tr key={row.building.id} className="fund-view__table-row">
                  <td>
                    <Link to={`/bygg/${row.building.id}`} className="fund-view__building-link">
                      {row.building.name}
                    </Link>
                  </td>
                  <td>{row.building.buildingType}</td>
                  <td style={{ textAlign: 'right' }}>{formatM2(row.building.totalAreaM2)}</td>
                  <td style={{ textAlign: 'right' }}>{formatPercent(row.building.occupancyRate * 100)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNOK(row.noi)}</td>
                  <td style={{ textAlign: 'right' }}>{formatYears(row.wault)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {row.vacancyCost > 0 ? (
                      <span style={{ color: 'var(--color-red)' }}>{formatNOK(row.vacancyCost)}</span>
                    ) : (
                      <span style={{ color: 'var(--color-green)' }}>0 kr</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
