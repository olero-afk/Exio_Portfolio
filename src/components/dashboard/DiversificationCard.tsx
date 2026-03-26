import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import type { DiversificationSlice } from '../../types/index.ts';
import './DiversificationCard.css';

interface Props { kpis: PortfolioKPIs; }

const COLORS = ['#22d4e8', '#FED092', '#4ade80', '#f87171', '#a78bfa', '#fb923c', '#38bdf8', '#e879f9', '#facc15', '#94a3b8'];

function DonutChart({ title, slices }: { title: string; slices: DiversificationSlice[] }) {
  const options: ApexOptions = {
    chart: { type: 'donut', background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: COLORS.slice(0, slices.length),
    labels: slices.map((s) => s.label),
    legend: { position: 'bottom', labels: { colors: '#7a7a7a' }, fontSize: '9px', markers: { size: 4 }, itemMargin: { horizontal: 4, vertical: 2 } },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '65%', labels: { show: false } } } },
    stroke: { width: 1, colors: ['#1e1e1e'] },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `${v.toFixed(1)}%` } },
  };

  return (
    <div className="div-card__donut">
      <span className="div-card__donut-title">{title}</span>
      <ReactApexChart options={options} series={slices.map((s) => s.percent)} type="donut" height={180} />
    </div>
  );
}

export function DiversificationCard({ kpis }: Props) {
  const { diversification } = kpis;

  return (
    <div className="div-card">
      <span className="div-card__title">DIVERSIFISERING</span>
      <div className="div-card__grid">
        <DonutChart title="Geografi" slices={diversification.byGeography} />
        <DonutChart title="Segment" slices={diversification.byAssetType} />
        <DonutChart title="Bransje" slices={diversification.byTenantIndustry} />
      </div>
    </div>
  );
}
