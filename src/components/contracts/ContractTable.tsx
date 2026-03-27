import { useMemo, useState } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatM2, formatYears } from '../../utils/formatters.ts';
import type { Contract } from '../../types/index.ts';
import { ContractModal } from './ContractModal.tsx';
import './ContractTable.css';

interface ContractTableProps {
  buildingId: string;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Aktiv';
    case 'expiring_soon': return 'Utløper snart';
    case 'expired': return 'Utløpt';
    case 'future': return 'Fremtidig';
    default: return status;
  }
}

function statusClass(status: string): string {
  switch (status) {
    case 'active': return 'contract-table__badge--active';
    case 'expiring_soon': return 'contract-table__badge--expiring';
    case 'expired': return 'contract-table__badge--expired';
    case 'future': return 'contract-table__badge--future';
    default: return '';
  }
}

export function ContractTable({ buildingId }: ContractTableProps) {
  const { contracts } = usePortfolioContext();
  const [showModal, setShowModal] = useState(false);

  const buildingContracts = useMemo(
    () => contracts
      .filter((c) => c.buildingId === buildingId)
      .sort((a, b) => {
        const order = { active: 0, expiring_soon: 1, future: 2, expired: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      }),
    [contracts, buildingId],
  );

  const totalArea = buildingContracts.reduce((s, c) => s + c.areaM2, 0);
  const totalRent = buildingContracts.reduce((s, c) => s + c.annualRent, 0);

  return (
    <div className="contract-table">
      <div className="contract-table__header">
        <div className="contract-table__summary">
          {buildingContracts.length > 0 && (
            <span>
              {buildingContracts.length} avtaler · {formatM2(totalArea)} utleid · {formatNOK(totalRent)}/år
            </span>
          )}
        </div>
        <button className="contract-table__add-btn" onClick={() => setShowModal(true)}>
          + Ny avtale
        </button>
      </div>

      {buildingContracts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Leietaker</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>m²</th>
              <th style={{ textAlign: 'right' }}>Årlig leie</th>
              <th>Startdato</th>
              <th>Sluttdato</th>
              <th style={{ textAlign: 'right' }}>Gjenstående</th>
              <th style={{ textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {buildingContracts.map((contract) => (
              <ContractRow key={contract.id} contract={contract} />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="contract-table__empty-state">
          <p className="contract-table__empty-title">Ingen kontrakter registrert</p>
          <p className="contract-table__empty-desc">
            Legg til leiekontrakter for å beregne WAULT, utleiegrad og leieinntekter.
          </p>
        </div>
      )}

      {showModal && <ContractModal buildingId={buildingId} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function ContractRow({ contract }: { contract: Contract }) {
  return (
    <tr className={contract.tenantIsBankrupt ? 'contract-table__row--bankrupt' : ''}>
      <td>
        <div className="contract-table__tenant">
          {contract.tenantName}
          {contract.tenantIsBankrupt && (
            <span className="contract-table__bankrupt-badge">KONKURS</span>
          )}
        </div>
      </td>
      <td>{contract.areaType}</td>
      <td style={{ textAlign: 'right' }}>{formatM2(contract.areaM2)}</td>
      <td style={{ textAlign: 'right' }}>{formatNOK(contract.annualRent)}</td>
      <td>{contract.startDate}</td>
      <td>{contract.endDate}</td>
      <td style={{ textAlign: 'right' }}>
        {contract.remainingTermYears > 0 ? formatYears(contract.remainingTermYears) : '—'}
      </td>
      <td style={{ textAlign: 'center' }}>
        <span className={`contract-table__badge ${statusClass(contract.status)}`}>
          {statusLabel(contract.status)}
        </span>
      </td>
    </tr>
  );
}
