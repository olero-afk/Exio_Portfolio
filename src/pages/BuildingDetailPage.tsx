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

      {/* Placeholder: Bilder */}
      <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 8, padding: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--app-text-muted)', margin: 0 }}>Bilder</h3>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(254,208,146,0.15)', color: '#FED092', padding: '1px 5px', borderRadius: 3 }}>Kommer snart</span>
        </div>
        <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 8, padding: '24px 16px', textAlign: 'center', color: '#7a7a7a', fontSize: '0.8125rem' }}>
          Last opp bilder av bygget
        </div>
      </div>

      {/* Placeholder: Notater */}
      <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 8, padding: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--app-text-muted)', margin: 0 }}>Notater / Oppgaver</h3>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(254,208,146,0.15)', color: '#FED092', padding: '1px 5px', borderRadius: 3 }}>Kommer snart</span>
        </div>
        <textarea
          disabled
          placeholder="Skriv notater om bygget her..."
          style={{ width: '100%', height: 60, background: '#2a2a2a', color: '#7a7a7a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 12px', fontSize: '0.8125rem', resize: 'none' }}
        />
      </div>
    </div>
  );
}
