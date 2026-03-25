import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatM2, formatPercent, formatNumber } from '../../utils/formatters.ts';
import { BuildingLink } from '../shared/BuildingLink.tsx';
import './VacancySummary.css';

export function VacancySummary() {
  const { buildings } = usePortfolioContext();

  const data = buildings
    .filter((b) => !b.isArchived)
    .map((b) => {
      const vacantM2 = b.totalRentableM2 - b.committedM2;
      return {
        building: b,
        vacantM2,
        vacancyCost: vacantM2 * (b.marketRentPerM2 ?? 0),
        vacancyRate: b.vacancyRate,
      };
    })
    .sort((a, b) => b.vacancyCost - a.vacancyCost);

  const totalVacancyCost = data.reduce((s, d) => s + d.vacancyCost, 0);
  const totalVacantM2 = data.reduce((s, d) => s + d.vacantM2, 0);
  const withVacancy = data.filter((d) => d.vacancyCost > 0);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
    },
    theme: { mode: 'dark' },
    colors: ['#f87171'],
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4, barHeight: '60%' },
    },
    xaxis: {
      labels: {
        style: { colors: '#9a9a9a', fontSize: '10px' },
        formatter: (val: string) => formatNumber(Number(val) / 1000) + 'k',
      },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#9a9a9a', fontSize: '11px' } },
    },
    grid: { borderColor: 'rgba(255,255,255,0.06)', strokeDashArray: 3 },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val: number) => formatNOK(val) },
    },
    dataLabels: { enabled: false },
  };

  const chartSeries = [{
    name: 'Ledighetskostnad',
    data: withVacancy.map((d) => ({
      x: d.building.name,
      y: d.vacancyCost,
    })),
  }];

  return (
    <div className="vacancy-summary">
      <div className="vacancy-summary__kpis">
        <div className="vacancy-summary__kpi">
          <span className="vacancy-summary__label">Total ledighetskostnad</span>
          <span className="vacancy-summary__value">{formatNOK(totalVacancyCost)}</span>
        </div>
        <div className="vacancy-summary__kpi">
          <span className="vacancy-summary__label">Totalt ledig areal</span>
          <span className="vacancy-summary__value">{formatM2(totalVacantM2)}</span>
        </div>
        <div className="vacancy-summary__kpi">
          <span className="vacancy-summary__label">Bygg med ledighet</span>
          <span className="vacancy-summary__value">{withVacancy.length} av {data.length}</span>
        </div>
      </div>

      {withVacancy.length > 0 && (
        <div className="vacancy-summary__chart">
          <h3 className="vacancy-summary__section-title">LEDIGHETSKOSTNAD PER BYGG</h3>
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={withVacancy.length * 50 + 40}
          />
        </div>
      )}

      <div className="vacancy-summary__ranking">
        <h3 className="vacancy-summary__section-title">DETALJER</h3>
        {data.map((d) => (
          <div key={d.building.id} className="vacancy-summary__row">
            <BuildingLink
              buildingId={d.building.id}
              name={d.building.name}
              detail={formatNOK(d.vacancyCost)}
            />
            <div className="vacancy-summary__row-meta">
              <span>Ledig: {formatM2(d.vacantM2)}</span>
              <span>Ledighetsgrad: {formatPercent(d.vacancyRate * 100)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
