import { KPICard } from '../shared/KPICard.tsx';
import { BuildingLink } from '../shared/BuildingLink.tsx';
import { formatYears } from '../../utils/formatters.ts';
import type { DashboardKPIs } from '../../hooks/useKPI.ts';
import './RankingList.css';

interface WAULTCardProps {
  kpis: DashboardKPIs;
}

export function WAULTCard({ kpis }: WAULTCardProps) {
  const { portfolioWAULT, longestWAULT, shortestWAULT, buildingWAULTs } = kpis;

  return (
    <KPICard
      title="WAULT"
      value={formatYears(portfolioWAULT)}
      subtitle="Vektet gj.snittlig kontraktslengde"
      tooltip={{
        title: 'WAULT (Vektet gj.snittlig kontraktslengde)',
        formula: 'Σ(gjenstående tid × årlig leie) / Σ(årlig leie)',
        values: `Portefølje: ${formatYears(portfolioWAULT)}`,
        source: `${buildingWAULTs.length} bygg, aktive kontrakter`,
      }}
    >
      <div className="ranking-list">
        {longestWAULT && (
          <div className="ranking-list__section">
            <span className="ranking-list__heading">Lengst</span>
            <BuildingLink
              buildingId={longestWAULT.building.id}
              name={longestWAULT.building.name}
              detail={formatYears(longestWAULT.wault)}
            />
          </div>
        )}
        {shortestWAULT && shortestWAULT.building.id !== longestWAULT?.building.id && (
          <div className="ranking-list__section">
            <span className="ranking-list__heading">Kortest</span>
            <BuildingLink
              buildingId={shortestWAULT.building.id}
              name={shortestWAULT.building.name}
              detail={formatYears(shortestWAULT.wault)}
            />
          </div>
        )}
      </div>
    </KPICard>
  );
}
