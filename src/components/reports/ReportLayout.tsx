import { Link } from 'react-router-dom';
import { usePersona, EIER_BUILDING_IDS } from '../../context/PersonaContext.tsx';
import { useFilterContext } from '../../context/FilterContext.tsx';
import { usePortfolioKPI, type PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import { PeriodSelector } from '../dashboard/PeriodSelector.tsx';
import './ReportLayout.css';

interface ReportLayoutProps {
  title: string;
  children: (kpis: PortfolioKPIs) => React.ReactNode;
}

export function ReportLayout({ title, children }: ReportLayoutProps) {
  const { persona, clientBuildingIds } = usePersona();
  const { selectedBuildingId, selectedFundId } = useFilterContext();

  // Start with persona-level scope
  let buildingIds: string[] | null = persona === 'eier'
    ? EIER_BUILDING_IDS
    : persona === 'forvalter'
      ? clientBuildingIds
      : null;

  // Sidebar building selection narrows to one building
  if (selectedBuildingId) {
    buildingIds = [selectedBuildingId];
  }

  const kpis = usePortfolioKPI(buildingIds);

  // Scope label
  let scopeLabel = '';
  if (selectedBuildingId) {
    scopeLabel = kpis.filteredBuildings[0]?.name ?? '';
  } else if (selectedFundId) {
    scopeLabel = kpis.fundValues.find((f) => f.fund.id === selectedFundId)?.fund.name ?? '';
  }

  return (
    <div className="report-layout">
      <div className="report-layout__header">
        <Link to="/rapporter" className="report-layout__back">← Rapporter</Link>
        <h1 className="report-layout__title">
          {title}
          {scopeLabel && <span className="report-layout__scope"> — {scopeLabel}</span>}
        </h1>
      </div>
      <div className="report-layout__controls">
        <PeriodSelector />
      </div>
      <div className="report-layout__content">
        {children(kpis)}
      </div>
    </div>
  );
}
