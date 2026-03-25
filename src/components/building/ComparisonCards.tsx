import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, formatYears, formatM2 } from '../../utils/formatters.ts';
import type { Building, Contract } from '../../types/index.ts';
import './ComparisonCards.css';

interface ComparisonCardsProps {
  buildings: Building[];
}

function calcBuildingWault(contracts: Contract[], buildingId: string): number {
  const active = contracts.filter(
    (c) => c.buildingId === buildingId && (c.status === 'active' || c.status === 'expiring_soon'),
  );
  const total = active.reduce((s, c) => s + c.annualRent, 0);
  if (total === 0) return 0;
  return active.reduce((sum, c) => sum + Math.max(0, c.remainingTermYears) * c.annualRent, 0) / total;
}

function calcNOI(contracts: Contract[], costs: { buildingId: string; amount: number }[], buildingId: string): number {
  const active = contracts.filter(
    (c) => c.buildingId === buildingId && (c.status === 'active' || c.status === 'expiring_soon'),
  );
  const income = active.reduce((s, c) => s + c.annualRent, 0);
  const buildingCosts = costs.filter((c) => c.buildingId === buildingId);
  const months = new Set(buildingCosts.map((c) => `${(c as Record<string, unknown>).year}-${(c as Record<string, unknown>).month}`)).size;
  const totalCost = buildingCosts.reduce((s, c) => s + c.amount, 0);
  const annualized = months > 0 ? (totalCost / months) * 12 : 0;
  return income - annualized;
}

export function ComparisonCards({ buildings }: ComparisonCardsProps) {
  const { contracts, costs } = usePortfolioContext();

  const data = useMemo(() =>
    buildings.map((b) => ({
      building: b,
      noi: calcNOI(contracts, costs, b.id),
      wault: calcBuildingWault(contracts, b.id),
      vacancyCost: (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0),
      costPerM2: (() => {
        const bc = costs.filter((c) => c.buildingId === b.id);
        const ms = new Set(bc.map((c) => `${c.year}-${c.month}`)).size;
        const total = bc.reduce((s, c) => s + c.amount, 0);
        const annualized = ms > 0 ? (total / ms) * 12 : 0;
        return b.totalRentableM2 > 0 ? annualized / b.totalRentableM2 : 0;
      })(),
    })),
  [buildings, contracts, costs]);

  const chartOptions: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: ['#22d4e8', '#4ade80', '#FED092', '#f87171'],
    plotOptions: { bar: { columnWidth: '60%', borderRadius: 3 } },
    xaxis: {
      categories: data.map((d) => d.building.name),
      labels: { style: { colors: '#9a9a9a', fontSize: '10px' }, rotate: -30, trim: true },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: '#9a9a9a', fontSize: '10px' }, formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
    grid: { borderColor: 'rgba(255,255,255,0.06)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', labels: { colors: '#9a9a9a' }, fontSize: '11px' },
  };

  return (
    <div className="comparison-cards">
      <div className="comparison-cards__chart">
        <ReactApexChart
          options={chartOptions}
          series={[
            { name: 'NOI', data: data.map((d) => Math.round(d.noi)) },
            { name: 'Ledighetskostnad', data: data.map((d) => Math.round(d.vacancyCost)) },
          ]}
          type="bar"
          height={280}
        />
      </div>

      <div className="comparison-cards__grid">
        {data.map((d) => (
          <Link to={`/bygg/${d.building.id}`} key={d.building.id} className="comparison-cards__card">
            <h3 className="comparison-cards__name">{d.building.name}</h3>
            <span className="comparison-cards__type">{d.building.buildingType}</span>
            <div className="comparison-cards__metrics">
              <div className="comparison-cards__metric">
                <span className="comparison-cards__metric-label">NOI</span>
                <span className="comparison-cards__metric-value">{formatNOK(d.noi)}</span>
              </div>
              <div className="comparison-cards__metric">
                <span className="comparison-cards__metric-label">Utleiegrad</span>
                <span className="comparison-cards__metric-value">{formatPercent(d.building.occupancyRate * 100)}</span>
              </div>
              <div className="comparison-cards__metric">
                <span className="comparison-cards__metric-label">WAULT</span>
                <span className="comparison-cards__metric-value">{formatYears(d.wault)}</span>
              </div>
              <div className="comparison-cards__metric">
                <span className="comparison-cards__metric-label">Kostnad/m²</span>
                <span className="comparison-cards__metric-value">{formatNOK(d.costPerM2)}</span>
              </div>
              <div className="comparison-cards__metric">
                <span className="comparison-cards__metric-label">Total m²</span>
                <span className="comparison-cards__metric-value">{formatM2(d.building.totalAreaM2)}</span>
              </div>
              <div className="comparison-cards__metric">
                <span className="comparison-cards__metric-label">Ledighetskostnad</span>
                <span className="comparison-cards__metric-value">{formatNOK(d.vacancyCost)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
