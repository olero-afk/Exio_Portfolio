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

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: false,
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
    },
    theme: { mode: 'dark' },
    colors: hasFutureData
      ? ['#22d4e8', '#f87171', '#22d4e880', '#f8717180']
      : ['#22d4e8', '#f87171'],
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 3,
      },
    },
    xaxis: {
      categories: monthlyNOIData.map((d) => d.month),
      labels: {
        style: { colors: '#9a9a9a', fontSize: '10px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#9a9a9a', fontSize: '10px' },
        formatter: (val: number) => formatNumber(val / 1000) + 'k',
      },
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.06)',
      strokeDashArray: 3,
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val: number) => formatNOK(val) },
    },
    legend: {
      position: 'bottom',
      labels: { colors: '#9a9a9a' },
      fontSize: '11px',
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
          height={180}
        />
      )}
    </KPICard>
  );
}
