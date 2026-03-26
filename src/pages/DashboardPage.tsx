import { useState } from 'react';
import { usePortfolioKPI } from '../hooks/usePortfolioKPI.ts';
import { usePersona, EIER_BUILDING_IDS } from '../context/PersonaContext.tsx';
import { FilterBar } from '../components/dashboard/FilterBar.tsx';
import { ContextBar } from '../components/dashboard/ContextBar.tsx';
import { SpørExio } from '../components/dashboard/SpørExio.tsx';
import { InsightCardGrid } from '../components/dashboard/InsightCardGrid.tsx';
import { WelcomeWizard } from '../components/shared/WelcomeWizard.tsx';
import { usePersonaInsights } from '../hooks/usePersonaInsights.ts';
import './DashboardPage.css';

export function DashboardPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(true);
  const { persona, clientBuildingIds } = usePersona();

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
      {/* Zone 1: Spør Exio */}
      <SpørExio kpis={kpis} />

      {/* Zone 2: Filters + Context Bar */}
      <div className="dashboard__zone2">
        <FilterBar />
        <ContextBar kpis={kpis} />
      </div>

      {/* Zone 3: 6 Insight Cards */}
      <InsightCardGrid insights={insights} />
    </div>
  );
}
