import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { BuildingTabs } from '../components/building/BuildingTabs.tsx';
import { CostSpreadsheet } from '../components/financial/CostSpreadsheet.tsx';
import './BuildingDetailPage.css';

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
      <CostSpreadsheet building={building} />

      {/* Placeholder: ERP-integrasjon */}
      <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 8, padding: 16, marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--app-text-muted)', margin: 0 }}>Koble til ERP</h3>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(254,208,146,0.15)', color: '#FED092', padding: '1px 5px', borderRadius: 3 }}>Kommer snart</span>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Tripletex', 'XLedger', 'PoGo', 'Fenistra', 'Fazile'].map((erp) => (
            <span key={erp} style={{ padding: '6px 14px', background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#7a7a7a', fontSize: '0.8125rem', fontWeight: 500 }}>
              {erp}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
