import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { BuildingTabs } from '../components/building/BuildingTabs.tsx';

interface BuildingTabPlaceholderProps {
  tabName: string;
}

export function BuildingTabPlaceholder({ tabName }: BuildingTabPlaceholderProps) {
  const { buildingId } = useParams();
  const { buildings } = usePortfolioContext();
  const building = buildings.find((b) => b.id === buildingId);

  if (!building) return null;

  return (
    <div className="building-detail">
      <div className="building-detail__header">
        <h1 className="building-detail__name">{building.name}</h1>
        <p className="building-detail__address">
          {building.address.street}, {building.address.postalCode} {building.address.municipality}
        </p>
      </div>
      <BuildingTabs />
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--app-text-dim)' }}>
        {tabName} — kommer snart
      </div>
    </div>
  );
}
