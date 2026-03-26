import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { usePersona } from '../../context/PersonaContext.tsx';
import './ReportSidebar.css';

export function ReportSidebar() {
  const { buildings, funds } = usePortfolioContext();
  const { config, clients } = usePersona();
  const { buildingId } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeBuildings = buildings.filter((b) => !b.isArchived);

  // Build groups based on persona
  let groups: { id: string; name: string; buildingIds: string[] }[];
  if (config.sidebarGrouping === 'fund') {
    groups = funds.map((f) => ({ id: f.id, name: f.name, buildingIds: f.buildingIds }));
  } else if (config.sidebarGrouping === 'client') {
    groups = clients.map((c) => ({ id: c.id, name: c.name, buildingIds: c.buildingIds }));
  } else {
    // Eier: single group with all buildings
    groups = [{ id: 'all', name: 'Min portefølje', buildingIds: activeBuildings.map((b) => b.id) }];
  }

  return (
    <aside className={`rsb ${isCollapsed ? 'rsb--collapsed' : ''}`}>
      <div className="rsb__header">
        {!isCollapsed && <span className="rsb__title">Portefølje</span>}
        <button className="rsb__toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      {!isCollapsed && (
        <nav className="rsb__tree">
          {groups.map((group) => (
            <PortfolioGroup
              key={group.id}
              name={group.name}
              buildings={activeBuildings.filter((b) => group.buildingIds.includes(b.id))}
              activeBuildingId={buildingId}
            />
          ))}
        </nav>
      )}
    </aside>
  );
}

function PortfolioGroup({ name, buildings, activeBuildingId }: {
  name: string;
  buildings: { id: string; name: string; buildingType: string }[];
  activeBuildingId?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rsb__group">
      <button className="rsb__group-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className={`rsb__chevron ${isExpanded ? 'rsb__chevron--open' : ''}`}>›</span>
        <span className="rsb__group-name">{name}</span>
        <span className="rsb__group-count">{buildings.length}</span>
      </button>
      {isExpanded && (
        <ul className="rsb__buildings">
          {buildings.map((b) => (
            <li key={b.id}>
              <NavLink
                to={`/bygg/${b.id}`}
                className={`rsb__building ${b.id === activeBuildingId ? 'rsb__building--active' : ''}`}
              >
                <span className="rsb__building-name">{b.name}</span>
                <span className="rsb__building-type">{b.buildingType}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
