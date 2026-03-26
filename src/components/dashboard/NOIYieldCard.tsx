import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatNOK, formatPercent, formatNumber, isNegative } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './NOIYieldCard.css';

interface Props { kpis: PortfolioKPIs; }

export function NOIYieldCard({ kpis }: Props) {
  const { totalNOI, noiYield, noiMargin, monthlyNOIData } = kpis;
  const hasFutureData = monthlyNOIData.some((d) => d.isFuture);
  const hasActualData = monthlyNOIData.some((d) => !d.isFuture);
  const categories = monthlyNOIData.map((d) => d.month.split(' ')[0]);

  let series: { name: string; data: number[] }[];
  let colors: string[];
  let fillConfig: ApexOptions['fill'];

  if (hasFutureData && hasActualData) {
    series = [
      { name: 'Leieinntekter', data: monthlyNOIData.map((d) => d.isFuture ? 0 : Math.round(d.income)) },
      { name: 'Driftskostnader', data: monthlyNOIData.map((d) => d.isFuture ? 0 : Math.round(d.costs)) },
      { name: 'Estimert inntekt', data: monthlyNOIData.map((d) => d.isFuture ? Math.round(d.income) : 0) },
      { name: 'Budsjetterte kostnader', data: monthlyNOIData.map((d) => d.isFuture ? Math.round(d.costs) : 0) },
    ];
    colors = ['#22d4e8', '#f87171', '#22d4e8', '#f87171'];
    fillConfig = {
      type: ['solid', 'solid', 'pattern', 'pattern'],
      pattern: { style: ['', '', 'slantedLines', 'slantedLines'], width: 4, height: 4, strokeWidth: 1 },
      opacity: [1, 1, 0.6, 0.6],
    };
  } else if (hasFutureData) {
    series = [
      { name: 'Estimert inntekt', data: monthlyNOIData.map((d) => Math.round(d.income)) },
      { name: 'Budsjetterte kostnader', data: monthlyNOIData.map((d) => Math.round(d.costs)) },
    ];
    colors = ['#22d4e8', '#f87171'];
    fillConfig = { type: 'pattern', pattern: { style: 'slantedLines', width: 4, height: 4, strokeWidth: 1 }, opacity: 0.6 };
  } else {
    series = [
      { name: 'Leieinntekter', data: monthlyNOIData.map((d) => Math.round(d.income)) },
      { name: 'Driftskostnader', data: monthlyNOIData.map((d) => Math.round(d.costs)) },
    ];
    colors = ['#22d4e8', '#f87171'];
    fillConfig = { type: 'solid', opacity: 1 };
  }

  const options: ApexOptions = {
    chart: { type: 'bar', stacked: false, toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif', parentHeightOffset: 0 },
    theme: { mode: 'dark' },
    colors,
    fill: fillConfig,
    plotOptions: { bar: { columnWidth: hasFutureData && hasActualData ? '70%' : '50%', borderRadius: 2 } },
    xaxis: { categories, labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, rotate: 0 }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: number) => Math.abs(v) >= 1e6 ? formatNumber(v / 1e6, 1) + 'M' : formatNumber(v / 1e3) + 'k' } },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3, padding: { left: 4, right: 4, top: 0, bottom: 0 } },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => v === 0 ? '' : formatNOK(v) } },
    legend: { show: true, position: 'top', horizontalAlign: 'right', labels: { colors: '#7a7a7a' }, fontSize: '9px', fontWeight: 500, markers: { size: 4, offsetX: -2 }, itemMargin: { horizontal: 8, vertical: 0 }, offsetY: -4 },
    dataLabels: { enabled: false },
  };

  return (
    <div className="noi-yield-card">
      <div className="noi-yield-card__header">
        <span className="noi-yield-card__title">TOTAL NOI</span>
      </div>
      <div className={`noi-yield-card__value ${isNegative(totalNOI) ? 'negative' : ''}`}>{formatNOK(totalNOI)}</div>
      <div className="noi-yield-card__metrics">
        <span>NOI-yield: <strong>{formatPercent(noiYield)}</strong></span>
        <span>Margin: <strong>{formatPercent(noiMargin)}</strong></span>
      </div>
      {monthlyNOIData.length > 0 && (
        <ReactApexChart options={options} series={series} type="bar" height={220} />
      )}
    </div>
  );
}
