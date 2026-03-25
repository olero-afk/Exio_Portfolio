import { KPICard } from '../shared/KPICard.tsx';
import type { DashboardKPIs } from '../../hooks/useKPI.ts';

interface BuildingCountCardProps {
  kpis: DashboardKPIs;
}

export function BuildingCountCard({ kpis }: BuildingCountCardProps) {
  return (
    <KPICard
      title="Antall bygg"
      value={String(kpis.buildingCount)}
      tooltip={{
        title: 'Antall bygg',
        formula: 'Antall aktive (ikke arkiverte) bygninger',
        values: `${kpis.buildingCount} bygninger`,
        source: 'Porteføljedata',
      }}
    />
  );
}
