import { KPICard } from '../shared/KPICard.tsx';
import { formatM2 } from '../../utils/formatters.ts';
import type { DashboardKPIs } from '../../hooks/useKPI.ts';

interface TotalAreaCardProps {
  kpis: DashboardKPIs;
}

export function TotalAreaCard({ kpis }: TotalAreaCardProps) {
  return (
    <KPICard
      title="Total m²"
      value={formatM2(kpis.totalM2)}
      tooltip={{
        title: 'Total m²',
        formula: 'Sum av alle bygningers totalareal',
        values: formatM2(kpis.totalM2),
        source: `${kpis.buildingCount} bygninger`,
      }}
    />
  );
}
