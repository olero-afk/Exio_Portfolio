import { useState, useRef, useEffect } from 'react';
import { usePersona } from '../../context/PersonaContext.tsx';
import type { PersonaType } from '../../types/index.ts';
import { PERSONA_CONFIGS } from '../../types/index.ts';
import './PersonaSwitcher.css';

const personas: PersonaType[] = ['investor', 'eier', 'forvalter'];

export function PersonaSwitcher() {
  const { persona, setPersona, config } = usePersona();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="persona-switcher" ref={ref}>
      <button className="persona-switcher__trigger" onClick={() => setIsOpen(!isOpen)}>
        <svg className="persona-switcher__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="persona-switcher__label">{config.label}</span>
        <span className={`persona-switcher__chevron ${isOpen ? 'persona-switcher__chevron--open' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="persona-switcher__dropdown">
          <div className="persona-switcher__dropdown-header">Velg rolle</div>
          {personas.map((p) => {
            const cfg = PERSONA_CONFIGS[p];
            return (
              <button
                key={p}
                className={`persona-switcher__option ${p === persona ? 'persona-switcher__option--active' : ''}`}
                onClick={() => { setPersona(p); setIsOpen(false); }}
              >
                <span className="persona-switcher__option-label">{cfg.label}</span>
                <span className="persona-switcher__option-desc">{cfg.description}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
