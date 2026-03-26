import { useEffect } from 'react';
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
import { formatM2, formatPercent, formatNOK } from '../utils/formatters.ts';
import './FundViewPage.css';

export function FundViewPage() {
  const { fondId } = useParams();
  const { funds } = usePortfolioContext();
  const { setSelectedFundId } = useFilterContext();
  const fund = funds.find((f) => f.id === fondId);

  useEffect(() => {
    if (fondId) setSelectedFundId(fondId);
    return () => setSelectedFundId(null);
  }, [fondId, setSelectedFundId]);

  const kpis = usePortfolioKPI();

  if (!fund) {
    return <div style={{ color: 'var(--color-red)', fontSize: '1.25rem', fontWeight: 700 }}>Fond ikke funnet</div>;
  }

  return (
    <div className="fund-view">
      <div className="fund-view__header">
        <h1 className="fund-view__title">{fund.name}</h1>
        <span className="fund-view__strategy">{fund.strategy === 'value_add' ? 'Value-Add' : 'Core'}</span>
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
        <table className="fund-view__table">
          <thead>
            <tr>
              <th>Bygning</th>
              <th>Type</th>
              <th>Kommune</th>
              <th style={{ textAlign: 'right' }}>Areal</th>
              <th style={{ textAlign: 'right' }}>Utleiegrad</th>
              <th style={{ textAlign: 'right' }}>Markedsverdi</th>
            </tr>
          </thead>
          <tbody>
            {kpis.filteredBuildings.map((b) => (
              <tr key={b.id}>
                <td>
                  <Link to={`/bygg/${b.id}`} className="fund-view__building-link">{b.name}</Link>
                </td>
                <td>{b.buildingType}</td>
                <td>{b.address.municipality}</td>
                <td style={{ textAlign: 'right' }}>{formatM2(b.totalAreaM2)}</td>
                <td style={{ textAlign: 'right' }}>{formatPercent(b.occupancyRate * 100)}</td>
                <td style={{ textAlign: 'right' }}>{b.estimatedMarketValue ? formatNOK(b.estimatedMarketValue) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
