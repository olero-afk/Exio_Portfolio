import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { usePortfolioKPI } from '../hooks/usePortfolioKPI.ts';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { useFilterContext } from '../context/FilterContext.tsx';
import { usePersona, EIER_BUILDING_IDS } from '../context/PersonaContext.tsx';
import { FundFilter } from '../components/dashboard/FundFilter.tsx';
import { PeriodSelector } from '../components/dashboard/PeriodSelector.tsx';
import { formatNOK, formatPercent, formatYears, formatM2, formatNumber } from '../utils/formatters.ts';
import './BoardReportPage.css';

const DONUT_COLORS = ['#22d4e8', '#FED092', '#4ade80', '#a78bfa', '#fb923c', '#38bdf8', '#e879f9'];

export function BoardReportPage() {
  const { persona, clientBuildingIds } = usePersona();
  const personaBuildingIds = persona === 'eier' ? EIER_BUILDING_IDS : persona === 'forvalter' ? clientBuildingIds : null;
  const kpis = usePortfolioKPI(personaBuildingIds);
  const { companies, activeCompanyId, contracts, costs, funds } = usePortfolioContext();
  const { selectedFundId, effectiveDateRange } = useFilterContext();
  const company = companies.find((c) => c.id === activeCompanyId);
  const fund = selectedFundId ? funds.find((f) => f.id === selectedFundId) : null;
  const today = new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' });

  const buildingRows = useMemo(() => {
    return kpis.filteredBuildings.map((b) => {
      const active = contracts.filter((c) => c.buildingId === b.id && (c.status === 'active' || c.status === 'expiring_soon'));
      const income = active.reduce((s, c) => s + c.annualRent, 0);
      const bc = costs.filter((c) => c.buildingId === b.id);
      const ms = new Set(bc.map((c) => `${c.year}-${c.month}`)).size;
      const totalCost = bc.reduce((s, c) => s + c.amount, 0);
      const annualized = ms > 0 ? (totalCost / ms) * 12 : 0;
      const noi = income - annualized;
      const noiPerM2 = b.totalRentableM2 > 0 ? noi / b.totalRentableM2 : 0;
      const totalRent = active.reduce((s, c) => s + c.annualRent, 0);
      const wault = totalRent > 0 ? active.reduce((sum, c) => sum + Math.max(0, c.remainingTermYears) * c.annualRent, 0) / totalRent : 0;
      const vacancyCost = (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0);
      return { building: b, noi, noiPerM2, wault, vacancyCost };
    });
  }, [kpis.filteredBuildings, contracts, costs]);

  const totals = useMemo(() => ({
    m2: buildingRows.reduce((s, r) => s + r.building.totalAreaM2, 0),
    noi: buildingRows.reduce((s, r) => s + r.noi, 0),
    vacancyCost: buildingRows.reduce((s, r) => s + r.vacancyCost, 0),
  }), [buildingRows]);

  const expiryOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: kpis.expiryProfile.map((_, i) => i === 0 ? '#f87171' : '#22d4e8'),
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 4, distributed: true } },
    xaxis: { categories: kpis.expiryProfile.map((e) => e.label), labels: { style: { colors: '#7a7a7a', fontSize: '10px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: number) => formatNumber(v / 1e6, 1) + 'M' } },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) } },
    legend: { show: false },
    dataLabels: { enabled: false },
  };

  function miniDonut(slices: { label: string; percent: number }[]) {
    const display = slices.length > 6 ? [...slices.slice(0, 5), { label: 'Øvrige', percent: slices.slice(5).reduce((s, x) => s + x.percent, 0) }] : slices;
    const opts: ApexOptions = {
      chart: { type: 'donut', background: 'transparent', fontFamily: 'Inter, sans-serif' },
      theme: { mode: 'dark' },
      colors: DONUT_COLORS.slice(0, display.length),
      labels: display.map((s) => s.label),
      legend: { position: 'bottom', labels: { colors: '#7a7a7a' }, fontSize: '8px', markers: { size: 3 }, itemMargin: { horizontal: 4, vertical: 1 } },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '55%' } } },
      stroke: { width: 1, colors: ['#1e1e1e'] },
      tooltip: { theme: 'dark', y: { formatter: (v: number) => formatPercent(v) } },
    };
    return <ReactApexChart options={opts} series={display.map((s) => s.percent)} type="donut" height={180} />;
  }

  return (
    <div className="board-report">
      <div className="board-report__toolbar no-print">
        <h1 className="board-report__page-title">Styrerapport</h1>
        <div className="board-report__toolbar-right">
          <FundFilter />
          <PeriodSelector />
          <button className="board-report__export-btn" onClick={() => window.print()}>Eksporter PDF</button>
        </div>
      </div>

      <div className="board-report__document">
        <header className="board-report__header">
          <div className="board-report__logo">exio</div>
          <h1 className="board-report__title">Styrerapport — {fund ? fund.name : 'Porteføljeoversikt'}</h1>
          <div className="board-report__meta">
            <span>{company?.name ?? 'Ukjent selskap'}</span>
            <span>Periode: {effectiveDateRange.startDate} — {effectiveDateRange.endDate}</span>
            <span>Generert: {today}</span>
          </div>
        </header>

        <section className="board-report__section">
          <h2 className="board-report__section-title">Sammendrag</h2>
          <div className="board-report__kpi-grid">
            <div className="board-report__kpi"><span className="board-report__kpi-label">Porteføljeverdi</span><span className="board-report__kpi-value">{formatNOK(kpis.totalPortfolioValue)}</span></div>
            <div className="board-report__kpi"><span className="board-report__kpi-label">Total NOI</span><span className="board-report__kpi-value">{formatNOK(kpis.totalNOI)}</span></div>
            <div className="board-report__kpi"><span className="board-report__kpi-label">NOI-yield</span><span className="board-report__kpi-value">{formatPercent(kpis.noiYield)}</span></div>
            <div className="board-report__kpi"><span className="board-report__kpi-label">Utleiegrad</span><span className="board-report__kpi-value">{formatPercent(kpis.portfolioOccupancyRate * 100)}</span></div>
            <div className="board-report__kpi"><span className="board-report__kpi-label">WAULT</span><span className="board-report__kpi-value">{formatYears(kpis.portfolioWAULT)}</span></div>
            <div className="board-report__kpi"><span className="board-report__kpi-label">Ledighetskostnad</span><span className="board-report__kpi-value">{formatNOK(kpis.totalVacancyCost)}</span></div>
          </div>
        </section>

        <section className="board-report__section board-report__page-break">
          <h2 className="board-report__section-title">Bygningsoversikt</h2>
          <table className="board-report__table">
            <thead><tr><th>Bygg</th><th>Type</th><th style={{ textAlign: 'right' }}>m²</th><th style={{ textAlign: 'right' }}>Utleiegrad</th><th style={{ textAlign: 'right' }}>NOI</th><th style={{ textAlign: 'right' }}>NOI/m²</th><th style={{ textAlign: 'right' }}>WAULT</th><th style={{ textAlign: 'right' }}>Ledighetskost.</th></tr></thead>
            <tbody>
              {buildingRows.map((r) => (
                <tr key={r.building.id}>
                  <td>{r.building.name}</td><td>{r.building.buildingType}</td>
                  <td style={{ textAlign: 'right' }}>{formatM2(r.building.totalAreaM2)}</td>
                  <td style={{ textAlign: 'right' }}>{formatPercent(r.building.occupancyRate * 100)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNOK(r.noi)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNOK(r.noiPerM2)}</td>
                  <td style={{ textAlign: 'right' }}>{formatYears(r.wault)}</td>
                  <td style={{ textAlign: 'right', color: r.vacancyCost > 0 ? '#f87171' : undefined }}>{formatNOK(r.vacancyCost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="board-report__table-total">
              <td><strong>TOTALT</strong></td><td />
              <td style={{ textAlign: 'right' }}><strong>{formatM2(totals.m2)}</strong></td>
              <td style={{ textAlign: 'right' }}><strong>{formatPercent(kpis.portfolioOccupancyRate * 100)}</strong></td>
              <td style={{ textAlign: 'right' }}><strong>{formatNOK(totals.noi)}</strong></td>
              <td /><td style={{ textAlign: 'right' }}><strong>{formatYears(kpis.portfolioWAULT)}</strong></td>
              <td style={{ textAlign: 'right' }}><strong>{formatNOK(totals.vacancyCost)}</strong></td>
            </tr></tfoot>
          </table>
        </section>

        <section className="board-report__section">
          <h2 className="board-report__section-title">Kontraktsutløpsprofil</h2>
          <ReactApexChart options={expiryOpts} series={[{ name: 'Utløpende leie', data: kpis.expiryProfile.map((e) => Math.round(e.expiringRent)) }]} type="bar" height={200} />
          <table className="board-report__table board-report__table--compact" style={{ marginTop: 12 }}>
            <thead><tr><th>År</th><th style={{ textAlign: 'right' }}>Kontrakter</th><th style={{ textAlign: 'right' }}>Utløpende leie</th><th style={{ textAlign: 'right' }}>% av total</th></tr></thead>
            <tbody>
              {kpis.expiryProfile.map((ep) => (
                <tr key={ep.year} style={ep.label === 'Y+1' ? { color: '#f87171', fontWeight: 600 } : undefined}>
                  <td>{ep.label} ({ep.year})</td><td style={{ textAlign: 'right' }}>{ep.contractCount}</td>
                  <td style={{ textAlign: 'right' }}>{formatNOK(ep.expiringRent)}</td><td style={{ textAlign: 'right' }}>{formatPercent(ep.percentOfTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="board-report__section board-report__page-break">
          <h2 className="board-report__section-title">Top 5 leietakere</h2>
          <table className="board-report__table">
            <thead><tr><th>#</th><th>Leietaker</th><th style={{ textAlign: 'right' }}>Årlig leie</th><th style={{ textAlign: 'right' }}>Andel</th><th>Status</th></tr></thead>
            <tbody>
              {kpis.topTenants.slice(0, 5).map((t, i) => (
                <tr key={t.tenantName} style={t.isBankrupt ? { color: '#f87171' } : undefined}>
                  <td>{i + 1}</td><td>{t.tenantName}{t.isBankrupt && ' ⚠ KONKURS'}</td>
                  <td style={{ textAlign: 'right' }}>{formatNOK(t.totalAnnualRent)}</td>
                  <td style={{ textAlign: 'right' }}>{formatPercent(t.percentOfPortfolio)}</td>
                  <td>{t.isBankrupt ? 'Konkurs' : 'Aktiv'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="board-report__section">
          <h2 className="board-report__section-title">Diversifisering</h2>
          <div className="board-report__div-grid">
            <div><h3 className="board-report__div-subtitle">Geografi</h3>{miniDonut(kpis.diversification.byGeography)}</div>
            <div><h3 className="board-report__div-subtitle">Segment</h3>{miniDonut(kpis.diversification.byAssetType)}</div>
            <div><h3 className="board-report__div-subtitle">Bransje</h3>{miniDonut(kpis.diversification.byTenantIndustry)}</div>
          </div>
        </section>

        <footer className="board-report__footer">
          <p>Generert av Exio Portfolio — {today}</p>
          <p className="board-report__disclaimer">Markedsreferanser basert på offentlige data (PlacePoint/SSB). Ikke finansiell rådgivning.</p>
        </footer>
      </div>
    </div>
  );
}
