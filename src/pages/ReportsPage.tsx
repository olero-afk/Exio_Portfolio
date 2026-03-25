import { Link } from 'react-router-dom';
import './ReportsPage.css';

const reports = [
  {
    id: 'styrerapport',
    title: 'Styrerapport',
    description: 'Komplett porteføljerapport for styremøter med NOI, utleiegrad, WAULT og kontraktsutløp.',
    path: '/rapporter/styrerapport',
  },
  {
    id: 'bankrapport',
    title: 'Bankrapport',
    description: 'Nøkkeltall og verdivurdering for bankrapportering.',
    path: '/rapporter/styrerapport',
  },
];

export function ReportsPage() {
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
