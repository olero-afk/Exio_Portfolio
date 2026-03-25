import { KPICard } from '../shared/KPICard.tsx';
import { BuildingLink } from '../shared/BuildingLink.tsx';
import { formatPercent, formatM2 } from '../../utils/formatters.ts';
import type { DashboardKPIs } from '../../hooks/useKPI.ts';
import './RankingList.css';

interface OccupancyCardProps {
  kpis: DashboardKPIs;
}

export function OccupancyCard({ kpis }: OccupancyCardProps) {
  const { portfolioOccupancyRate, totalRentableM2, top3Highest, top3Lowest } = kpis;

  return (
    <KPICard
      title="Utleiegrad"
      value={formatPercent(portfolioOccupancyRate * 100)}
      subtitle={`av totalt ${formatM2(totalRentableM2)} ekslusivt areal`}
      tooltip={{
        title: 'Utleiegrad',
        formula: 'Utleid m² / Totalt ekslusivt areal × 100%',
        values: `${formatM2(kpis.totalCommittedM2)} / ${formatM2(totalRentableM2)} = ${formatPercent(portfolioOccupancyRate * 100)}`,
        source: 'Aktive kontrakter + arealenheter',
      }}
    >
      <div className="ranking-list">
        <div className="ranking-list__section">
          <span className="ranking-list__heading">Top 3 høyeste</span>
          {top3Highest.map((item) => (
            <BuildingLink
              key={item.building.id}
              buildingId={item.building.id}
              name={item.building.name}
              detail={formatPercent(item.occupancyRate * 100)}
            />
          ))}
        </div>
        <div className="ranking-list__section">
          <span className="ranking-list__heading">Top 3 laveste</span>
          {top3Lowest.map((item) => (
            <BuildingLink
              key={item.building.id}
              buildingId={item.building.id}
              name={item.building.name}
              detail={formatPercent(item.occupancyRate * 100)}
            />
          ))}
        </div>
      </div>
    </KPICard>
  );
}
