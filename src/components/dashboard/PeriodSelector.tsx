import { useFilterContext } from '../../context/FilterContext.tsx';
import type { TimePeriod } from '../../types/index.ts';
import './PeriodSelector.css';

const periods: { id: TimePeriod; label: string }[] = [
  { id: 'denne_maaneden', label: 'Denne måneden' },
  { id: 'forrige_maaned', label: 'Forrige måned' },
  { id: 'siste_6_maaneder', label: 'Siste 6 måneder' },
  { id: 'neste_6_maaneder', label: 'Neste 6 måneder' },
  { id: 'dette_aaret', label: 'Dette året' },
  { id: 'forrige_aar', label: 'Forrige år' },
  { id: 'neste_aar', label: 'Neste år' },
  { id: 'egendefinert', label: 'Egendefinert' },
];

export function PeriodSelector() {
  const { timePeriod, setTimePeriod } = useFilterContext();

  return (
    <div className="period-selector">
      <span className="period-selector__label">TIDSPERIODE</span>
      <div className="period-selector__pills">
        {periods.map((period) => (
          <button
            key={period.id}
            className={`period-selector__pill ${timePeriod === period.id ? 'period-selector__pill--active' : ''}`}
            onClick={() => setTimePeriod(period.id)}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}
