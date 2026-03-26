import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatNOK, formatPercent } from '../../utils/formatters.ts';
import type { Building } from '../../types/index.ts';
import './MarketReference.css';

interface MarketReferenceProps {
  building: Building;
}

export function MarketReference({ building }: MarketReferenceProps) {
  const pp = building.priceStatsPerM2;
  const actual = building.marketRentPerM2;
  if (!pp && !actual) return null;

  const delta = (actual ?? 0) - (pp ?? 0);
  const deltaPct = pp && pp > 0 ? (delta / pp) * 100 : 0;
  const isAbove = delta >= 0;

  const barOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: ['#7a7a7a', '#22d4e8'],
    plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '50%' } },
    xaxis: { labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: string) => Number(v).toLocaleString('nb-NO') + ' kr' }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: '#9a9a9a', fontSize: '10px' } } },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) + '/m²' } },
    dataLabels: { enabled: true, formatter: (v: number) => formatNOK(v), style: { fontSize: '9px', colors: ['#e8e8e8'] }, offsetX: 6 },
    legend: { show: false },
  };

  const series = [{
    name: 'kr/m²',
    data: [
      { x: 'PlacePoint referanse', y: pp ?? 0 },
      { x: 'Din markedsleie', y: actual ?? 0 },
    ],
  }];

  return (
    <div className="market-ref">
      <h3 className="market-ref__title">Markedsreferanse (PlacePoint)</h3>
      <p className="market-ref__disclaimer">Markedsreferanse basert på offentlige data (PlacePoint/SSB). Ikke finansiell rådgivning.</p>

      <div className="market-ref__metrics">
        <div className="market-ref__metric">
          <span className="market-ref__label">Markedsleie (PlacePoint)</span>
          <span className="market-ref__value market-ref__value--muted">{pp ? formatNOK(pp) + '/m²' : '—'}</span>
        </div>
        <div className="market-ref__metric">
          <span className="market-ref__label">Din markedsleie</span>
          <span className="market-ref__value">{actual ? formatNOK(actual) + '/m²' : '—'}</span>
        </div>
        <div className="market-ref__metric">
          <span className="market-ref__label">Avvik</span>
          <span className={`market-ref__value ${isAbove ? 'market-ref__value--positive' : 'market-ref__value--negative'}`}>
            {isAbove ? '+' : ''}{formatNOK(delta)}/m² ({isAbove ? '+' : ''}{formatPercent(deltaPct)})
          </span>
        </div>
      </div>

      {pp && actual && (
        <ReactApexChart options={barOpts} series={series} type="bar" height={100} />
      )}

      <p className="market-ref__info">
        PlacePoint referanse er basert på transaksjonsdata for {building.address.municipality}. Ditt estimat bør reflektere byggets beliggenhet, standard og leietakersammensetning.
      </p>
    </div>
  );
}
