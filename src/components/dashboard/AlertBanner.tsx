import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK } from '../../utils/formatters.ts';
import './AlertBanner.css';

export function AlertBanner() {
  const { contracts } = usePortfolioContext();

  const alerts = useMemo(() => {
    const expiring = contracts.filter((c) => c.status === 'expiring_soon');
    const bankrupt = contracts.filter(
      (c) => c.tenantIsBankrupt && (c.status === 'active' || c.status === 'expiring_soon'),
    );
    return { expiring, bankrupt };
  }, [contracts]);

  if (alerts.expiring.length === 0 && alerts.bankrupt.length === 0) return null;

  return (
    <div className="alert-banner">
      {alerts.expiring.length > 0 && (
        <div className="alert-banner__item alert-banner__item--warning">
          <span className="alert-banner__icon">⚠</span>
          <div className="alert-banner__content">
            <strong>{alerts.expiring.length} kontrakter utløper snart</strong>
            <span className="alert-banner__detail">
              Total årlig leie i risiko: {formatNOK(alerts.expiring.reduce((s, c) => s + c.annualRent, 0))}
            </span>
            <div className="alert-banner__links">
              {alerts.expiring.map((c) => (
                <Link key={c.id} to={`/bygg/${c.buildingId}/avtaler`} className="alert-banner__link">
                  {c.tenantName} — {c.endDate}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {alerts.bankrupt.length > 0 && (
        <div className="alert-banner__item alert-banner__item--danger">
          <span className="alert-banner__icon">🚨</span>
          <div className="alert-banner__content">
            <strong>{alerts.bankrupt.length} leietakere er konkurs</strong>
            <div className="alert-banner__links">
              {alerts.bankrupt.map((c) => (
                <Link key={c.id} to={`/bygg/${c.buildingId}/avtaler`} className="alert-banner__link">
                  {c.tenantName}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
