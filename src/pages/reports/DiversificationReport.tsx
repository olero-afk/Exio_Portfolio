import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, formatM2, formatNumber } from '../../utils/formatters.ts';
import type { DiversificationSlice } from '../../types/index.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './report-shared.css';

const COLORS = ['#22d4e8', '#FED092', '#4ade80', '#a78bfa', '#fb923c', '#38bdf8', '#e879f9'];

function DonutWithTable({
  title,
  slices,
  columns,
}: {
  title: string;
  slices: DiversificationSlice[];
  columns: { header: string; align?: 'right'; render: (s: DiversificationSlice) => React.ReactNode }[];
}) {
  const display = slices.length > 7
    ? [...slices.slice(0, 6), { label: 'Øvrige', value: slices.slice(6).reduce((s, x) => s + x.value, 0), percent: slices.slice(6).reduce((s, x) => s + x.percent, 0) }]
    : slices;

  const donutOpts: ApexOptions = {
    chart: { type: 'donut', background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: COLORS.slice(0, display.length),
    labels: display.map((s) => s.label),
    legend: { position: 'bottom', labels: { colors: '#7a7a7a' }, fontSize: '9px', markers: { size: 4 }, itemMargin: { horizontal: 6, vertical: 2 } },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '58%', labels: { show: false } } } },
    stroke: { width: 1, colors: ['#1e1e1e'] },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatPercent(v) } },
  };

  return (
    <div className="report-section">
      <h3 className="report-section__title">{title}</h3>
      <ReactApexChart options={donutOpts} series={display.map((s) => s.percent)} type="donut" height={240} />
      <table className="report-table" style={{ marginTop: 14 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header} data-align={col.align}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slices.map((s) => (
            <tr key={s.label}>
              {columns.map((col) => (
                <td key={col.header} data-align={col.align}>{col.render(s)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DiversificationReport() {
  const { contracts } = usePortfolioContext();

  return (
    <ReportLayout title="Diversifisering">
      {(kpis: PortfolioKPIs) => {
        const geoExtra = new Map<string, { count: number; m2: number }>();
        for (const b of kpis.filteredBuildings) {
          const key = b.address.municipality;
          const e = geoExtra.get(key);
          if (e) { e.count++; e.m2 += b.totalAreaM2; }
          else geoExtra.set(key, { count: 1, m2: b.totalAreaM2 });
        }

        const typeExtra = new Map<string, { count: number; m2: number }>();
        for (const b of kpis.filteredBuildings) {
          const key = b.buildingType;
          const e = typeExtra.get(key);
          if (e) { e.count++; e.m2 += b.totalAreaM2; }
          else typeExtra.set(key, { count: 1, m2: b.totalAreaM2 });
        }

        const industryTenants = new Map<string, Set<string>>();
        const activeContracts = contracts.filter((c) =>
          kpis.filteredBuildings.some((b) => b.id === c.buildingId) &&
          (c.status === 'active' || c.status === 'expiring_soon'),
        );
        for (const c of activeContracts) {
          const key = c.tenantIndustry ?? 'Ukjent';
          const s = industryTenants.get(key);
          if (s) s.add(c.tenantName);
          else industryTenants.set(key, new Set([c.tenantName]));
        }

        return (
          <div className="report-grid-3">
            <DonutWithTable
              title="Geografi"
              slices={kpis.diversification.byGeography}
              columns={[
                { header: 'Kommune', render: (s) => s.label },
                { header: 'Bygg', align: 'right', render: (s) => formatNumber(geoExtra.get(s.label)?.count ?? 0) },
                { header: 'Total m²', align: 'right', render: (s) => formatM2(geoExtra.get(s.label)?.m2 ?? 0) },
                { header: 'Årlig leie', align: 'right', render: (s) => formatNOK(s.value) },
                { header: 'Andel', align: 'right', render: (s) => formatPercent(s.percent) },
              ]}
            />
            <DonutWithTable
              title="Segment"
              slices={kpis.diversification.byAssetType}
              columns={[
                { header: 'Type', render: (s) => s.label },
                { header: 'Bygg', align: 'right', render: (s) => formatNumber(typeExtra.get(s.label)?.count ?? 0) },
                { header: 'Total m²', align: 'right', render: (s) => formatM2(typeExtra.get(s.label)?.m2 ?? 0) },
                { header: 'Årlig leie', align: 'right', render: (s) => formatNOK(s.value) },
                { header: 'Andel', align: 'right', render: (s) => formatPercent(s.percent) },
              ]}
            />
            <DonutWithTable
              title="Bransje"
              slices={kpis.diversification.byTenantIndustry}
              columns={[
                { header: 'Bransje', render: (s) => s.label },
                { header: 'Leietakere', align: 'right', render: (s) => formatNumber(industryTenants.get(s.label)?.size ?? 0) },
                { header: 'Årlig leie', align: 'right', render: (s) => formatNOK(s.value) },
                { header: 'Andel', align: 'right', render: (s) => formatPercent(s.percent) },
              ]}
            />
          </div>
        );
      }}
    </ReportLayout>
  );
}
