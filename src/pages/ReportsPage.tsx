import { Link } from 'react-router-dom';
import { usePersona, EIER_BUILDING_IDS } from '../context/PersonaContext.tsx';
import { useFilterContext } from '../context/FilterContext.tsx';
import { usePortfolioKPI } from '../hooks/usePortfolioKPI.ts';
import { formatNOK, formatM2, formatPercent, formatYears, formatNumber } from '../utils/formatters.ts';
import './ReportsPage.css';

const coreReports = [
  { id: 'portefoljeoversikt', icon: '📊', title: 'Porteføljeoversikt', description: 'Komplett byggoversikt med areal, status og nøkkeldata.', path: '/rapporter/portefoljeoversikt', sections: 6, unlocked: 4 },
  { id: 'noi', icon: '💰', title: 'NOI-analyse', description: 'Leieinntekter, kostnader og NOI per bygg og totalt.', path: '/rapporter/noi', sections: 6, unlocked: 4 },
  { id: 'kontraktsanalyse', icon: '📋', title: 'Kontraktsanalyse', description: 'WAULT, utløpsprofil og inntekt i risiko.', path: '/rapporter/kontraktsanalyse', sections: 6, unlocked: 4 },
  { id: 'ledighetsoversikt', icon: '🏢', title: 'Ledighetsoversikt', description: 'Ledighetskostnad i kroner og rangering per bygg.', path: '/rapporter/ledighetsoversikt', sections: 7, unlocked: 5 },
];

const otherReports = [
  { id: 'leietakeranalyse', icon: '👥', title: 'Leietakeranalyse', description: 'Top 10 leietakere, konsentrasjonsrisiko og bransjefordeling.', path: '/rapporter/leietakeranalyse' },
  { id: 'diversifisering', icon: '🌍', title: 'Diversifisering', description: 'Geografi, segment og bransjefordeling med datatabeller.', path: '/rapporter/diversifisering' },
  { id: 'styrerapport', icon: '📄', title: 'Styrerapport', description: 'Komplett rapport for styremøter. Optimalisert for utskrift.', path: '/rapporter/styrerapport' },
  { id: 'benchmark', icon: '📍', title: 'Markedsreferanse', description: 'Sammenlign leieinntekter mot PlacePoint markedsdata.', path: '/rapporter/benchmark' },
  { id: 'covenant', icon: '🔒', title: 'Covenant-status', description: 'LTV og DSCR. Planlagt Q4 2026.', path: '/rapporter/covenant' },
];

export function ReportsPage() {
  const { persona, clientBuildingIds } = usePersona();
  const { selectedBuildingId } = useFilterContext();

  let buildingIds: string[] | null = persona === 'eier'
    ? EIER_BUILDING_IDS
    : persona === 'forvalter'
      ? clientBuildingIds
      : null;

  if (selectedBuildingId) {
    buildingIds = [selectedBuildingId];
  }

  const kpis = usePortfolioKPI(buildingIds);

  const summaries: Record<string, string> = {
    portefoljeoversikt: `${formatNumber(kpis.buildingCount)} bygg · ${formatM2(kpis.totalRentableM2)}`,
    noi: `NOI: ${formatNOK(kpis.totalNOI)}`,
    kontraktsanalyse: `WAULT: ${formatYears(kpis.portfolioWAULT)} · ${formatNumber(kpis.expiryProfile.reduce((s, e) => s + e.contractCount, 0))} avtaler`,
    ledighetsoversikt: `${formatNOK(kpis.totalVacancyCost)} · ${formatPercent((1 - kpis.portfolioOccupancyRate) * 100)}`,
  };

  return (
    <div className="reports-page">
      <h1 className="reports-page__title">Rapporter</h1>
      <div className="reports-page__grid reports-page__grid--core">
        {coreReports.map((r) => (
          <Link key={r.id} to={r.path} className="reports-page__card reports-page__card--core">
            <span className="reports-page__card-icon">{r.icon}</span>
            <h2 className="reports-page__card-title">{r.title}</h2>
            <p className="reports-page__card-desc">{r.description}</p>
            {summaries[r.id] && (
              <p className="reports-page__card-summary">{summaries[r.id]}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              <span style={{ fontSize: '0.6875rem', color: '#7a7a7a' }}>
                {r.unlocked} av {r.sections} seksjoner tilgjengelig
              </span>
              <div style={{ height: 4, background: '#2a2a2a', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(r.unlocked / r.sections) * 100}%`, background: '#22d4e8', borderRadius: 2 }} />
              </div>
            </div>
            <span className="reports-page__card-action">Åpne →</span>
          </Link>
        ))}
      </div>
      <h2 className="reports-page__subtitle">Andre rapporter</h2>
      <div className="reports-page__grid">
        {otherReports.map((r) => (
          <Link key={r.id} to={r.path} className="reports-page__card">
            <span className="reports-page__card-icon">{r.icon}</span>
            <h2 className="reports-page__card-title">{r.title}</h2>
            <p className="reports-page__card-desc">{r.description}</p>
            <span className="reports-page__card-action">Åpne →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
