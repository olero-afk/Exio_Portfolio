import { useState, useRef, useEffect } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import './EntitySwitcher.css';

export function EntitySwitcher() {
  const { companies, activeCompanyId, setActiveCompanyId } = usePortfolioContext();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

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
          {activeCompany?.name ?? 'Velg selskap'}
        </span>
        <span className={`entity-switcher__chevron ${isOpen ? 'entity-switcher__chevron--open' : ''}`}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="entity-switcher__dropdown">
          {companies.map((company) => (
            <button
              key={company.id}
              className={`entity-switcher__option ${company.id === activeCompanyId ? 'entity-switcher__option--active' : ''}`}
              onClick={() => {
                setActiveCompanyId(company.id);
                setIsOpen(false);
              }}
            >
              <span className="entity-switcher__option-name">{company.name}</span>
              <span className="entity-switcher__option-org">Org.nr: {company.orgNr}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
