import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';

export function BuildingDetailPage() {
  const { buildingId } = useParams();
  const { buildings } = usePortfolioContext();
  const building = buildings.find((b) => b.id === buildingId);

  if (!building) {
    return (
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-red)' }}>
          Bygning ikke funnet
        </h1>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--app-text)' }}>
        {building.name}
      </h1>
      <p style={{ color: 'var(--app-text-muted)', marginTop: 8 }}>
        {building.address.street}, {building.address.postalCode} {building.address.municipality}
      </p>
      <p style={{ color: 'var(--app-text-dim)', marginTop: 4, fontSize: '0.75rem' }}>
        Bygningsdetaljer — kommer snart
      </p>
    </div>
  );
}
