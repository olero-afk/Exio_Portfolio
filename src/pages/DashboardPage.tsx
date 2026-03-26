import { useState } from 'react';
import { usePortfolioKPI } from '../hooks/usePortfolioKPI.ts';
import { usePersona, EIER_BUILDING_IDS } from '../context/PersonaContext.tsx';
import { FilterBar } from '../components/dashboard/FilterBar.tsx';
import { ContextBar } from '../components/dashboard/ContextBar.tsx';
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
import { InsightsPanel } from '../components/dashboard/InsightsPanel.tsx';
import { SpørExio } from '../components/dashboard/SpørExio.tsx';
import { WelcomeWizard } from '../components/shared/WelcomeWizard.tsx';
import { usePersonaInsights } from '../hooks/usePersonaInsights.ts';
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
  const insights = usePersonaInsights(kpis);

  if (showWizard || !demoLoaded) {
    return <WelcomeWizard onLoadDemo={() => { setDemoLoaded(true); setShowWizard(false); }} />;
  }

  return (
    <div className="dashboard">
      {/* Zone 1 */}
      <SpørExio kpis={kpis} />

      {/* Zone 2 */}
      <div className="dashboard__zone2">
        <FilterBar />
        <ContextBar kpis={kpis} />
      </div>

      <AlertBanner />
      <InsightsPanel insights={insights} />

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
