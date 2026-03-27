import { useState, useMemo } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { usePersona } from '../../context/PersonaContext.tsx';
import type { Building, AreaUnit } from '../../types/index.ts';
import './Sidebar.css';

interface UnitGroup {
  groupName: string;
  units: AreaUnit[];
}

function groupAreaUnits(units: AreaUnit[]): UnitGroup[] {
  const map = new Map<string, AreaUnit[]>();
  for (const unit of units) {
    const key = unit.groupName ?? 'Øvrig';
    const existing = map.get(key);
    if (existing) existing.push(unit);
    else map.set(key, [unit]);
  }
  return Array.from(map.entries()).map(([groupName, groupUnits]) => ({ groupName, units: groupUnits }));
}

function BuildingTreeItem({ building, areaUnits }: { building: Building; areaUnits: AreaUnit[] }) {
  const { buildingId } = useParams();
  const isActive = buildingId === building.id;
  const [isExpanded, setIsExpanded] = useState(false);
  const groups = useMemo(() => groupAreaUnits(areaUnits), [areaUnits]);
  const hasUnits = groups.length > 0;

  return (
    <li className="sidebar__building">
      <div className={`sidebar__building-header ${isActive ? 'sidebar__building-header--active' : ''}`}>
        {hasUnits && (
          <button className={`sidebar__toggle ${isExpanded ? 'sidebar__toggle--open' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>›</button>
        )}
        <NavLink to={`/bygg/${building.id}`} className="sidebar__building-link">
          <span className="sidebar__building-name">{building.name}</span>
          <span className="sidebar__building-type">{building.buildingType}</span>
        </NavLink>
      </div>
      {isExpanded && hasUnits && (
        <ul className="sidebar__groups">
          {groups.map((group) => (
            <SidebarUnitGroup key={group.groupName} group={group} />
          ))}
        </ul>
      )}
    </li>
  );
}

function SidebarUnitGroup({ group }: { group: UnitGroup }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <li className="sidebar__group">
      <button className="sidebar__group-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className={`sidebar__toggle sidebar__toggle--small ${isExpanded ? 'sidebar__toggle--open' : ''}`}>›</span>
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

interface TopLevelGroup {
  id: string;
  name: string;
  buildings: Building[];
}

export function Sidebar() {
  const { buildings, areaUnits, funds } = usePortfolioContext();
  const { config, clients } = usePersona();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const areaUnitsByBuilding = useMemo(() => {
    const map = new Map<string, AreaUnit[]>();
    for (const unit of areaUnits) {
      const existing = map.get(unit.buildingId);
      if (existing) existing.push(unit);
      else map.set(unit.buildingId, [unit]);
    }
    return map;
  }, [areaUnits]);

  const activeBuildings = buildings.filter((b) => !b.isArchived);

  // Group buildings by persona's sidebar mode
  const topGroups: TopLevelGroup[] | null = useMemo(() => {
    if (config.sidebarGrouping === 'fund') {
      return funds.map((f) => ({
        id: f.id,
        name: f.name,
        buildings: activeBuildings.filter((b) => f.buildingIds.includes(b.id)),
      }));
    }
    if (config.sidebarGrouping === 'client') {
      return clients.map((c) => ({
        id: c.id,
        name: c.name,
        buildings: activeBuildings.filter((b) => c.buildingIds.includes(b.id)),
      }));
    }
    return null; // flat
  }, [config.sidebarGrouping, funds, clients, activeBuildings]);

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        {!isCollapsed && <span className="sidebar__title">Bygg</span>}
        <button className="sidebar__collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      {!isCollapsed && (
        <ul className="sidebar__tree">
          {topGroups ? (
            topGroups.map((group) => (
              <SidebarTopGroup key={group.id} group={group} areaUnitsByBuilding={areaUnitsByBuilding} />
            ))
          ) : (
            activeBuildings.map((building) => (
              <BuildingTreeItem key={building.id} building={building} areaUnits={areaUnitsByBuilding.get(building.id) ?? []} />
            ))
          )}
        </ul>
      )}
    </aside>
  );
}

function SidebarTopGroup({ group, areaUnitsByBuilding }: { group: TopLevelGroup; areaUnitsByBuilding: Map<string, AreaUnit[]> }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <li className="sidebar__top-group">
      <button className="sidebar__top-group-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className={`sidebar__toggle ${isExpanded ? 'sidebar__toggle--open' : ''}`}>›</span>
        <span className="sidebar__top-group-name">{group.name}</span>
        <span className="sidebar__group-count">{group.buildings.length}</span>
      </button>
      {isExpanded && (
        <ul className="sidebar__top-group-list">
          {group.buildings.map((building) => (
            <BuildingTreeItem key={building.id} building={building} areaUnits={areaUnitsByBuilding.get(building.id) ?? []} />
          ))}
        </ul>
      )}
    </li>
  );
}
