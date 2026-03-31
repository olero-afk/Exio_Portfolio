import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioKPI } from '../hooks/usePortfolioKPI.ts';
import { usePersona, EIER_BUILDING_IDS } from '../context/PersonaContext.tsx';
import { usePersonaInsights } from '../hooks/usePersonaInsights.ts';
import { useOpportunityRisk } from '../hooks/useOpportunityRisk.ts';
import { FilterBar } from '../components/dashboard/FilterBar.tsx';
import { ContextBar } from '../components/dashboard/ContextBar.tsx';
import { SpørExio } from '../components/dashboard/SpørExio.tsx';
import { InsightCardGrid } from '../components/dashboard/InsightCardGrid.tsx';
import { WelcomeWizard } from '../components/shared/WelcomeWizard.tsx';
import { MaturityGauge } from '../components/shared/MaturityGauge.tsx';
import { usePortfolioMaturity } from '../hooks/useMaturity.ts';
import './DashboardPage.css';

export function DashboardPage() {
  const navigate = useNavigate();
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
  const { muligheter, risiko } = useOpportunityRisk(kpis);
  const maturity = usePortfolioMaturity();

  if (showWizard || !demoLoaded) {
    return <WelcomeWizard onLoadDemo={() => { setDemoLoaded(true); setShowWizard(false); }} />;
  }

  return (
    <div className="dashboard">
      <SpørExio kpis={kpis} />
      <div className="dashboard__zone2">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <FilterBar />
            <ContextBar kpis={kpis} />
          </div>
          <MaturityGauge
            percentage={maturity.averagePercentage}
            size={80}
            label="Innsiktsnivå"
            onClick={() => navigate('/innsiktsniva')}
          />
        </div>
      </div>
      <InsightCardGrid insights={insights} muligheter={muligheter} risiko={risiko} />
    </div>
  );
}
