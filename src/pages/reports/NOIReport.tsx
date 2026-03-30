import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, formatNumber } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './report-shared.css';

/* ------------------------------------------------------------------ */
/*  SectionA — Top KPI Summary Bar                                    */
/* ------------------------------------------------------------------ */

function SectionA({ kpis }: { kpis: PortfolioKPIs }) {
  const noiPerM2 = kpis.totalRentableM2 > 0 ? kpis.totalNOI / kpis.totalRentableM2 : 0;

  return (
    <div className="report-metrics">
      <div className="report-metric">
        <span className="report-metric__label">Leieinntekter</span>
        <span className="report-metric__value">{formatNOK(kpis.totalGrossRentalIncome)}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Driftskostnader</span>
        <span className="report-metric__value report-metric__value--danger">{formatNOK(kpis.totalOperatingExpenses)}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">NOI</span>
        <span className={`report-metric__value ${kpis.totalNOI > 0 ? 'report-metric__value--positive' : ''}`}>{formatNOK(kpis.totalNOI)}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">NOI per m²</span>
        <span className="report-metric__value">{formatNOK(noiPerM2)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Per-building data helper types                                     */
/* ------------------------------------------------------------------ */

interface BuildingNOI {
  id: string;
  name: string;
  totalRentableM2: number;
  income: number;
  expenses: number;
  noi: number;
  noiPerM2: number;
  felleskostPct: number;
}

type SortKey = 'name' | 'income' | 'expenses' | 'noi' | 'noiPerM2' | 'felleskostPct';
type SortDir = 'asc' | 'desc';

/* ------------------------------------------------------------------ */
/*  useBuildingNOI — shared between SectionB and SectionC              */
/* ------------------------------------------------------------------ */

function useBuildingNOI(kpis: PortfolioKPIs): BuildingNOI[] {
  const { contracts, costs } = usePortfolioContext();

  return useMemo(() => {
    return kpis.filteredBuildings.map((b) => {
      const income = contracts
        .filter((c) => c.buildingId === b.id && (c.status === 'active' || c.status === 'expiring_soon'))
        .reduce((sum, c) => sum + c.annualRent, 0);

      const expenses = costs
        .filter((c) => c.buildingId === b.id)
        .reduce((sum, c) => sum + c.amount, 0);

      const noi = income - expenses;
      const noiPerM2 = b.totalRentableM2 > 0 ? noi / b.totalRentableM2 : 0;
      const felleskostPct = income > 0 ? (expenses / income) * 100 : 0;

      return {
        id: b.id,
        name: b.name,
        totalRentableM2: b.totalRentableM2,
        income,
        expenses,
        noi,
        noiPerM2,
        felleskostPct,
      };
    });
  }, [kpis.filteredBuildings, contracts, costs]);
}

/* ------------------------------------------------------------------ */
/*  SectionB — NOI per Building Table                                  */
/* ------------------------------------------------------------------ */

function SectionB({ kpis }: { kpis: PortfolioKPIs }) {
  const data = useBuildingNOI(kpis);
  const [sortKey, setSortKey] = useState<SortKey>('noi');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    const arr = [...data];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'nb') * dir;
      return (a[sortKey] - b[sortKey]) * dir;
    });
    return arr;
  }, [data, sortKey, sortDir]);

  const totals = useMemo(() => {
    const totalIncome = data.reduce((s, d) => s + d.income, 0);
    const totalExpenses = data.reduce((s, d) => s + d.expenses, 0);
    const totalNoi = totalIncome - totalExpenses;
    const totalM2 = data.reduce((s, d) => s + d.totalRentableM2, 0);
    return {
      income: totalIncome,
      expenses: totalExpenses,
      noi: totalNoi,
      noiPerM2: totalM2 > 0 ? totalNoi / totalM2 : 0,
      felleskostPct: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0,
    };
  }, [data]);

  const arrow = sortDir === 'asc' ? ' ▲' : ' ▼';
  const activeStyle = { color: '#FED092' };

  const cols: { key: SortKey; label: string; align?: 'right' }[] = [
    { key: 'name', label: 'Bygg' },
    { key: 'income', label: 'Leieinntekter', align: 'right' },
    { key: 'expenses', label: 'Driftskostnader', align: 'right' },
    { key: 'noi', label: 'NOI', align: 'right' },
    { key: 'noiPerM2', label: 'NOI/m²', align: 'right' },
    { key: 'felleskostPct', label: 'Felleskost %', align: 'right' },
  ];

  return (
    <div className="report-section">
      <h3 className="report-section__title">NOI per bygg</h3>
      <table className="report-table">
        <thead>
          <tr>
            {cols.map((col) => (
              <th
                key={col.key}
                data-align={col.align}
                style={sortKey === col.key ? activeStyle : undefined}
                onClick={() => handleSort(col.key)}
              >
                {col.label}{sortKey === col.key ? arrow : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id}>
              <td>
                <Link to={`/bygg/${row.id}`} className="report-table__link">{row.name}</Link>
              </td>
              <td data-align="right">{formatNOK(row.income)}</td>
              <td data-align="right">{formatNOK(row.expenses)}</td>
              <td data-align="right" style={{ color: row.noi > 0 ? 'var(--color-green)' : 'var(--color-red)' }}>{formatNOK(row.noi)}</td>
              <td data-align="right">{formatNOK(row.noiPerM2)}</td>
              <td data-align="right">{formatPercent(row.felleskostPct)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 700 }}>
            <td>Totalt</td>
            <td data-align="right">{formatNOK(totals.income)}</td>
            <td data-align="right">{formatNOK(totals.expenses)}</td>
            <td data-align="right" style={{ color: totals.noi > 0 ? 'var(--color-green)' : 'var(--color-red)' }}>{formatNOK(totals.noi)}</td>
            <td data-align="right">{formatNOK(totals.noiPerM2)}</td>
            <td data-align="right">{formatPercent(totals.felleskostPct)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionC — NOI Bar Chart (horizontal grouped)                      */
/* ------------------------------------------------------------------ */

function SectionC({ kpis }: { kpis: PortfolioKPIs }) {
  const buildingData = useBuildingNOI(kpis);

  const chartData = useMemo(
    () => [...buildingData].sort((a, b) => b.noi - a.noi),
    [buildingData],
  );

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
      stacked: false,
    },
    theme: { mode: 'dark' },
    colors: ['#22d4e8', 'rgba(248,113,113,0.6)'],
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4, barHeight: '70%' },
    },
    xaxis: {
      labels: {
        style: { colors: '#7a7a7a', fontSize: '9px' },
        formatter: (v: string) => formatNumber(Number(v) / 1e6, 1) + 'M',
      },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#9a9a9a', fontSize: '10px' }, maxWidth: 180 },
    },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) } },
    legend: { labels: { colors: '#9a9a9a' }, fontSize: '11px' },
    dataLabels: { enabled: false },
  };

  const series = [
    { name: 'Leieinntekter', data: chartData.map((d) => ({ x: d.name, y: d.income })) },
    { name: 'Driftskostnader', data: chartData.map((d) => ({ x: d.name, y: d.expenses })) },
  ];

  return (
    <div className="report-section">
      <h3 className="report-section__title">Inntekter vs. kostnader per bygg</h3>
      {chartData.length > 0 ? (
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={chartData.length * 56 + 50}
        />
      ) : (
        <p style={{ color: 'var(--app-text-dim)', fontSize: 'var(--font-size-body)' }}>Ingen data</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionD — Cost Structure Breakdown                                */
/* ------------------------------------------------------------------ */

const CATEGORY_LABELS: Record<string, string> = {
  drift: 'Drift',
  vedlikehold: 'Vedlikehold',
  forsikring: 'Forsikring',
  administrasjon: 'Administrasjon',
  eiendomsskatt: 'Eiendomsskatt',
};

const CATEGORY_ORDER = ['drift', 'vedlikehold', 'forsikring', 'administrasjon', 'eiendomsskatt'];

function SectionD({ kpis }: { kpis: PortfolioKPIs }) {
  const { costs } = usePortfolioContext();

  const buildingIds = useMemo(
    () => new Set(kpis.filteredBuildings.map((b) => b.id)),
    [kpis.filteredBuildings],
  );

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const cat of CATEGORY_ORDER) totals[cat] = 0;

    for (const c of costs) {
      if (!buildingIds.has(c.buildingId)) continue;
      if (c.category in totals) {
        totals[c.category] += c.amount;
      }
    }

    const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
    const totalM2 = kpis.filteredBuildings.reduce((s, b) => s + b.totalRentableM2, 0);

    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      amount: totals[cat],
      share: grandTotal > 0 ? (totals[cat] / grandTotal) * 100 : 0,
      perM2: totalM2 > 0 ? totals[cat] / totalM2 : 0,
    }));
  }, [costs, buildingIds, kpis.filteredBuildings]);

  const grandTotal = categoryData.reduce((s, d) => s + d.amount, 0);
  const totalM2 = kpis.filteredBuildings.reduce((s, b) => s + b.totalRentableM2, 0);

  const donutOptions: ApexOptions = {
    chart: { type: 'donut', background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: ['#22d4e8', '#FED092', '#4ade80', '#a78bfa', '#fb923c'],
    labels: categoryData.map((d) => d.label),
    legend: { position: 'bottom', labels: { colors: '#9a9a9a' }, fontSize: '11px' },
    dataLabels: { enabled: true, style: { fontSize: '10px' } },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) } },
    plotOptions: { pie: { donut: { size: '60%' } } },
    stroke: { show: false },
  };

  return (
    <div className="report-section">
      <h3 className="report-section__title">Kostnadsfordeling</h3>
      <div className="report-grid-2">
        <table className="report-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th data-align="right">Beløp</th>
              <th data-align="right">Andel</th>
              <th data-align="right">Per m²</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map((row) => (
              <tr key={row.category}>
                <td>{row.label}</td>
                <td data-align="right">{formatNOK(row.amount)}</td>
                <td data-align="right">{formatPercent(row.share)}</td>
                <td data-align="right">{formatNOK(row.perM2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700 }}>
              <td>Totalt</td>
              <td data-align="right">{formatNOK(grandTotal)}</td>
              <td data-align="right">{formatPercent(100)}</td>
              <td data-align="right">{formatNOK(totalM2 > 0 ? grandTotal / totalM2 : 0)}</td>
            </tr>
          </tfoot>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {grandTotal > 0 ? (
            <ReactApexChart
              options={donutOptions}
              series={categoryData.map((d) => d.amount)}
              type="donut"
              height={320}
            />
          ) : (
            <p style={{ color: 'var(--app-text-dim)', fontSize: 'var(--font-size-body)' }}>Ingen kostnader registrert</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NOIReport — main export                                            */
/* ------------------------------------------------------------------ */

export function NOIReport() {
  return (
    <ReportLayout title="NOI-analyse">
      {(kpis) => (
        <>
          <SectionA kpis={kpis} />
          <SectionB kpis={kpis} />
          <SectionC kpis={kpis} />
          <SectionD kpis={kpis} />
        </>
      )}
    </ReportLayout>
  );
}
