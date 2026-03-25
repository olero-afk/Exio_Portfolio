import { useState } from 'react';
import './ModuleTabs.css';

type ModuleTab = 'portefolje' | 'okonomi' | 'energi';

const tabs: { id: ModuleTab; label: string; locked: boolean }[] = [
  { id: 'portefolje', label: 'Portefølje', locked: false },
  { id: 'okonomi', label: 'Økonomi', locked: true },
  { id: 'energi', label: 'Energi', locked: false },
];

export function ModuleTabs() {
  const [active, setActive] = useState<ModuleTab>('portefolje');

  return (
    <div className="module-tabs">
      <span className="module-tabs__label">OVERSIKT</span>
      <div className="module-tabs__pills">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`module-tabs__pill ${active === tab.id ? 'module-tabs__pill--active' : ''} ${tab.locked ? 'module-tabs__pill--locked' : ''}`}
            onClick={() => !tab.locked && setActive(tab.id)}
            disabled={tab.locked}
          >
            {tab.label}
            {tab.locked && <span className="module-tabs__lock">🔒</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
