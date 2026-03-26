import { useState } from 'react';
import { usePortfolioKPI } from '../hooks/usePortfolioKPI.ts';
import { ModuleTabs } from '../components/dashboard/ModuleTabs.tsx';
import { FundFilter } from '../components/dashboard/FundFilter.tsx';
import { PeriodSelector } from '../components/dashboard/PeriodSelector.tsx';
import { AlertBanner } from '../components/dashboard/AlertBanner.tsx';
import { ContractExpirySection } from '../components/dashboard/ContractExpirySection.tsx';
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
import { WelcomeWizard } from '../components/shared/WelcomeWizard.tsx';
import './DashboardPage.css';

export function DashboardPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(true); // Demo data already loaded by default
  const kpis = usePortfolioKPI();

  // Show wizard if no data (simulated by toggling demoLoaded)
  if (showWizard || !demoLoaded) {
    return (
      <WelcomeWizard onLoadDemo={() => { setDemoLoaded(true); setShowWizard(false); }} />
    );
  }

  return (
    <div className="dashboard">
      <AlertBanner />
      <ModuleTabs />

      <div className="dashboard__controls">
        <FundFilter />
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
        <ContractExpirySection />
      </div>
    </div>
  );
}
