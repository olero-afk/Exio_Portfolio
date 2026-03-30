import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { formatNOK, formatM2, formatPercent, formatNumber } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './report-shared.css';

function SectionA({ kpis }: { kpis: PortfolioKPIs }) {
  const vacancyRate = (1 - kpis.portfolioOccupancyRate) * 100;
  return (
    <div className="report-metrics">
      <div className="report-metric">
        <span className="report-metric__label">Ledig areal</span>
        <span className="report-metric__value">{formatM2(kpis.totalVacantM2)}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Ledighetsrate</span>
        <span className={`report-metric__value ${vacancyRate > 15 ? 'report-metric__value--danger' : vacancyRate > 5 ? 'report-metric__value--warning' : 'report-metric__value--positive'}`}>
          {formatPercent(vacancyRate)}
        </span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Ledighetskostnad</span>
        <span className="report-metric__value report-metric__value--danger">{formatNOK(kpis.totalVacancyCost)}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Bygg &gt;10% ledig</span>
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

type SortKey = 'name' | 'totalM2' | 'committedM2' | 'vacantM2' | 'vacancyRate' | 'marketRent' | 'vacancyCost';

function SectionD({ kpis }: { kpis: PortfolioKPIs }) {
  const [sortKey, setSortKey] = useState<SortKey>('vacancyCost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const data = kpis.filteredBuildings.map((b) => {
    const vacantM2 = b.totalRentableM2 - b.committedM2;
    return {
      building: b,
      vacantM2,
      vacancyRate: b.totalRentableM2 > 0 ? (vacantM2 / b.totalRentableM2) * 100 : 0,
      vacancyCost: vacantM2 * (b.marketRentPerM2 ?? 0),
    };
  });

  const sorted = [...data].sort((a, b) => {
    let av: number | string = 0;
    let bv: number | string = 0;
    switch (sortKey) {
      case 'name': av = a.building.name; bv = b.building.name; break;
      case 'totalM2': av = a.building.totalRentableM2; bv = b.building.totalRentableM2; break;
      case 'committedM2': av = a.building.committedM2; bv = b.building.committedM2; break;
      case 'vacantM2': av = a.vacantM2; bv = b.vacantM2; break;
      case 'vacancyRate': av = a.vacancyRate; bv = b.vacancyRate; break;
      case 'marketRent': av = a.building.marketRentPerM2 ?? 0; bv = b.building.marketRentPerM2 ?? 0; break;
      case 'vacancyCost': av = a.vacancyCost; bv = b.vacancyCost; break;
    }
    const cmp = typeof av === 'string' ? av.localeCompare(bv as string, 'nb') : (av as number) - (bv as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) { setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(key); setSortDir(key === 'name' ? 'asc' : 'desc'); }
  };

  const arrow = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
  const activeStyle = (key: SortKey) => sortKey === key ? { color: '#FED092' } : undefined;

  const totals = data.reduce((acc, r) => ({
    totalM2: acc.totalM2 + r.building.totalRentableM2,
    committedM2: acc.committedM2 + r.building.committedM2,
    vacantM2: acc.vacantM2 + r.vacantM2,
    vacancyCost: acc.vacancyCost + r.vacancyCost,
  }), { totalM2: 0, committedM2: 0, vacantM2: 0, vacancyCost: 0 });
  const totalVacancyRate = totals.totalM2 > 0 ? (totals.vacantM2 / totals.totalM2) * 100 : 0;

  const vacancyColor = (rate: number) => {
    if (rate < 5) return 'var(--color-green)';
    if (rate <= 15) return '#facc15';
    return 'var(--color-red)';
  };

  return (
    <div className="report-section">
      <h3 className="report-section__title">Detaljert ledighetstabell</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort('name')} style={activeStyle('name')}>Bygg{arrow('name')}</th>
            <th data-align="right" onClick={() => toggleSort('totalM2')} style={activeStyle('totalM2')}>Total m²{arrow('totalM2')}</th>
            <th data-align="right" onClick={() => toggleSort('committedM2')} style={activeStyle('committedM2')}>Utleid m²{arrow('committedM2')}</th>
            <th data-align="right" onClick={() => toggleSort('vacantM2')} style={activeStyle('vacantM2')}>Ledig m²{arrow('vacantM2')}</th>
            <th data-align="right" onClick={() => toggleSort('vacancyRate')} style={activeStyle('vacancyRate')}>Ledighetsrate{arrow('vacancyRate')}</th>
            <th data-align="right" onClick={() => toggleSort('marketRent')} style={activeStyle('marketRent')}>Markedsleie/m²{arrow('marketRent')}</th>
            <th data-align="right" onClick={() => toggleSort('vacancyCost')} style={activeStyle('vacancyCost')}>Ledighetskostnad{arrow('vacancyCost')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.building.id}>
              <td><Link to={`/bygg/${r.building.id}`} className="report-table__link">{r.building.name}</Link></td>
              <td data-align="right">{formatM2(r.building.totalRentableM2)}</td>
              <td data-align="right">{formatM2(r.building.committedM2)}</td>
              <td data-align="right">{formatM2(r.vacantM2)}</td>
              <td data-align="right" style={{ color: vacancyColor(r.vacancyRate) }}>{formatPercent(r.vacancyRate)}</td>
              <td data-align="right">{r.building.marketRentPerM2 ? formatNOK(r.building.marketRentPerM2) : '—'}</td>
              <td data-align="right" style={{ color: r.vacancyCost > 0 ? 'var(--color-red)' : 'var(--color-green)' }}>{formatNOK(r.vacancyCost)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 700, borderTop: '2px solid var(--app-border-mid)' }}>
            <td>Totalt</td>
            <td data-align="right">{formatM2(totals.totalM2)}</td>
            <td data-align="right">{formatM2(totals.committedM2)}</td>
            <td data-align="right">{formatM2(totals.vacantM2)}</td>
            <td data-align="right" style={{ color: vacancyColor(totalVacancyRate) }}>{formatPercent(totalVacancyRate)}</td>
            <td data-align="right">—</td>
            <td data-align="right" style={{ color: 'var(--color-red)' }}>{formatNOK(totals.vacancyCost)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function SectionE({ kpis }: { kpis: PortfolioKPIs }) {
  const byType = new Map<string, { vacantM2: number; totalM2: number }>();
  for (const b of kpis.filteredBuildings) {
    const vacantM2 = b.totalRentableM2 - b.committedM2;
    if (vacantM2 <= 0) continue;
    const existing = byType.get(b.buildingType) ?? { vacantM2: 0, totalM2: 0 };
    existing.vacantM2 += vacantM2;
    existing.totalM2 += b.totalRentableM2;
    byType.set(b.buildingType, existing);
  }

  const entries = [...byType.entries()].sort((a, b) => b[1].vacantM2 - a[1].vacantM2);

  if (entries.length === 0) return null;

  return (
    <div className="report-section">
      <h3 className="report-section__title">Ledighet etter bygningstype</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 32px' }}>
        {entries.map(([type, data]) => (
          <span key={type} style={{ color: 'var(--app-text-secondary)', fontSize: 'var(--font-size-body)' }}>
            <strong style={{ color: 'var(--app-text)' }}>{type}:</strong>{' '}
            {formatM2(data.vacantM2)} ledig
          </span>
        ))}
      </div>
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
          <SectionE kpis={kpis} />
        </>
      )}
    </ReportLayout>
  );
}
