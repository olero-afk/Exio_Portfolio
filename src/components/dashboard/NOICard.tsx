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

  // Compact month labels — drop year, show only "Jan", "Feb", etc.
  const labels = monthlyNOIData.map((d) => {
    const parts = d.month.split(' ');
    return parts[0];
  });

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
    colors: hasFutureData
      ? ['#22d4e8', '#f87171', 'rgba(34,212,232,0.4)', 'rgba(248,113,113,0.4)']
      : ['#22d4e8', '#f87171'],
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 2,
      },
    },
    xaxis: {
      categories: labels,
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
      y: { formatter: (val: number) => formatNOK(val) },
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

  const series = hasFutureData
    ? [
        { name: 'Leieinntekter', data: monthlyNOIData.map((d) => Math.round(d.leieinntekter)) },
        { name: 'Driftskostnader', data: monthlyNOIData.map((d) => Math.round(d.driftskostnader)) },
        { name: 'Estimert inntekt', data: monthlyNOIData.map((d) => Math.round(d.estimertInntekt)) },
        { name: 'Budsjetterte kostnader', data: monthlyNOIData.map((d) => Math.round(d.budsjetterteKostnader)) },
      ]
    : [
        { name: 'Leieinntekter', data: monthlyNOIData.map((d) => Math.round(d.leieinntekter)) },
        { name: 'Driftskostnader', data: monthlyNOIData.map((d) => Math.round(d.driftskostnader)) },
      ];

  return (
    <KPICard
      title="Total NOI"
      value={formatNOK(totalNOI)}
      negative={isNegative(totalNOI)}
      tooltip={{
        title: 'NOI (Netto driftsinntekt)',
        formula: 'Leieinntekter − Driftskostnader',
        values: `${formatNOK(totalGrossRentalIncome)} − ${formatNOK(totalOperatingExpenses)} = ${formatNOK(totalNOI)}`,
        source: `${kpis.buildingNOIs.length} bygg, aktive kontrakter + manuell kost. Fremtidige måneder viser estimert inntekt og budsjetterte kostnader.`,
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
