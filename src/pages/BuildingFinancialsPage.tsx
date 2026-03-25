import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { BuildingTabs } from '../components/building/BuildingTabs.tsx';
import { NOIBreakdown } from '../components/financial/NOIBreakdown.tsx';
import { CostTable } from '../components/financial/CostTable.tsx';

export function BuildingFinancialsPage() {
  const { buildingId } = useParams();
  const { buildings } = usePortfolioContext();
  const building = buildings.find((b) => b.id === buildingId);

  if (!building || !buildingId) return null;

  return (
    <div className="building-detail">
      <div className="building-detail__header">
        <h1 className="building-detail__name">{building.name}</h1>
        <p className="building-detail__address">
          {building.address.street}, {building.address.postalCode} {building.address.municipality}
        </p>
      </div>
      <BuildingTabs />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <NOIBreakdown buildingId={buildingId} />
        <CostTable buildingId={buildingId} />
      </div>
    </div>
  );
}
