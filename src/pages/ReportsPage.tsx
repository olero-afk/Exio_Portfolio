import { Link } from 'react-router-dom';
import './ReportsPage.css';

const reports = [
  { id: 'portefoljeoversikt', icon: '📊', title: 'Porteføljeoversikt', description: 'Porteføljeverdier, NOI, yield og kontantstrøm.', path: '/rapporter/portefoljeoversikt' },
  { id: 'kontraktsanalyse', icon: '📋', title: 'Kontraktsanalyse', description: 'WAULT, kontraktsutløpsprofil og utløpende kontrakter.', path: '/rapporter/kontraktsanalyse' },
  { id: 'leietakeranalyse', icon: '👥', title: 'Leietakeranalyse', description: 'Top 10 leietakere, konsentrasjonsrisiko og bransjefordeling.', path: '/rapporter/leietakeranalyse' },
  { id: 'ledighetsoversikt', icon: '🏢', title: 'Ledighetsoversikt', description: 'Ledighetskostnad per bygg med ranking og detaljer.', path: '/rapporter/ledighetsoversikt' },
  { id: 'diversifisering', icon: '🌍', title: 'Diversifisering', description: 'Geografi, segment og bransjefordeling med datatabeller.', path: '/rapporter/diversifisering' },
  { id: 'styrerapport', icon: '📄', title: 'Styrerapport', description: 'Komplett rapport for styremøter. Optimalisert for utskrift.', path: '/rapporter/styrerapport' },
  { id: 'covenant', icon: '🔒', title: 'Covenant-status', description: 'LTV og DSCR. Planlagt Q4 2026.', path: '/rapporter/covenant' },
];

export function ReportsPage() {
  return (
    <div className="reports-page">
      <h1 className="reports-page__title">Rapporter</h1>
      <div className="reports-page__grid">
        {reports.map((r) => (
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
