import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { BuildingTabs } from '../components/building/BuildingTabs.tsx';
import { ContractTable } from '../components/contracts/ContractTable.tsx';
import { WAULTWidget } from '../components/contracts/WAULTWidget.tsx';
import { ExpiryChart } from '../components/contracts/ExpiryChart.tsx';

export function BuildingContractsPage() {
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <WAULTWidget buildingId={buildingId} />
        <ExpiryChart buildingId={buildingId} />
      </div>
      <ContractTable buildingId={buildingId} />
    </div>
  );
}
