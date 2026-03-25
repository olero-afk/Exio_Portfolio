import { useState, useMemo } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import type { Building, AreaUnit } from '../../types/index.ts';
import './Sidebar.css';

interface BuildingGroup {
  groupName: string;
  units: AreaUnit[];
}

function groupAreaUnits(units: AreaUnit[]): BuildingGroup[] {
  const map = new Map<string, AreaUnit[]>();
  for (const unit of units) {
    const key = unit.groupName ?? 'Øvrig';
    const group = map.get(key);
    if (group) {
      group.push(unit);
    } else {
      map.set(key, [unit]);
    }
  }
  return Array.from(map.entries()).map(([groupName, groupUnits]) => ({
    groupName,
    units: groupUnits,
  }));
}

function BuildingTreeItem({ building, areaUnits }: { building: Building; areaUnits: AreaUnit[] }) {
  const { buildingId } = useParams();
  const isActive = buildingId === building.id;
  const [isExpanded, setIsExpanded] = useState(isActive);

  const groups = useMemo(() => groupAreaUnits(areaUnits), [areaUnits]);
  const hasUnits = groups.length > 0;

  return (
    <li className="sidebar__building">
      <div className={`sidebar__building-header ${isActive ? 'sidebar__building-header--active' : ''}`}>
        {hasUnits && (
          <button
            className={`sidebar__toggle ${isExpanded ? 'sidebar__toggle--open' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Lukk' : 'Åpne'}
          >
            ›
          </button>
        )}
        <NavLink
          to={`/bygg/${building.id}`}
          className="sidebar__building-link"
        >
          <span className="sidebar__building-name">{building.name}</span>
          <span className="sidebar__building-type">{building.buildingType}</span>
        </NavLink>
      </div>

      {isExpanded && hasUnits && (
        <ul className="sidebar__groups">
          {groups.map((group) => (
            <SidebarGroup key={group.groupName} group={group} />
          ))}
        </ul>
      )}
    </li>
  );
}

function SidebarGroup({ group }: { group: BuildingGroup }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li className="sidebar__group">
      <button
        className="sidebar__group-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={`sidebar__toggle sidebar__toggle--small ${isExpanded ? 'sidebar__toggle--open' : ''}`}>
          ›
        </span>
        <span className="sidebar__group-name">{group.groupName}</span>
        <span className="sidebar__group-count">{group.units.length}</span>
      </button>

      {isExpanded && (
        <ul className="sidebar__units">
          {group.units.map((unit) => (
            <li key={unit.id} className="sidebar__unit">
              <span className="sidebar__unit-name">{unit.name}</span>
              <span className={`sidebar__unit-status ${unit.isLeased ? 'sidebar__unit-status--leased' : 'sidebar__unit-status--vacant'}`}>
                {unit.isLeased ? 'Utleid' : 'Ledig'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function Sidebar() {
  const { buildings, areaUnits } = usePortfolioContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const areaUnitsByBuilding = useMemo(() => {
    const map = new Map<string, AreaUnit[]>();
    for (const unit of areaUnits) {
      const group = map.get(unit.buildingId);
      if (group) {
        group.push(unit);
      } else {
        map.set(unit.buildingId, [unit]);
      }
    }
    return map;
  }, [areaUnits]);

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        {!isCollapsed && (
          <span className="sidebar__title">Bygninger</span>
        )}
        <button
          className="sidebar__collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Utvid sidepanel' : 'Lukk sidepanel'}
        >
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      {!isCollapsed && (
        <ul className="sidebar__tree">
          {buildings
            .filter((b) => !b.isArchived)
            .map((building) => (
              <BuildingTreeItem
                key={building.id}
                building={building}
                areaUnits={areaUnitsByBuilding.get(building.id) ?? []}
              />
            ))}
        </ul>
      )}
    </aside>
  );
}
