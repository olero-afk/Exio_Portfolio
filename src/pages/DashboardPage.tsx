import { useKPI } from '../hooks/useKPI.ts';
import { ModuleTabs } from '../components/dashboard/ModuleTabs.tsx';
import { BuildingFilter } from '../components/dashboard/BuildingFilter.tsx';
import { PeriodSelector } from '../components/dashboard/PeriodSelector.tsx';
import { NOICard } from '../components/dashboard/NOICard.tsx';
import { OccupancyCard } from '../components/dashboard/OccupancyCard.tsx';
import { WAULTCard } from '../components/dashboard/WAULTCard.tsx';
import { VacancyCostCard } from '../components/dashboard/VacancyCostCard.tsx';
import { BuildingCountCard } from '../components/dashboard/BuildingCountCard.tsx';
import { TotalAreaCard } from '../components/dashboard/TotalAreaCard.tsx';
import './DashboardPage.css';

export function DashboardPage() {
  const kpis = useKPI();

  return (
    <div className="dashboard">
      <ModuleTabs />

      <div className="dashboard__controls">
        <BuildingFilter />
        <PeriodSelector />
      </div>

      <div className="dashboard__grid">
        <NOICard kpis={kpis} />
        <OccupancyCard kpis={kpis} />
        <WAULTCard kpis={kpis} />
        <VacancyCostCard kpis={kpis} />
        <BuildingCountCard kpis={kpis} />
        <TotalAreaCard kpis={kpis} />
      </div>
    </div>
  );
}
