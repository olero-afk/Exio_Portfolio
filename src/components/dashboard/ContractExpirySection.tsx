import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { useFilterContext } from '../../context/FilterContext.tsx';
import { formatNOK } from '../../utils/formatters.ts';
import './ContractExpirySection.css';

export function useExpiringContracts() {
  const { contracts, buildings } = usePortfolioContext();
  const { selectedFundId } = useFilterContext();
  const { funds } = usePortfolioContext();

  return useMemo(() => {
    const fund = selectedFundId ? funds.find((f) => f.id === selectedFundId) : null;
    const buildingIds = fund ? fund.buildingIds : buildings.filter((b) => !b.isArchived).map((b) => b.id);

    const expiring = contracts.filter(
      (c) => buildingIds.includes(c.buildingId) && c.status === 'expiring_soon',
    );
    const bankrupt = contracts.filter(
      (c) => buildingIds.includes(c.buildingId) && c.tenantIsBankrupt && (c.status === 'active' || c.status === 'expiring_soon'),
    );
    const totalExpiringRent = expiring.reduce((s, c) => s + c.annualRent, 0);
    return { expiring, bankrupt, totalExpiringRent, count: expiring.length + bankrupt.length };
  }, [contracts, buildings, funds, selectedFundId]);
}

export function ContractExpirySection() {
  const { expiring, bankrupt, totalExpiringRent } = useExpiringContracts();
  const { buildings } = usePortfolioContext();

  if (expiring.length === 0 && bankrupt.length === 0) return null;

  return (
    <div className="expiry-section">
      <div className="expiry-section__header">
        <span className="expiry-section__icon">⚠</span>
        <span className="expiry-section__title">Kontrakter som utløper</span>
        <span className="expiry-section__count">{expiring.length} kontrakter</span>
      </div>

      {expiring.length > 0 && (
        <div className="expiry-section__summary">
          <span>Totalt i perioden: <strong>{formatNOK(totalExpiringRent)}</strong></span>
          <span>Første periode: <strong className="expiry-section__warning">{expiring[0]?.endDate}</strong></span>
        </div>
      )}

      <div className="expiry-section__list">
        {expiring.map((c) => {
          const building = buildings.find((b) => b.id === c.buildingId);
          return (
            <Link key={c.id} to={`/bygg/${c.buildingId}/avtaler`} className="expiry-section__item">
              <div className="expiry-section__item-main">
                <span className="expiry-section__tenant">{c.tenantName}</span>
                <span className="expiry-section__building">{building?.name}</span>
              </div>
              <div className="expiry-section__item-right">
                <span className="expiry-section__rent">{formatNOK(c.annualRent)}</span>
                <span className="expiry-section__date">{c.endDate}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {bankrupt.length > 0 && (
        <>
          <div className="expiry-section__header expiry-section__header--danger">
            <span className="expiry-section__icon">🚨</span>
            <span className="expiry-section__title">Leietakere med konkurs</span>
            <span className="expiry-section__count">{bankrupt.length}</span>
          </div>
          <div className="expiry-section__list">
            {bankrupt.map((c) => {
              const building = buildings.find((b) => b.id === c.buildingId);
              return (
                <Link key={c.id} to={`/bygg/${c.buildingId}/avtaler`} className="expiry-section__item expiry-section__item--danger">
                  <div className="expiry-section__item-main">
                    <span className="expiry-section__tenant">{c.tenantName}</span>
                    <span className="expiry-section__building">{building?.name}</span>
                  </div>
                  <span className="expiry-section__rent">{formatNOK(c.annualRent)}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
