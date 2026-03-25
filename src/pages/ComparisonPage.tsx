import { useState } from 'react';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { ComparisonCards } from '../components/building/ComparisonCards.tsx';
import { ComparisonTable } from '../components/building/ComparisonTable.tsx';
import './ComparisonPage.css';

type ViewMode = 'cards' | 'table';

export function ComparisonPage() {
  const { buildings } = usePortfolioContext();
  const active = buildings.filter((b) => !b.isArchived);
  const [selectedIds, setSelectedIds] = useState<string[]>(active.slice(0, 4).map((b) => b.id));
  const [view, setView] = useState<ViewMode>('cards');

  function toggleBuilding(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const selected = active.filter((b) => selectedIds.includes(b.id));

  return (
    <div className="comparison-page">
      <div className="comparison-page__header">
        <h1 className="comparison-page__title">Sammenlign bygninger</h1>
        <div className="comparison-page__view-toggle">
          <button
            className={`comparison-page__toggle ${view === 'cards' ? 'comparison-page__toggle--active' : ''}`}
            onClick={() => setView('cards')}
          >
            Grafisk
          </button>
          <button
            className={`comparison-page__toggle ${view === 'table' ? 'comparison-page__toggle--active' : ''}`}
            onClick={() => setView('table')}
          >
            Tabell
          </button>
        </div>
      </div>

      <div className="comparison-page__selector">
        <span className="comparison-page__label">VELG BYGNINGER</span>
        <div className="comparison-page__chips">
          {active.map((b) => (
            <button
              key={b.id}
              className={`comparison-page__chip ${selectedIds.includes(b.id) ? 'comparison-page__chip--selected' : ''}`}
              onClick={() => toggleBuilding(b.id)}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {selected.length === 0 ? (
        <div className="comparison-page__empty">Velg minst én bygning for å sammenligne</div>
      ) : view === 'cards' ? (
        <ComparisonCards buildings={selected} />
      ) : (
        <ComparisonTable buildings={selected} />
      )}
    </div>
  );
}
