import { useKPI } from '../hooks/useKPI.ts';
import { ModuleTabs } from '../components/dashboard/ModuleTabs.tsx';
import { BuildingFilter } from '../components/dashboard/BuildingFilter.tsx';
import { PeriodSelector } from '../components/dashboard/PeriodSelector.tsx';
import { NOICard } from '../components/dashboard/NOICard.tsx';
import { PortfolioSummaryCard } from '../components/dashboard/PortfolioSummaryCard.tsx';
import { OccupancyCard } from '../components/dashboard/OccupancyCard.tsx';
import { WAULTCard } from '../components/dashboard/WAULTCard.tsx';
import { VacancyCostCard } from '../components/dashboard/VacancyCostCard.tsx';
import { AlertBanner } from '../components/dashboard/AlertBanner.tsx';
import './DashboardPage.css';

export function DashboardPage() {
  const kpis = useKPI();

  return (
    <div className="dashboard">
      <AlertBanner />
      <ModuleTabs />

      <div className="dashboard__controls">
        <BuildingFilter />
        <PeriodSelector />
      </div>

      <div className="dashboard__row-top">
        <NOICard kpis={kpis} />
        <PortfolioSummaryCard kpis={kpis} />
      </div>

      <div className="dashboard__row-bottom">
        <OccupancyCard kpis={kpis} />
        <WAULTCard kpis={kpis} />
        <VacancyCostCard kpis={kpis} />
      </div>
    </div>
  );
}
