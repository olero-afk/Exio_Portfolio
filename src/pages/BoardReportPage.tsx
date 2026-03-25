import { useRef } from 'react';
import { useKPI } from '../hooks/useKPI.ts';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, formatYears, formatM2 } from '../utils/formatters.ts';
import './BoardReportPage.css';

export function BoardReportPage() {
  const kpis = useKPI();
  const { companies, activeCompanyId } = usePortfolioContext();
  const reportRef = useRef<HTMLDivElement>(null);
  const company = companies.find((c) => c.id === activeCompanyId);
  const today = new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' });

  function handlePrint() {
    window.print();
  }

  return (
    <div className="board-report">
      <div className="board-report__toolbar no-print">
        <h1 className="board-report__page-title">Styrerapport</h1>
        <button className="board-report__export-btn" onClick={handlePrint}>
          PDF-eksport
        </button>
      </div>

      <div className="board-report__document" ref={reportRef}>
        <header className="board-report__header">
          <h1 className="board-report__title">Porteføljerapport</h1>
          <div className="board-report__meta">
            <span>{company?.name ?? 'Ukjent selskap'}</span>
            <span>{today}</span>
          </div>
        </header>

        <section className="board-report__section">
          <h2 className="board-report__section-title">Nøkkeltall</h2>
          <div className="board-report__kpi-grid">
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">Total NOI</span>
              <span className="board-report__kpi-value">{formatNOK(kpis.totalNOI)}</span>
            </div>
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">Utleiegrad</span>
              <span className="board-report__kpi-value">{formatPercent(kpis.portfolioOccupancyRate * 100)}</span>
            </div>
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">WAULT</span>
              <span className="board-report__kpi-value">{formatYears(kpis.portfolioWAULT)}</span>
            </div>
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">Ledighetskostnad</span>
              <span className="board-report__kpi-value">{formatNOK(kpis.totalVacancyCost)}</span>
            </div>
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">Antall bygg</span>
              <span className="board-report__kpi-value">{kpis.buildingCount}</span>
            </div>
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">Total m²</span>
              <span className="board-report__kpi-value">{formatM2(kpis.totalM2)}</span>
            </div>
          </div>
        </section>

        <section className="board-report__section">
          <h2 className="board-report__section-title">Bygningsoversikt</h2>
          <table className="board-report__table">
            <thead>
              <tr>
                <th>Bygning</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>NOI</th>
                <th style={{ textAlign: 'right' }}>Utleiegrad</th>
                <th style={{ textAlign: 'right' }}>WAULT</th>
                <th style={{ textAlign: 'right' }}>Ledighetskostnad</th>
              </tr>
            </thead>
            <tbody>
              {kpis.buildingNOIs.map((row) => {
                const wault = kpis.buildingWAULTs.find((w) => w.building.id === row.building.id);
                const vacancy = kpis.buildingVacancyCosts.find((v) => v.building.id === row.building.id);
                return (
                  <tr key={row.building.id}>
                    <td>{row.building.name}</td>
                    <td>{row.building.buildingType}</td>
                    <td style={{ textAlign: 'right' }}>{formatNOK(row.noi)}</td>
                    <td style={{ textAlign: 'right' }}>{formatPercent(row.building.occupancyRate * 100)}</td>
                    <td style={{ textAlign: 'right' }}>{formatYears(wault?.wault ?? 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatNOK(vacancy?.vacancyCost ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="board-report__section">
          <h2 className="board-report__section-title">Kontraktsutløpsprofil</h2>
          <p className="board-report__text">
            Porteføljens WAULT er {formatYears(kpis.portfolioWAULT)}.
            {kpis.longestWAULT && ` Lengst kontraktslengde: ${kpis.longestWAULT.building.name} (${formatYears(kpis.longestWAULT.wault)}).`}
            {kpis.shortestWAULT && ` Kortest: ${kpis.shortestWAULT.building.name} (${formatYears(kpis.shortestWAULT.wault)}).`}
          </p>
        </section>

        <footer className="board-report__footer">
          <p>Generert av Exio Portfolio — {today}</p>
          <p className="board-report__disclaimer">
            Markedsreferanser basert på offentlige data (PlacePoint/SSB). Ikke finansiell rådgivning.
          </p>
        </footer>
      </div>
    </div>
  );
}
