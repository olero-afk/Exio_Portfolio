import { Link, useLocation, useParams } from 'react-router-dom';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import './Breadcrumb.css';

interface BreadcrumbSegment {
  label: string;
  to?: string;
}

const routeLabels: Record<string, string> = {
  bygg: 'BYGG',
  rapporter: 'RAPPORTER',
  avtaler: 'AVTALER',
  produkter: 'PRODUKTER',
  aktoerer: 'AKTØRER',
  sammenlign: 'SAMMENLIGN',
  innstillinger: 'INNSTILLINGER',
  arealer: 'AREALER',
  okonomi: 'ØKONOMI',
  styrerapport: 'STYRERAPPORT',
};

export function Breadcrumb() {
  const location = useLocation();
  const { buildingId } = useParams();
  const { buildings } = usePortfolioContext();

  const segments: BreadcrumbSegment[] = [];
  const pathParts = location.pathname.split('/').filter(Boolean);

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    const path = '/' + pathParts.slice(0, i + 1).join('/');

    if (part === buildingId) {
      const building = buildings.find((b) => b.id === part);
      segments.push({
        label: building?.name?.toUpperCase() ?? part.toUpperCase(),
        to: i < pathParts.length - 1 ? path : undefined,
      });
    } else {
      segments.push({
        label: routeLabels[part] ?? part.toUpperCase(),
        to: i < pathParts.length - 1 ? path : undefined,
      });
    }
  }

  if (segments.length === 0) return null;

  return (
    <nav className="breadcrumb" aria-label="Brødsmulesti">
      {segments.map((segment, i) => (
        <span key={i} className="breadcrumb__item">
          {i > 0 && <span className="breadcrumb__separator">/</span>}
          {segment.to ? (
            <Link to={segment.to} className="breadcrumb__link">
              {segment.label}
            </Link>
          ) : (
            <span className="breadcrumb__current">{segment.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
