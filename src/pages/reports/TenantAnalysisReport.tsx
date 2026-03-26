import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, formatNumber } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './report-shared.css';

const COLORS = ['#22d4e8', '#FED092', '#4ade80', '#a78bfa', '#fb923c', '#38bdf8', '#e879f9', '#facc15', '#f87171', '#94a3b8'];

function SectionA({ kpis }: { kpis: PortfolioKPIs }) {
  const topTenant = kpis.topTenants[0];
  const showWarning = topTenant && topTenant.percentOfPortfolio > 15;

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '65%', distributed: true } },
    colors: kpis.topTenants.map((t) => t.isBankrupt ? '#f87171' : '#22d4e8'),
    xaxis: { labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: string) => formatNumber(Number(v) / 1e6, 1) + 'M' }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: '#9a9a9a', fontSize: '10px' }, maxWidth: 180 } },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `${formatNOK(v)} (${formatPercent(kpis.totalGrossRentalIncome > 0 ? (v / kpis.totalGrossRentalIncome) * 100 : 0)})` } },
    dataLabels: { enabled: true, formatter: (v: number) => formatPercent(kpis.totalGrossRentalIncome > 0 ? (v / kpis.totalGrossRentalIncome) * 100 : 0), style: { fontSize: '9px', colors: ['#e8e8e8'] }, offsetX: 6 },
    legend: { show: false },
  };
  const series = [{ name: 'Årlig leie', data: kpis.topTenants.map((t) => ({ x: t.tenantName, y: t.totalAnnualRent })) }];

  return (
    <div className="report-section">
      <h3 className="report-section__title">Top 10 Leietakere</h3>
      {showWarning && (
        <div className="report-banner--warning" style={{ marginBottom: 12 }}>
          Konsentrasjonsrisiko: {topTenant.tenantName} utgjør {formatPercent(topTenant.percentOfPortfolio)} av total leie
        </div>
      )}
      <ReactApexChart options={options} series={series} type="bar" height={kpis.topTenants.length * 38 + 30} />
    </div>
  );
}

function SectionB({ kpis }: { kpis: PortfolioKPIs }) {
  const top5 = kpis.topTenants.slice(0, 5).reduce((s, t) => s + t.percentOfPortfolio, 0);
  const donutLabels = [...kpis.topTenants.map((t) => t.tenantName), 'Øvrige'];
  const donutValues = [...kpis.topTenants.map((t) => t.percentOfPortfolio), Math.max(0, 100 - kpis.topTenCoverage)];

  const donutOpts: ApexOptions = {
    chart: { type: 'donut', background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: [...COLORS.slice(0, kpis.topTenants.length), '#5a5a5a'],
    labels: donutLabels,
    legend: { position: 'right', labels: { colors: '#7a7a7a' }, fontSize: '9px', markers: { size: 4 } },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '60%' } } },
    stroke: { width: 1, colors: ['#1e1e1e'] },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatPercent(v) } },
  };

  return (
    <div className="report-section">
      <h3 className="report-section__title">Konsentrasjon</h3>
      <div className="report-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 14 }}>
        <div className="report-metric">
          <span className="report-metric__label">Største leietaker</span>
          <span className={`report-metric__value ${kpis.topTenants[0]?.percentOfPortfolio > 15 ? 'report-metric__value--danger' : ''}`}>{formatPercent(kpis.topTenants[0]?.percentOfPortfolio ?? 0)}</span>
        </div>
        <div className="report-metric">
          <span className="report-metric__label">Topp 5 dekning</span>
          <span className="report-metric__value">{formatPercent(top5)}</span>
        </div>
        <div className="report-metric">
          <span className="report-metric__label">Topp 10 dekning</span>
          <span className="report-metric__value">{formatPercent(kpis.topTenCoverage)}</span>
        </div>
      </div>
      <ReactApexChart options={donutOpts} series={donutValues} type="donut" height={260} />
    </div>
  );
}

function SectionC({ kpis }: { kpis: PortfolioKPIs }) {
  const slices = kpis.diversification.byTenantIndustry;
  const donutOpts: ApexOptions = {
    chart: { type: 'donut', background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: COLORS.slice(0, slices.length),
    labels: slices.map((s) => s.label),
    legend: { position: 'bottom', labels: { colors: '#7a7a7a' }, fontSize: '9px', markers: { size: 4 } },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '60%' } } },
    stroke: { width: 1, colors: ['#1e1e1e'] },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatPercent(v) } },
  };

  return (
    <div className="report-section">
      <h3 className="report-section__title">Leietakere per bransje</h3>
      <ReactApexChart options={donutOpts} series={slices.map((s) => s.percent)} type="donut" height={220} />
      <table className="report-table" style={{ marginTop: 12 }}>
        <thead><tr><th>Bransje</th><th data-align="right">Årlig leie</th><th data-align="right">Andel</th></tr></thead>
        <tbody>
          {slices.map((s) => (
            <tr key={s.label}>
              <td>{s.label}</td>
              <td data-align="right">{formatNOK(s.value)}</td>
              <td data-align="right">{formatPercent(s.percent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionD({ kpis }: { kpis: PortfolioKPIs }) {
  const { contracts, buildings } = usePortfolioContext();

  const tenants = useMemo(() => {
    const active = contracts.filter((c) => (c.status === 'active' || c.status === 'expiring_soon') && kpis.filteredBuildings.some((b) => b.id === c.buildingId));
    const map = new Map<string, { name: string; orgNr?: string; industry?: string; buildingNames: Set<string>; m2: number; rent: number; bankrupt: boolean }>();
    for (const c of active) {
      const b = buildings.find((x) => x.id === c.buildingId);
      const existing = map.get(c.tenantName);
      if (existing) {
        existing.m2 += c.areaM2;
        existing.rent += c.annualRent;
        if (b) existing.buildingNames.add(b.name);
        if (c.tenantIsBankrupt) existing.bankrupt = true;
      } else {
        map.set(c.tenantName, { name: c.tenantName, orgNr: c.tenantOrgNr, industry: c.tenantIndustry, buildingNames: new Set(b ? [b.name] : []), m2: c.areaM2, rent: c.annualRent, bankrupt: c.tenantIsBankrupt });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.rent - a.rent);
  }, [contracts, buildings, kpis.filteredBuildings]);

  const totalRent = kpis.totalGrossRentalIncome;

  return (
    <div className="report-section">
      <h3 className="report-section__title">Alle leietakere</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th>Leietaker</th>
            <th>Org.nr.</th>
            <th>Bransje</th>
            <th>Bygg</th>
            <th data-align="right">m²</th>
            <th data-align="right">Årlig leie</th>
            <th data-align="right">Andel</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.name} className={t.bankrupt ? 'report-table__row--bankrupt' : ''}>
              <td>{t.name}{t.bankrupt && <span className="report-table__badge">KONKURS</span>}</td>
              <td>{t.orgNr ?? '—'}</td>
              <td>{t.industry ?? '—'}</td>
              <td>{Array.from(t.buildingNames).join(', ')}</td>
              <td data-align="right">{formatNumber(t.m2)}</td>
              <td data-align="right">{formatNOK(t.rent)}</td>
              <td data-align="right">{formatPercent(totalRent > 0 ? (t.rent / totalRent) * 100 : 0)}</td>
              <td>{t.bankrupt ? 'Konkurs' : 'Aktiv'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TenantAnalysisReport() {
  return (
    <ReportLayout title="Leietakeranalyse">
      {(kpis) => (
        <>
          <SectionA kpis={kpis} />
          <div className="report-grid-2">
            <SectionB kpis={kpis} />
            <SectionC kpis={kpis} />
          </div>
          <SectionD kpis={kpis} />
        </>
      )}
    </ReportLayout>
  );
}
