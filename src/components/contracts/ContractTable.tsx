import { useMemo } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatM2, formatYears } from '../../utils/formatters.ts';
import type { Contract } from '../../types/index.ts';
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

  const buildingContracts = useMemo(
    () => contracts
      .filter((c) => c.buildingId === buildingId)
      .sort((a, b) => {
        const order = { active: 0, expiring_soon: 1, future: 2, expired: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      }),
    [contracts, buildingId],
  );

  return (
    <div className="contract-table">
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
      {buildingContracts.length === 0 && (
        <p className="contract-table__empty">Ingen avtaler registrert</p>
      )}
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
