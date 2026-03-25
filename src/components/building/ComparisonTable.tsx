import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, formatYears, formatM2 } from '../../utils/formatters.ts';
import type { Building } from '../../types/index.ts';
import './ComparisonTable.css';

interface ComparisonTableProps {
  buildings: Building[];
}

interface RowData {
  building: Building;
  noi: number;
  wault: number;
  vacancyCost: number;
  costPerM2: number;
}

type SortKey = 'name' | 'noi' | 'occupancy' | 'wault' | 'vacancyCost' | 'costPerM2' | 'totalM2';

export function ComparisonTable({ buildings }: ComparisonTableProps) {
  const { contracts, costs } = usePortfolioContext();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const rows: RowData[] = useMemo(() =>
    buildings.map((b) => {
      const active = contracts.filter(
        (c) => c.buildingId === b.id && (c.status === 'active' || c.status === 'expiring_soon'),
      );
      const income = active.reduce((s, c) => s + c.annualRent, 0);
      const bc = costs.filter((c) => c.buildingId === b.id);
      const ms = new Set(bc.map((c) => `${c.year}-${c.month}`)).size;
      const totalCost = bc.reduce((s, c) => s + c.amount, 0);
      const annualized = ms > 0 ? (totalCost / ms) * 12 : 0;

      const totalRent = active.reduce((s, c) => s + c.annualRent, 0);
      const wault = totalRent > 0
        ? active.reduce((sum, c) => sum + Math.max(0, c.remainingTermYears) * c.annualRent, 0) / totalRent
        : 0;

      return {
        building: b,
        noi: income - annualized,
        wault,
        vacancyCost: (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0),
        costPerM2: b.totalRentableM2 > 0 ? annualized / b.totalRentableM2 : 0,
      };
    }),
  [buildings, contracts, costs]);

  const sorted = useMemo(() => {
    const s = [...rows];
    const dir = sortAsc ? 1 : -1;
    s.sort((a, b) => {
      switch (sortKey) {
        case 'name': return dir * a.building.name.localeCompare(b.building.name);
        case 'noi': return dir * (a.noi - b.noi);
        case 'occupancy': return dir * (a.building.occupancyRate - b.building.occupancyRate);
        case 'wault': return dir * (a.wault - b.wault);
        case 'vacancyCost': return dir * (a.vacancyCost - b.vacancyCost);
        case 'costPerM2': return dir * (a.costPerM2 - b.costPerM2);
        case 'totalM2': return dir * (a.building.totalAreaM2 - b.building.totalAreaM2);
        default: return 0;
      }
    });
    return s;
  }, [rows, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return '';
    return sortAsc ? ' ↑' : ' ↓';
  }

  return (
    <div className="comparison-table">
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} className="comparison-table__sortable">Bygning{sortIndicator('name')}</th>
            <th>Type</th>
            <th onClick={() => handleSort('noi')} className="comparison-table__sortable" style={{ textAlign: 'right' }}>NOI{sortIndicator('noi')}</th>
            <th onClick={() => handleSort('occupancy')} className="comparison-table__sortable" style={{ textAlign: 'right' }}>Utleiegrad{sortIndicator('occupancy')}</th>
            <th onClick={() => handleSort('wault')} className="comparison-table__sortable" style={{ textAlign: 'right' }}>WAULT{sortIndicator('wault')}</th>
            <th onClick={() => handleSort('vacancyCost')} className="comparison-table__sortable" style={{ textAlign: 'right' }}>Ledighetskostnad{sortIndicator('vacancyCost')}</th>
            <th onClick={() => handleSort('costPerM2')} className="comparison-table__sortable" style={{ textAlign: 'right' }}>Kostnad/m²{sortIndicator('costPerM2')}</th>
            <th onClick={() => handleSort('totalM2')} className="comparison-table__sortable" style={{ textAlign: 'right' }}>Total m²{sortIndicator('totalM2')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.building.id}>
              <td>
                <Link to={`/bygg/${row.building.id}`} className="comparison-table__link">
                  {row.building.name}
                </Link>
              </td>
              <td>{row.building.buildingType}</td>
              <td style={{ textAlign: 'right' }}>{formatNOK(row.noi)}</td>
              <td style={{ textAlign: 'right' }}>{formatPercent(row.building.occupancyRate * 100)}</td>
              <td style={{ textAlign: 'right' }}>{formatYears(row.wault)}</td>
              <td style={{ textAlign: 'right' }}>{formatNOK(row.vacancyCost)}</td>
              <td style={{ textAlign: 'right' }}>{formatNOK(row.costPerM2)}</td>
              <td style={{ textAlign: 'right' }}>{formatM2(row.building.totalAreaM2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
