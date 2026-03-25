import { useMemo } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatM2 } from '../../utils/formatters.ts';
import type { AreaUnit } from '../../types/index.ts';
import './AreaTable.css';

interface AreaTableProps {
  buildingId: string;
}

interface GroupedUnits {
  groupName: string;
  units: AreaUnit[];
  totalM2: number;
}

export function AreaTable({ buildingId }: AreaTableProps) {
  const { areaUnits } = usePortfolioContext();

  const groups = useMemo(() => {
    const units = areaUnits.filter((u) => u.buildingId === buildingId);
    const map = new Map<string, AreaUnit[]>();
    for (const unit of units) {
      const key = unit.groupName ?? 'Øvrig';
      const existing = map.get(key);
      if (existing) existing.push(unit);
      else map.set(key, [unit]);
    }
    const result: GroupedUnits[] = [];
    for (const [groupName, groupUnits] of map) {
      result.push({
        groupName,
        units: groupUnits,
        totalM2: groupUnits.reduce((s, u) => s + u.areaM2, 0),
      });
    }
    return result;
  }, [areaUnits, buildingId]);

  return (
    <div className="area-table">
      <table>
        <thead>
          <tr>
            <th>Areal</th>
            <th>Type</th>
            <th>Klassifisering</th>
            <th style={{ textAlign: 'right' }}>m²</th>
            <th style={{ textAlign: 'center' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <GroupRows key={group.groupName} group={group} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupRows({ group }: { group: GroupedUnits }) {
  return (
    <>
      <tr className="area-table__group-row">
        <td colSpan={3}>
          <strong>{group.groupName}</strong>
        </td>
        <td style={{ textAlign: 'right' }}>
          <strong>{formatM2(group.totalM2)}</strong>
        </td>
        <td />
      </tr>
      {group.units.map((unit) => (
        <tr key={unit.id} className="area-table__unit-row">
          <td className="area-table__indent">{unit.name}</td>
          <td>{unit.areaType}</td>
          <td>{classificationLabel(unit.classification)}</td>
          <td style={{ textAlign: 'right' }}>{formatM2(unit.areaM2)}</td>
          <td style={{ textAlign: 'center' }}>
            <span className={`area-table__status ${unit.isLeased ? 'area-table__status--leased' : 'area-table__status--vacant'}`}>
              {unit.isLeased ? 'Utleid' : 'Ledig'}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}

function classificationLabel(c: string): string {
  switch (c) {
    case 'ekslusivt': return 'Ekslusivt';
    case 'fellesareal': return 'Fellesareal';
    case 'parkering': return 'Parkering';
    default: return c;
  }
}
