import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatNOK, formatPercent, formatNumber } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './ExpiryProfileCard.css';

interface Props { kpis: PortfolioKPIs; }

export function ExpiryProfileCard({ kpis }: Props) {
  const { expiryProfile } = kpis;
  const y1 = expiryProfile[0];

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: expiryProfile.map((_, i) => i === 0 ? '#f87171' : '#22d4e8'),
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 4, distributed: true } },
    xaxis: {
      categories: expiryProfile.map((e) => e.label),
      labels: { style: { colors: '#7a7a7a', fontSize: '11px' } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: number) => Math.abs(v) >= 1e6 ? formatNumber(v / 1e6, 1) + 'M' : formatNumber(v / 1e3) + 'k' },
    },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) } },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (v: number) => v > 0 ? formatNumber(v / 1e6, 1) + 'M' : '',
      style: { fontSize: '9px', fontWeight: 600, colors: ['#e8e8e8'] },
      offsetY: -8,
    },
  };

  const series = [{ name: 'Utløpende leie', data: expiryProfile.map((e) => Math.round(e.expiringRent)) }];

  return (
    <div className="exp-card">
      <span className="exp-card__title">KONTRAKTSUTLØPSPROFIL</span>
      <ReactApexChart options={options} series={series} type="bar" height={220} />
      {y1 && y1.expiringRent > 0 && (
        <div className="exp-card__footer">
          {y1.label} = {formatNOK(y1.expiringRent)} ({formatPercent(y1.percentOfTotal)} av total)
        </div>
      )}
    </div>
  );
}
