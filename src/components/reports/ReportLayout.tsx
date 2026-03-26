import { Link } from 'react-router-dom';
import { usePersona, EIER_BUILDING_IDS } from '../../context/PersonaContext.tsx';
import { usePortfolioKPI, type PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import { FundFilter } from '../dashboard/FundFilter.tsx';
import { ClientFilter } from '../dashboard/ClientFilter.tsx';
import { PeriodSelector } from '../dashboard/PeriodSelector.tsx';
import './ReportLayout.css';

interface ReportLayoutProps {
  title: string;
  children: (kpis: PortfolioKPIs) => React.ReactNode;
}

export function ReportLayout({ title, children }: ReportLayoutProps) {
  const { persona, config, clientBuildingIds } = usePersona();

  const personaBuildingIds = persona === 'eier'
    ? EIER_BUILDING_IDS
    : persona === 'forvalter'
      ? clientBuildingIds
      : null;

  const kpis = usePortfolioKPI(personaBuildingIds);

  return (
    <div className="report-layout">
      <div className="report-layout__header">
        <Link to="/rapporter" className="report-layout__back">← Rapporter</Link>
        <h1 className="report-layout__title">{title}</h1>
      </div>
      <div className="report-layout__controls">
        {config.showFundFilter && <FundFilter />}
        {config.showClientFilter && <ClientFilter />}
        <PeriodSelector />
      </div>
      <div className="report-layout__content">
        {children(kpis)}
      </div>
    </div>
  );
}
