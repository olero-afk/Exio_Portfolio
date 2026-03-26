import { usePortfolioKPI } from '../hooks/usePortfolioKPI.ts';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { useFilterContext } from '../context/FilterContext.tsx';
import { FundFilter } from '../components/dashboard/FundFilter.tsx';
import { PeriodSelector } from '../components/dashboard/PeriodSelector.tsx';
import { formatNOK, formatPercent, formatYears, formatM2 } from '../utils/formatters.ts';
import './BoardReportPage.css';

export function BoardReportPage() {
  const kpis = usePortfolioKPI();
  const { companies, activeCompanyId, funds } = usePortfolioContext();
  const { selectedFundId } = useFilterContext();
  const company = companies.find((c) => c.id === activeCompanyId);
  const fund = selectedFundId ? funds.find((f) => f.id === selectedFundId) : null;
  const today = new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="board-report">
      <div className="board-report__toolbar no-print">
        <h1 className="board-report__page-title">Styrerapport</h1>
        <div className="board-report__toolbar-right">
          <FundFilter />
          <PeriodSelector />
          <button className="board-report__export-btn" onClick={() => window.print()}>
            Eksporter PDF
          </button>
        </div>
      </div>

      <div className="board-report__document">
        <header className="board-report__header">
          <h1 className="board-report__title">
            {fund ? `Fondsrapport — ${fund.name}` : 'Porteføljerapport'}
          </h1>
          <div className="board-report__meta">
            <span>{company?.name ?? 'Ukjent selskap'}</span>
            <span>{today}</span>
            <span>{kpis.buildingCount} bygninger</span>
          </div>
        </header>

        {/* Section 1: Portfolio Value */}
        <section className="board-report__section">
          <h2 className="board-report__section-title">Porteføljeverdier</h2>
          <div className="board-report__kpi-grid">
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">Total verdi</span>
              <span className="board-report__kpi-value">{formatNOK(kpis.totalPortfolioValue)}</span>
            </div>
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">Total NOI</span>
              <span className="board-report__kpi-value">{formatNOK(kpis.totalNOI)}</span>
            </div>
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">NOI-yield</span>
              <span className="board-report__kpi-value">{formatPercent(kpis.noiYield)}</span>
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
              <span className="board-report__kpi-label">Total m²</span>
              <span className="board-report__kpi-value">{formatM2(kpis.totalM2)}</span>
            </div>
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">NOI-margin</span>
              <span className="board-report__kpi-value">{formatPercent(kpis.noiMargin)}</span>
            </div>
            <div className="board-report__kpi">
              <span className="board-report__kpi-label">Inntekt i risiko (12 mnd)</span>
              <span className="board-report__kpi-value" style={{ color: kpis.incomeAtRisk > 0 ? '#facc15' : undefined }}>
                {formatNOK(kpis.incomeAtRisk)}
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: Building Overview */}
        <section className="board-report__section">
          <h2 className="board-report__section-title">Bygningsoversikt</h2>
          <table className="board-report__table">
            <thead>
              <tr>
                <th>Bygning</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>m²</th>
                <th style={{ textAlign: 'right' }}>Utleiegrad</th>
                <th style={{ textAlign: 'right' }}>Markedsverdi</th>
              </tr>
            </thead>
            <tbody>
              {kpis.filteredBuildings.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.buildingType}</td>
                  <td style={{ textAlign: 'right' }}>{formatM2(b.totalAreaM2)}</td>
                  <td style={{ textAlign: 'right' }}>{formatPercent(b.occupancyRate * 100)}</td>
                  <td style={{ textAlign: 'right' }}>{b.estimatedMarketValue ? formatNOK(b.estimatedMarketValue) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 3: Contract Expiry Profile */}
        <section className="board-report__section">
          <h2 className="board-report__section-title">Kontraktsutløpsprofil</h2>
          <p className="board-report__text">
            Porteføljens WAULT er {formatYears(kpis.portfolioWAULT)} (effektiv: {formatYears(kpis.effectiveWAULT)}).
          </p>
          <table className="board-report__table board-report__table--compact">
            <thead>
              <tr>
                <th>År</th>
                <th style={{ textAlign: 'right' }}>Utløpende leie</th>
                <th style={{ textAlign: 'right' }}>% av total</th>
                <th style={{ textAlign: 'right' }}>Kontrakter</th>
              </tr>
            </thead>
            <tbody>
              {kpis.expiryProfile.map((ep) => (
                <tr key={ep.year} style={ep.label === 'Y+1' ? { color: '#f87171', fontWeight: 600 } : undefined}>
                  <td>{ep.label} ({ep.year})</td>
                  <td style={{ textAlign: 'right' }}>{formatNOK(ep.expiringRent)}</td>
                  <td style={{ textAlign: 'right' }}>{formatPercent(ep.percentOfTotal)}</td>
                  <td style={{ textAlign: 'right' }}>{ep.contractCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 4: Top 10 Tenants */}
        <section className="board-report__section">
          <h2 className="board-report__section-title">Top 10 leietakere</h2>
          <table className="board-report__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Leietaker</th>
                <th style={{ textAlign: 'right' }}>Årlig leie</th>
                <th style={{ textAlign: 'right' }}>Andel</th>
                <th style={{ textAlign: 'right' }}>Bygg</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {kpis.topTenants.map((t, i) => (
                <tr key={t.tenantName} style={t.isBankrupt ? { color: '#f87171' } : undefined}>
                  <td>{i + 1}</td>
                  <td>{t.tenantName} {t.isBankrupt && '⚠ KONKURS'}</td>
                  <td style={{ textAlign: 'right' }}>{formatNOK(t.totalAnnualRent)}</td>
                  <td style={{ textAlign: 'right' }}>{formatPercent(t.percentOfPortfolio)}</td>
                  <td style={{ textAlign: 'right' }}>{t.buildingCount}</td>
                  <td>{t.isBankrupt ? 'Konkurs' : 'Aktiv'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="board-report__text" style={{ marginTop: 8 }}>
            Topp 10 dekker {formatPercent(kpis.topTenCoverage)} av total porteføljeleie.
          </p>
        </section>

        {/* Section 5: Diversification */}
        <section className="board-report__section">
          <h2 className="board-report__section-title">Diversifisering</h2>
          <div className="board-report__div-grid">
            <div>
              <h3 className="board-report__div-subtitle">Geografi</h3>
              {kpis.diversification.byGeography.map((s) => (
                <div key={s.label} className="board-report__div-row">
                  <span>{s.label}</span>
                  <span>{formatPercent(s.percent)}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="board-report__div-subtitle">Segment</h3>
              {kpis.diversification.byAssetType.map((s) => (
                <div key={s.label} className="board-report__div-row">
                  <span>{s.label}</span>
                  <span>{formatPercent(s.percent)}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="board-report__div-subtitle">Bransje</h3>
              {kpis.diversification.byTenantIndustry.slice(0, 8).map((s) => (
                <div key={s.label} className="board-report__div-row">
                  <span>{s.label}</span>
                  <span>{formatPercent(s.percent)}</span>
                </div>
              ))}
            </div>
          </div>
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
