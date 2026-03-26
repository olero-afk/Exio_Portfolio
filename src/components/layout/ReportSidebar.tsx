import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { usePersona } from '../../context/PersonaContext.tsx';
import { useFilterContext } from '../../context/FilterContext.tsx';
import './ReportSidebar.css';

export function ReportSidebar() {
  const { buildings, funds } = usePortfolioContext();
  const { config, clients } = usePersona();
  const { selectedFundId, setSelectedFundId, selectedBuildingId, setSelectedBuildingId } = useFilterContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeBuildings = buildings.filter((b) => !b.isArchived);

  let groups: { id: string; name: string; buildingIds: string[] }[];
  if (config.sidebarGrouping === 'fund') {
    groups = funds.map((f) => ({ id: f.id, name: f.name, buildingIds: f.buildingIds }));
  } else if (config.sidebarGrouping === 'client') {
    groups = clients.map((c) => ({ id: c.id, name: c.name, buildingIds: c.buildingIds }));
  } else {
    groups = [{ id: 'all', name: 'Min portefølje', buildingIds: activeBuildings.map((b) => b.id) }];
  }

  function handleGroupClick(groupId: string) {
    if (selectedFundId === groupId && !selectedBuildingId) {
      // Deselect
      setSelectedFundId(null);
    } else {
      setSelectedFundId(groupId === 'all' ? null : groupId);
      setSelectedBuildingId(null);
    }
  }

  function handleBuildingClick(buildingId: string) {
    if (selectedBuildingId === buildingId) {
      setSelectedBuildingId(null);
    } else {
      setSelectedBuildingId(buildingId);
    }
  }

  const isGroupActive = (groupId: string) => {
    if (groupId === 'all') return !selectedFundId && !selectedBuildingId;
    return selectedFundId === groupId && !selectedBuildingId;
  };

  return (
    <aside className={`rsb ${isCollapsed ? 'rsb--collapsed' : ''}`}>
      <div className="rsb__header">
        {!isCollapsed && <span className="rsb__title">Filter</span>}
        <button className="rsb__toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      {!isCollapsed && (
        <nav className="rsb__tree">
          {/* Reset / show all */}
          <button
            className={`rsb__reset ${!selectedFundId && !selectedBuildingId ? 'rsb__reset--active' : ''}`}
            onClick={() => { setSelectedFundId(null); setSelectedBuildingId(null); }}
          >
            Hele porteføljen
          </button>

          {groups.map((group) => (
            <PortfolioGroup
              key={group.id}
              name={group.name}
              buildings={activeBuildings.filter((b) => group.buildingIds.includes(b.id))}
              isGroupActive={isGroupActive(group.id)}
              selectedBuildingId={selectedBuildingId}
              onGroupClick={() => handleGroupClick(group.id)}
              onBuildingClick={handleBuildingClick}
            />
          ))}
        </nav>
      )}
    </aside>
  );
}

function PortfolioGroup({ name, buildings, isGroupActive, selectedBuildingId, onGroupClick, onBuildingClick }: {
  name: string;
  buildings: { id: string; name: string; buildingType: string }[];
  isGroupActive: boolean;
  selectedBuildingId: string | null;
  onGroupClick: () => void;
  onBuildingClick: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rsb__group">
      <div className="rsb__group-row">
        <button className="rsb__group-expand" onClick={() => setIsExpanded(!isExpanded)}>
          <span className={`rsb__chevron ${isExpanded ? 'rsb__chevron--open' : ''}`}>›</span>
        </button>
        <button
          className={`rsb__group-filter ${isGroupActive ? 'rsb__group-filter--active' : ''}`}
          onClick={onGroupClick}
        >
          <span className="rsb__group-name">{name}</span>
          <span className="rsb__group-count">{buildings.length}</span>
        </button>
      </div>
      {isExpanded && (
        <ul className="rsb__buildings">
          {buildings.map((b) => (
            <li key={b.id} className="rsb__building-row">
              <button
                className={`rsb__building-filter ${selectedBuildingId === b.id ? 'rsb__building-filter--active' : ''}`}
                onClick={() => onBuildingClick(b.id)}
              >
                <span className="rsb__building-name">{b.name}</span>
                <span className="rsb__building-type">{b.buildingType}</span>
              </button>
              <Link to={`/bygg/${b.id}`} className="rsb__building-nav" title="Åpne i Portefølje">
                →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
