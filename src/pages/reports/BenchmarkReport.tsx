import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { formatNOK, formatPercent, formatNumber } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './report-shared.css';

export function BenchmarkReport() {
  return (
    <ReportLayout title="Markedsreferanse (PlacePoint)">
      {(kpis) => <BenchmarkContent kpis={kpis} />}
    </ReportLayout>
  );
}

function BenchmarkContent({ kpis }: { kpis: PortfolioKPIs }) {
  const rows = kpis.filteredBuildings
    .filter((b) => b.priceStatsPerM2 || b.marketRentPerM2)
    .map((b) => {
      const pp = b.priceStatsPerM2 ?? 0;
      const actual = b.marketRentPerM2 ?? 0;
      const delta = actual - pp;
      const deltaPct = pp > 0 ? (delta / pp) * 100 : 0;
      return { building: b, pp, actual, delta, deltaPct, isAbove: delta >= 0 };
    })
    .sort((a, b) => a.delta - b.delta); // worst underperformers first

  const avgPP = rows.length > 0 ? rows.reduce((s, r) => s + r.pp, 0) / rows.length : 0;
  const avgActual = rows.length > 0 ? rows.reduce((s, r) => s + r.actual, 0) / rows.length : 0;
  const portfolioDeviation = avgPP > 0 ? ((avgActual - avgPP) / avgPP) * 100 : 0;
  const underCount = rows.filter((r) => !r.isAbove).length;
  const worstBuilding = rows[0];

  const totalUplift = rows
    .filter((r) => !r.isAbove)
    .reduce((s, r) => {
      const gap = Math.abs(r.delta);
      return s + gap * r.building.totalRentableM2;
    }, 0);

  // Chart
  const chartOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: ['#7a7a7a', '#22d4e8'],
    plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '55%' } },
    xaxis: { labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: string) => formatNumber(Number(v), 0) + ' kr' }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: '#9a9a9a', fontSize: '10px' }, maxWidth: 180 } },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) + '/m²' } },
    legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#7a7a7a' }, fontSize: '9px', markers: { size: 4 } },
    dataLabels: { enabled: false },
  };

  const chartSeries = [
    { name: 'PlacePoint', data: rows.map((r) => ({ x: r.building.name, y: r.pp })) },
    { name: 'Faktisk', data: rows.map((r) => ({ x: r.building.name, y: r.actual })) },
  ];

  return (
    <>
      {/* Section A — Summary */}
      <div className="report-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="report-metric">
          <span className="report-metric__label">Gj.snitt PlacePoint</span>
          <span className="report-metric__value">{formatNOK(avgPP)}/m²</span>
        </div>
        <div className="report-metric">
          <span className="report-metric__label">Gj.snitt faktisk leie</span>
          <span className="report-metric__value">{formatNOK(avgActual)}/m²</span>
        </div>
        <div className="report-metric">
          <span className="report-metric__label">Portefølje-avvik</span>
          <span className={`report-metric__value ${portfolioDeviation >= 0 ? 'report-metric__value--positive' : 'report-metric__value--danger'}`}>
            {portfolioDeviation >= 0 ? '+' : ''}{formatPercent(portfolioDeviation)}
          </span>
        </div>
      </div>

      {/* Section B — Per-building table */}
      <div className="report-section">
        <h3 className="report-section__title">Benchmark per bygg</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Bygg</th>
              <th>Kommune</th>
              <th>Type</th>
              <th data-align="right">PlacePoint kr/m²</th>
              <th data-align="right">Faktisk kr/m²</th>
              <th data-align="right">Avvik kr/m²</th>
              <th data-align="right">Avvik %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.building.id}>
                <td><Link to={`/bygg/${r.building.id}`} className="report-table__link">{r.building.name}</Link></td>
                <td>{r.building.address.municipality}</td>
                <td>{r.building.buildingType}</td>
                <td data-align="right">{formatNOK(r.pp)}</td>
                <td data-align="right">{formatNOK(r.actual)}</td>
                <td data-align="right" style={{ color: r.isAbove ? 'var(--color-green)' : 'var(--color-red)' }}>
                  {r.isAbove ? '+' : ''}{formatNOK(r.delta)}
                </td>
                <td data-align="right" style={{ color: r.isAbove ? 'var(--color-green)' : 'var(--color-red)' }}>
                  {r.isAbove ? '+' : ''}{formatPercent(r.deltaPct)}
                </td>
                <td>
                  <span className={`report-table__badge`} style={{
                    color: r.isAbove ? 'var(--color-green)' : 'var(--color-red)',
                    backgroundColor: r.isAbove ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                  }}>
                    {r.isAbove ? 'Over marked' : 'Under marked'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section C — Chart */}
      <div className="report-section">
        <h3 className="report-section__title">Benchmark sammenligning</h3>
        {rows.length > 0 && (
          <ReactApexChart options={chartOpts} series={chartSeries} type="bar" height={rows.length * 44 + 50} />
        )}
      </div>

      {/* Section D — Insight */}
      <div className="report-section">
        <h3 className="report-section__title">Innsikt</h3>
        <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--app-text-secondary)', lineHeight: 1.6 }}>
          {underCount > 0
            ? `${underCount} av ${rows.length} bygg ligger under PlacePoint-referansen. Størst avvik: ${worstBuilding?.building.name} med ${formatNOK(Math.abs(worstBuilding?.delta ?? 0))}/m² under markedsreferanse.`
            : `Alle ${rows.length} bygg ligger over eller på PlacePoint-referansen — sterk markedsposisjon.`
          }
        </p>
        {totalUplift > 0 && (
          <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-green)', fontWeight: 600, marginTop: 8 }}>
            Samlet oppside ved markedstilpasning: +{formatNOK(totalUplift)}/år
          </p>
        )}
        <p style={{ fontSize: '0.625rem', color: 'var(--app-text-faint)', fontStyle: 'italic', marginTop: 12 }}>
          Markedsreferanse basert på offentlige data (PlacePoint/SSB). Ikke finansiell rådgivning.
        </p>
      </div>
    </>
  );
}
