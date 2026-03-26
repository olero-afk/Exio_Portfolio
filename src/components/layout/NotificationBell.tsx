import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK } from '../../utils/formatters.ts';
import './NotificationBell.css';

export function NotificationBell() {
  const { contracts, buildings } = usePortfolioContext();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const alerts = useMemo(() => {
    const expiring = contracts.filter((c) => c.status === 'expiring_soon');
    const bankrupt = contracts.filter(
      (c) => c.tenantIsBankrupt && (c.status === 'active' || c.status === 'expiring_soon'),
    );
    return { expiring, bankrupt, total: expiring.length + bankrupt.length };
  }, [contracts]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="notif-bell" ref={ref}>
      <button className="notif-bell__btn" onClick={() => setIsOpen(!isOpen)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {alerts.total > 0 && (
          <span className="notif-bell__badge">{alerts.total}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-bell__dropdown">
          <div className="notif-bell__header">
            <span className="notif-bell__title">Varsler</span>
            <span className="notif-bell__count">{alerts.total}</span>
          </div>

          {alerts.expiring.length > 0 && (
            <div className="notif-bell__group">
              <span className="notif-bell__group-title">Kontrakter som utløper snart</span>
              {alerts.expiring.map((c) => {
                const building = buildings.find((b) => b.id === c.buildingId);
                return (
                  <Link
                    key={c.id}
                    to={`/bygg/${c.buildingId}/avtaler`}
                    className="notif-bell__item"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="notif-bell__item-icon">⚠</span>
                    <div className="notif-bell__item-content">
                      <span className="notif-bell__item-title">{c.tenantName}</span>
                      <span className="notif-bell__item-sub">{building?.name} — {formatNOK(c.annualRent)} — {c.endDate}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {alerts.bankrupt.length > 0 && (
            <div className="notif-bell__group">
              <span className="notif-bell__group-title notif-bell__group-title--danger">Konkurs</span>
              {alerts.bankrupt.map((c) => {
                const building = buildings.find((b) => b.id === c.buildingId);
                return (
                  <Link
                    key={c.id}
                    to={`/bygg/${c.buildingId}/avtaler`}
                    className="notif-bell__item notif-bell__item--danger"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="notif-bell__item-icon">🚨</span>
                    <div className="notif-bell__item-content">
                      <span className="notif-bell__item-title">{c.tenantName}</span>
                      <span className="notif-bell__item-sub">{building?.name} — {formatNOK(c.annualRent)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {alerts.total === 0 && (
            <div className="notif-bell__empty">Ingen varsler</div>
          )}
        </div>
      )}
    </div>
  );
}
