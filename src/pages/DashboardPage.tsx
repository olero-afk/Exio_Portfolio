import { useState } from 'react';
import { usePortfolioKPI } from '../hooks/usePortfolioKPI.ts';
import { usePersona, EIER_BUILDING_IDS } from '../context/PersonaContext.tsx';
import { ModuleTabs } from '../components/dashboard/ModuleTabs.tsx';
import { FundFilter } from '../components/dashboard/FundFilter.tsx';
import { ClientFilter } from '../components/dashboard/ClientFilter.tsx';
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
  const [demoLoaded, setDemoLoaded] = useState(true);
  const { persona, config, clientBuildingIds } = usePersona();

  const personaBuildingIds = persona === 'eier'
    ? EIER_BUILDING_IDS
    : persona === 'forvalter'
      ? clientBuildingIds
      : null;

  const kpis = usePortfolioKPI(personaBuildingIds);

  if (showWizard || !demoLoaded) {
    return <WelcomeWizard onLoadDemo={() => { setDemoLoaded(true); setShowWizard(false); }} />;
  }

  const heading = persona === 'eier'
    ? 'Min portefølje'
    : persona === 'forvalter'
      ? 'Forvaltningsoversikt'
      : 'Porteføljeoversikt';

  return (
    <div className="dashboard">
      <AlertBanner />
      <h1 className="dashboard__heading">{heading}</h1>
      <ModuleTabs />

      <div className="dashboard__controls">
        {config.showFundFilter && <FundFilter />}
        {config.showClientFilter && <ClientFilter />}
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
          {config.showCovenantWidget ? <CovenantCard /> : <div />}
        </div>

        <DiversificationCard kpis={kpis} />
        <TenantConcentrationCard kpis={kpis} />
        <ContractExpirySection />
      </div>
    </div>
  );
}
