import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import './EntitySwitcher.css';

export function EntitySwitcher() {
  const { kundebaser, activeKundebaseId, setActiveKundebaseId } = usePortfolioContext();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const activeKb = kundebaser.find((kb) => kb.id === activeKundebaseId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="entity-switcher" ref={ref}>
      <button
        className="entity-switcher__trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="entity-switcher__label">Kundebase:</span>
        <span className="entity-switcher__name">
          {activeKb?.name ?? 'Velg kundebase'}
        </span>
        <span className={`entity-switcher__chevron ${isOpen ? 'entity-switcher__chevron--open' : ''}`}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="entity-switcher__dropdown">
          {kundebaser.map((kb) => {
            const isActive = kb.id === activeKundebaseId;
            return (
              <button
                key={kb.id}
                className={`entity-switcher__option ${isActive ? 'entity-switcher__option--active' : ''}`}
                onClick={() => {
                  setActiveKundebaseId(kb.id);
                  setIsOpen(false);
                }}
              >
                <div className="entity-switcher__option-row">
                  <span className="entity-switcher__option-name">{kb.name}</span>
                  {isActive && (
                    <svg className="entity-switcher__check" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7L5.5 10.5L12 3.5" stroke="#FED092" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="entity-switcher__option-org">
                  Org.nr: {kb.orgNr} · {kb.buildings.length} bygg
                </span>
              </button>
            );
          })}

          <div className="entity-switcher__divider" />

          <button
            className="entity-switcher__add-btn"
            onClick={() => {
              setIsOpen(false);
              navigate('/onboarding');
            }}
          >
            <span className="entity-switcher__add-icon">+</span>
            Legg til kundebase
          </button>
        </div>
      )}
    </div>
  );
}
