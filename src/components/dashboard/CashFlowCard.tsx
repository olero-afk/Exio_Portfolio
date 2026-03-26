import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatNOK, formatNumber } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './CashFlowCard.css';

interface Props { kpis: PortfolioKPIs; }

export function CashFlowCard({ kpis }: Props) {
  const { cashFlowPeriods } = kpis;
  const totalIncome = cashFlowPeriods.reduce((s, p) => s + p.rentalIncome, 0);
  const totalCosts = cashFlowPeriods.reduce((s, p) => s + p.operatingCosts, 0);
  const totalNet = totalIncome - totalCosts;

  const categories = cashFlowPeriods.map((p) => p.label.split(' ')[0]);

  const options: ApexOptions = {
    chart: { type: 'bar', stacked: false, toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif', parentHeightOffset: 0 },
    theme: { mode: 'dark' },
    colors: ['#22d4e8', '#f87171', '#4ade80'],
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 2 } },
    xaxis: { categories, labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, rotate: 0 }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: number) => Math.abs(v) >= 1e6 ? formatNumber(v / 1e6, 1) + 'M' : formatNumber(v / 1e3) + 'k' } },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3, padding: { left: 4, right: 4, top: 0, bottom: 0 } },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) } },
    legend: { show: true, position: 'top', horizontalAlign: 'right', labels: { colors: '#7a7a7a' }, fontSize: '9px', markers: { size: 4, offsetX: -2 }, itemMargin: { horizontal: 8 }, offsetY: -4 },
    dataLabels: { enabled: false },
  };

  const series = [
    { name: 'Leieinntekter', data: cashFlowPeriods.map((p) => Math.round(p.rentalIncome)) },
    { name: 'Driftskostnader', data: cashFlowPeriods.map((p) => Math.round(p.operatingCosts)) },
    { name: 'Netto', data: cashFlowPeriods.map((p) => Math.round(p.netCashFlow)) },
  ];

  return (
    <div className="cf-card">
      <span className="cf-card__title">KONTANTSTRØM</span>
      <div className="cf-card__summary">
        <div className="cf-card__row"><span>Leieinntekter:</span><span className="cf-card__amount">{formatNOK(totalIncome)}</span></div>
        <div className="cf-card__row"><span>Driftskostnader:</span><span className="cf-card__amount negative">−{formatNOK(totalCosts)}</span></div>
        <div className="cf-card__row cf-card__row--net"><span>Netto:</span><span className="cf-card__amount">{formatNOK(totalNet)}</span></div>
      </div>
      {cashFlowPeriods.length > 0 && (
        <ReactApexChart options={options} series={series} type="bar" height={200} />
      )}
    </div>
  );
}
