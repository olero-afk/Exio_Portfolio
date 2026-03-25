import { KPICard } from '../shared/KPICard.tsx';
import { BuildingLink } from '../shared/BuildingLink.tsx';
import { formatNOK } from '../../utils/formatters.ts';
import type { DashboardKPIs } from '../../hooks/useKPI.ts';
import './RankingList.css';

interface VacancyCostCardProps {
  kpis: DashboardKPIs;
}

export function VacancyCostCard({ kpis }: VacancyCostCardProps) {
  const { totalVacancyCost, buildingVacancyCosts } = kpis;

  const ranked = [...buildingVacancyCosts]
    .filter((b) => b.vacancyCost > 0)
    .sort((a, b) => b.vacancyCost - a.vacancyCost);

  return (
    <KPICard
      title="Ledighetskostnad"
      value={formatNOK(totalVacancyCost)}
      tooltip={{
        title: 'Ledighetskostnad',
        formula: 'Ledig m² × Markedsleie per m²',
        values: `Totalt: ${formatNOK(totalVacancyCost)}`,
        source: `${ranked.length} bygg med ledige arealer`,
      }}
    >
      {ranked.length > 0 && (
        <div className="ranking-list">
          <div className="ranking-list__section">
            {ranked.map((item) => (
              <BuildingLink
                key={item.building.id}
                buildingId={item.building.id}
                name={item.building.name}
                detail={formatNOK(item.vacancyCost)}
              />
            ))}
          </div>
        </div>
      )}
    </KPICard>
  );
}
