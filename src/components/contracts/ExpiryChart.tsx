import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatNumber } from '../../utils/formatters.ts';
import './ExpiryChart.css';

interface ExpiryChartProps {
  buildingId: string;
}

export function ExpiryChart({ buildingId }: ExpiryChartProps) {
  const { contracts } = usePortfolioContext();

  const { years, amounts, percentages } = useMemo(() => {
    const active = contracts.filter(
      (c) => c.buildingId === buildingId && (c.status === 'active' || c.status === 'expiring_soon'),
    );
    const totalRent = active.reduce((s, c) => s + c.annualRent, 0);
    const now = new Date();
    const currentYear = now.getFullYear();

    const yrs: string[] = [];
    const amts: number[] = [];
    const pcts: number[] = [];

    for (let y = currentYear; y <= currentYear + 5; y++) {
      const expiring = active.filter((c) => {
        const endYear = new Date(c.endDate).getFullYear();
        return endYear === y;
      });
      const amount = expiring.reduce((s, c) => s + c.annualRent, 0);
      yrs.push(`${y}`);
      amts.push(amount);
      pcts.push(totalRent > 0 ? (amount / totalRent) * 100 : 0);
    }

    return { years: yrs, amounts: amts, percentages: pcts };
  }, [contracts, buildingId]);

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
    },
    theme: { mode: 'dark' },
    colors: ['#22d4e8'],
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: years,
      labels: { style: { colors: '#9a9a9a', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#9a9a9a', fontSize: '10px' },
        formatter: (val: number) => formatNumber(val / 1000000, 1) + 'M',
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
    dataLabels: {
      enabled: true,
      formatter: (_val: string | number | number[], opt?: { dataPointIndex: number }) =>
        opt && percentages[opt.dataPointIndex] > 0
          ? `${formatNumber(percentages[opt.dataPointIndex], 1)}%`
          : '',
      style: { fontSize: '10px', fontWeight: 600, colors: ['#e8e8e8'] },
      offsetY: -6,
    },
  };

  const series = [{ name: 'Utløpende leie', data: amounts }];

  return (
    <div className="expiry-chart">
      <h3 className="expiry-chart__title">KONTRAKTSUTLØPSPROFIL</h3>
      <ReactApexChart options={options} series={series} type="bar" height={240} />
    </div>
  );
}
