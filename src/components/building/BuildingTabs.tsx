import { NavLink, useParams } from 'react-router-dom';
import './BuildingTabs.css';

const tabs = [
  { path: '', label: 'Sammendrag' },
  { path: '/arealer', label: 'Arealer' },
  { path: '/avtaler', label: 'Avtaler' },
  { path: '/leietakere', label: 'Leietakere' },
  { path: '/eiere', label: 'Eiere' },
  { path: '/forvalter', label: 'Forvalter' },
  { path: '/energi', label: 'Energi' },
  { path: '/okonomi', label: 'Økonomi' },
] as const;

export function BuildingTabs() {
  const { buildingId } = useParams();
  const base = `/bygg/${buildingId}`;

  return (
    <nav className="building-tabs">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={`${base}${tab.path}`}
          end
          className={({ isActive }) =>
            `building-tabs__tab ${isActive ? 'building-tabs__tab--active' : ''}`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
