import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { BuildingTabs } from '../components/building/BuildingTabs.tsx';
import { AreaCards } from '../components/building/AreaCards.tsx';
import { BuildingKPIs } from '../components/building/BuildingKPIs.tsx';
import { BuildingInfo } from '../components/building/BuildingInfo.tsx';
import { MarketReference } from '../components/building/MarketReference.tsx';
import './BuildingDetailPage.css';

export function BuildingDetailPage() {
  const { buildingId } = useParams();
  const { buildings } = usePortfolioContext();
  const building = buildings.find((b) => b.id === buildingId);

  if (!building) {
    return (
      <div className="building-detail__not-found">
        <h1>Bygning ikke funnet</h1>
      </div>
    );
  }

  return (
    <div className="building-detail">
      <div className="building-detail__header">
        <h1 className="building-detail__name">{building.name}</h1>
        <p className="building-detail__address">
          {building.address.street}, {building.address.postalCode} {building.address.municipality}
        </p>
      </div>
      <BuildingTabs />
      <AreaCards building={building} />
      <BuildingKPIs building={building} />
      <BuildingInfo building={building} />
      <MarketReference building={building} />
    </div>
  );
}
