import { Link } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext.tsx';
import './ReportsPage.css';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  path: string;
}

const reportsByPersona: Record<string, ReportTemplate[]> = {
  eier: [
    {
      id: 'styrerapport',
      title: 'Styrerapport',
      description: 'Komplett porteføljerapport for styremøter med NOI, utleiegrad, WAULT og kontraktsutløp.',
      path: '/rapporter/styrerapport',
    },
  ],
  investor: [
    {
      id: 'investorrapport',
      title: 'Investorrapport',
      description: 'Porteføljeanalyse med yield, diversifisering og tenant-konsentrasjon for investorer og LPs.',
      path: '/rapporter/styrerapport',
    },
    {
      id: 'fondsrapport',
      title: 'Fondsrapport',
      description: 'Per-fond rapport med NOI, WAULT, utleiegrad og kontraktsutløpsprofil.',
      path: '/rapporter/styrerapport',
    },
  ],
  forvalter: [
    {
      id: 'kunderapport',
      title: 'Kunderapport',
      description: 'Rapport per klient med porteføljeoversikt, bygningstabell og nøkkeltall.',
      path: '/rapporter/styrerapport',
    },
  ],
};

export function ReportsPage() {
  const { persona } = usePersona();
  const reports = reportsByPersona[persona] ?? reportsByPersona.investor;

  return (
    <div className="reports-page">
      <h1 className="reports-page__title">Rapporter</h1>
      <div className="reports-page__grid">
        {reports.map((report) => (
          <Link key={report.id} to={report.path} className="reports-page__card">
            <h2 className="reports-page__card-title">{report.title}</h2>
            <p className="reports-page__card-desc">{report.description}</p>
            <span className="reports-page__card-action">Åpne rapport →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
