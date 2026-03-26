import { Link } from 'react-router-dom';
import './CovenantReport.css';

export function CovenantReport() {
  return (
    <div className="covenant-report">
      <div className="covenant-report__header">
        <Link to="/rapporter" className="covenant-report__back">← Rapporter</Link>
        <h1 className="covenant-report__title">Covenant-status — Gjeldsoppfølging</h1>
        <p className="covenant-report__subtitle">Overvåk LTV, DSCR og covenant-betingelser mot bankavtaler</p>
      </div>

      <div className="covenant-report__cards">
        <div className="covenant-report__card">
          <h2 className="covenant-report__card-title">LTV</h2>
          <p className="covenant-report__card-full">Loan-to-Value</p>
          <div className="covenant-report__gauge">
            <svg viewBox="0 0 120 70" className="covenant-report__gauge-svg">
              <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="var(--app-surface-raised)" strokeWidth="10" strokeLinecap="round" />
              <path d="M 10 65 A 50 50 0 0 1 60 15" fill="none" stroke="var(--app-text-faint)" strokeWidth="10" strokeLinecap="round" opacity="0.2" />
            </svg>
            <span className="covenant-report__gauge-label">—%</span>
          </div>
          <p className="covenant-report__card-desc">Beregnes automatisk fra porteføljeverdi og registrert gjeld</p>
          <span className="covenant-report__badge">Kommer Q4 2026</span>
        </div>

        <div className="covenant-report__card">
          <h2 className="covenant-report__card-title">DSCR</h2>
          <p className="covenant-report__card-full">Debt Service Coverage Ratio</p>
          <div className="covenant-report__gauge">
            <svg viewBox="0 0 120 70" className="covenant-report__gauge-svg">
              <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="var(--app-surface-raised)" strokeWidth="10" strokeLinecap="round" />
              <path d="M 10 65 A 50 50 0 0 1 60 15" fill="none" stroke="var(--app-text-faint)" strokeWidth="10" strokeLinecap="round" opacity="0.2" />
            </svg>
            <span className="covenant-report__gauge-label">—x</span>
          </div>
          <p className="covenant-report__card-desc">Beregnes fra NOI og gjeldsservice per bygg</p>
          <span className="covenant-report__badge">Kommer Q4 2026</span>
        </div>
      </div>

      <div className="covenant-report__roadmap">
        <h3 className="covenant-report__roadmap-title">Hva vil dette inkludere?</h3>
        <ul className="covenant-report__features">
          <li>
            <span className="covenant-report__feature-icon">📊</span>
            <span>LTV per bygg og portefølje — automatisk fra verdivurdering og gjeldsregistrering</span>
          </li>
          <li>
            <span className="covenant-report__feature-icon">📈</span>
            <span>DSCR-tracking mot bankens terskelverdier</span>
          </li>
          <li>
            <span className="covenant-report__feature-icon">🔔</span>
            <span>Varsling ved brudd på covenant-betingelser</span>
          </li>
          <li>
            <span className="covenant-report__feature-icon">⚙️</span>
            <span>Sensitivitetsanalyse: rente, ledighet, KPI-regulering</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
