import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { KPICard } from '../shared/KPICard.tsx';
import { formatNOK, formatNumber, isNegative } from '../../utils/formatters.ts';
import type { DashboardKPIs } from '../../hooks/useKPI.ts';

interface NOICardProps {
  kpis: DashboardKPIs;
}

export function NOICard({ kpis }: NOICardProps) {
  const { totalNOI, totalGrossRentalIncome, totalOperatingExpenses, monthlyNOIData } = kpis;

  const hasFutureData = monthlyNOIData.some((d) => d.isFuture);
  const hasActualData = monthlyNOIData.some((d) => !d.isFuture);
  const categories = monthlyNOIData.map((d) => d.month.split(' ')[0]);

  // Build series: if mixed actual+future, use 4 series with pattern fill on projected.
  // If all actual or all future, use 2 series.
  let series: { name: string; data: number[] }[];
  let colors: string[];
  let fillConfig: ApexOptions['fill'];

  if (hasFutureData && hasActualData) {
    // 4 series: actual pair (solid) + projected pair (hatched)
    // Each month only has values in one pair, the other is null/0
    series = [
      {
        name: 'Leieinntekter',
        data: monthlyNOIData.map((d) => d.isFuture ? 0 : Math.round(d.income)),
      },
      {
        name: 'Driftskostnader',
        data: monthlyNOIData.map((d) => d.isFuture ? 0 : Math.round(d.costs)),
      },
      {
        name: 'Estimert inntekt',
        data: monthlyNOIData.map((d) => d.isFuture ? Math.round(d.income) : 0),
      },
      {
        name: 'Budsjetterte kostnader',
        data: monthlyNOIData.map((d) => d.isFuture ? Math.round(d.costs) : 0),
      },
    ];
    colors = ['#22d4e8', '#f87171', '#22d4e8', '#f87171'];
    fillConfig = {
      type: ['solid', 'solid', 'pattern', 'pattern'],
      pattern: {
        style: ['', '', 'slantedLines', 'slantedLines'],
        width: 4,
        height: 4,
        strokeWidth: 1,
      },
      opacity: [1, 1, 0.6, 0.6],
    };
  } else if (hasFutureData) {
    // All future — 2 series, both hatched
    series = [
      { name: 'Estimert inntekt', data: monthlyNOIData.map((d) => Math.round(d.income)) },
      { name: 'Budsjetterte kostnader', data: monthlyNOIData.map((d) => Math.round(d.costs)) },
    ];
    colors = ['#22d4e8', '#f87171'];
    fillConfig = {
      type: 'pattern',
      pattern: {
        style: 'slantedLines',
        width: 4,
        height: 4,
        strokeWidth: 1,
      },
      opacity: 0.6,
    };
  } else {
    // All actual — 2 series, both solid
    series = [
      { name: 'Leieinntekter', data: monthlyNOIData.map((d) => Math.round(d.income)) },
      { name: 'Driftskostnader', data: monthlyNOIData.map((d) => Math.round(d.costs)) },
    ];
    colors = ['#22d4e8', '#f87171'];
    fillConfig = { type: 'solid', opacity: 1 };
  }

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: false,
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
      parentHeightOffset: 0,
    },
    theme: { mode: 'dark' },
    colors,
    fill: fillConfig,
    plotOptions: {
      bar: {
        columnWidth: hasFutureData && hasActualData ? '70%' : '50%',
        borderRadius: 2,
      },
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: '#7a7a7a', fontSize: '9px' },
        rotate: 0,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#7a7a7a', fontSize: '9px' },
        formatter: (val: number) => {
          if (Math.abs(val) >= 1000000) return formatNumber(val / 1000000, 1) + 'M';
          return formatNumber(val / 1000) + 'k';
        },
      },
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.04)',
      strokeDashArray: 3,
      padding: { left: 4, right: 4, top: 0, bottom: 0 },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => val === 0 ? '' : formatNOK(val),
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#7a7a7a' },
      fontSize: '9px',
      fontWeight: 500,
      markers: { size: 4, offsetX: -2 },
      itemMargin: { horizontal: 8, vertical: 0 },
      offsetY: -4,
    },
    dataLabels: { enabled: false },
  };

  return (
    <KPICard
      title="Total NOI"
      value={formatNOK(totalNOI)}
      negative={isNegative(totalNOI)}
      tooltip={{
        title: 'NOI (Netto driftsinntekt)',
        formula: 'Leieinntekter − Driftskostnader',
        values: `${formatNOK(totalGrossRentalIncome)} − ${formatNOK(totalOperatingExpenses)} = ${formatNOK(totalNOI)}`,
        source: hasFutureData
          ? `${kpis.buildingNOIs.length} bygg. Skraverte søyler = estimert/budsjettert.`
          : `${kpis.buildingNOIs.length} bygg, aktive kontrakter + manuell kost.`,
      }}
    >
      {monthlyNOIData.length > 0 && (
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={260}
        />
      )}
    </KPICard>
  );
}
