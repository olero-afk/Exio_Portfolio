import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { formatNOK, formatM2, formatPercent, formatNumber } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './report-shared.css';

function SectionA({ kpis }: { kpis: PortfolioKPIs }) {
  return (
    <div className="report-metrics">
      <div className="report-metric">
        <span className="report-metric__label">Total ledighetskostnad</span>
        <span className="report-metric__value report-metric__value--danger">{formatNOK(kpis.totalVacancyCost)}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Ledighetsgrad</span>
        <span className="report-metric__value">{formatPercent((1 - kpis.portfolioOccupancyRate) * 100)}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Ledig m²</span>
        <span className="report-metric__value">{formatM2(kpis.totalVacantM2)}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Bygg &gt;10% ledighet</span>
        <span className={`report-metric__value ${kpis.buildingsHighVacancy > 0 ? 'report-metric__value--warning' : 'report-metric__value--positive'}`}>{kpis.buildingsHighVacancy}</span>
      </div>
    </div>
  );
}

function SectionB({ kpis }: { kpis: PortfolioKPIs }) {
  const ranked = kpis.filteredBuildings
    .map((b) => ({ name: b.name, cost: (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0) }))
    .filter((r) => r.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: ranked.map((_, i) => i === 0 ? '#f87171' : '#fb923c'),
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '65%', distributed: true } },
    xaxis: { labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: string) => formatNumber(Number(v) / 1e6, 1) + 'M' }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: '#9a9a9a', fontSize: '10px' }, maxWidth: 180 } },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) } },
    dataLabels: { enabled: true, formatter: (v: number) => formatNOK(v), style: { fontSize: '9px', colors: ['#e8e8e8'] }, offsetX: 6 },
    legend: { show: false },
  };

  return (
    <div className="report-section">
      <h3 className="report-section__title">Ledighetskostnad per bygg</h3>
      {ranked.length > 0 ? (
        <ReactApexChart options={options} series={[{ name: 'Kostnad', data: ranked.map((r) => ({ x: r.name, y: r.cost })) }]} type="bar" height={ranked.length * 42 + 30} />
      ) : (
        <p style={{ color: 'var(--app-text-dim)', fontSize: 'var(--font-size-body)' }}>Ingen ledige arealer</p>
      )}
    </div>
  );
}

function SectionC({ kpis }: { kpis: PortfolioKPIs }) {
  const sorted = [...kpis.filteredBuildings].sort((a, b) => a.occupancyRate - b.occupancyRate);
  const marketAvg = 92;

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: sorted.map((b) => {
      const pct = b.occupancyRate * 100;
      if (pct >= 90) return '#4ade80';
      if (pct >= 75) return '#facc15';
      return '#f87171';
    }),
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '65%', distributed: true } },
    xaxis: { min: 0, max: 100, labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: string) => v + '%' }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: '#9a9a9a', fontSize: '10px' }, maxWidth: 180 } },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    annotations: { xaxis: [{ x: marketAvg, borderColor: '#7a7a7a', strokeDashArray: 4, label: { text: `Markedssnitt ${marketAvg}%`, style: { color: '#7a7a7a', background: 'transparent', fontSize: '8px' } } }] },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatPercent(v) } },
    dataLabels: { enabled: true, formatter: (v: number) => formatPercent(v), style: { fontSize: '9px', colors: ['#e8e8e8'] }, offsetX: 6 },
    legend: { show: false },
  };

  return (
    <div className="report-section">
      <h3 className="report-section__title">Utleiegrad per bygg</h3>
      <ReactApexChart options={options} series={[{ name: 'Utleiegrad', data: sorted.map((b) => ({ x: b.name, y: Math.round(b.occupancyRate * 100 * 100) / 100 })) }]} type="bar" height={sorted.length * 42 + 30} />
    </div>
  );
}

function SectionD({ kpis }: { kpis: PortfolioKPIs }) {
  const data = kpis.filteredBuildings
    .map((b) => ({
      building: b,
      vacantM2: b.totalRentableM2 - b.committedM2,
      vacancyCost: (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0),
    }))
    .sort((a, b) => b.vacancyCost - a.vacancyCost);

  return (
    <div className="report-section">
      <h3 className="report-section__title">Detaljert ledighetstabell</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th>Bygg</th>
            <th data-align="right">Total m²</th>
            <th data-align="right">Utleid m²</th>
            <th data-align="right">Ledig m²</th>
            <th data-align="right">Utleiegrad</th>
            <th data-align="right">Markedsleie/m²</th>
            <th data-align="right">Ledighetskostnad</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.building.id}>
              <td><Link to={`/bygg/${r.building.id}`} className="report-table__link">{r.building.name}</Link></td>
              <td data-align="right">{formatM2(r.building.totalRentableM2)}</td>
              <td data-align="right">{formatM2(r.building.committedM2)}</td>
              <td data-align="right">{formatM2(r.vacantM2)}</td>
              <td data-align="right">{formatPercent(r.building.occupancyRate * 100)}</td>
              <td data-align="right">{r.building.marketRentPerM2 ? formatNOK(r.building.marketRentPerM2) : '—'}</td>
              <td data-align="right" style={{ color: r.vacancyCost > 0 ? 'var(--color-red)' : 'var(--color-green)' }}>{formatNOK(r.vacancyCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VacancyReport() {
  return (
    <ReportLayout title="Ledighetsoversikt">
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
