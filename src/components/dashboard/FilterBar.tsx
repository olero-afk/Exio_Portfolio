import { usePersona } from '../../context/PersonaContext.tsx';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { useFilterContext } from '../../context/FilterContext.tsx';
import type { TimePeriod } from '../../types/index.ts';
import './FilterBar.css';

const periods: { id: TimePeriod; label: string }[] = [
  { id: 'denne_maaneden', label: 'Denne mnd' },
  { id: 'forrige_maaned', label: 'Forrige mnd' },
  { id: 'siste_6_maaneder', label: 'Siste 6 mnd' },
  { id: 'neste_6_maaneder', label: 'Neste 6 mnd' },
  { id: 'dette_aaret', label: 'Dette året' },
  { id: 'forrige_aar', label: 'Forrige år' },
  { id: 'neste_aar', label: 'Neste år' },
  { id: 'egendefinert', label: 'Egendefinert' },
];

export function FilterBar() {
  const { persona, config, clients, selectedClientId, setSelectedClientId } = usePersona();
  const { funds } = usePortfolioContext();
  const { selectedFundId, setSelectedFundId, timePeriod, setTimePeriod } = useFilterContext();

  return (
    <div className="filter-bar">
      <div className="filter-bar__left">
        {config.showFundFilter && (
          <div className="filter-bar__dropdown">
            <span className="filter-bar__label">FOND:</span>
            <select
              className="filter-bar__select"
              value={selectedFundId ?? ''}
              onChange={(e) => setSelectedFundId(e.target.value || null)}
            >
              <option value="">Hele porteføljen</option>
              {funds.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}
        {config.showClientFilter && (
          <div className="filter-bar__dropdown">
            <span className="filter-bar__label">KUNDE:</span>
            <select
              className="filter-bar__select"
              value={selectedClientId ?? ''}
              onChange={(e) => setSelectedClientId(e.target.value || null)}
            >
              <option value="">Alle kunder</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        {persona === 'eier' && (
          <span className="filter-bar__static">Min portefølje</span>
        )}
      </div>

      <div className="filter-bar__pills">
        {periods.map((p) => (
          <button
            key={p.id}
            className={`filter-bar__pill ${timePeriod === p.id ? 'filter-bar__pill--active' : ''}`}
            onClick={() => setTimePeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
