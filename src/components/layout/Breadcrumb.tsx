import { Link, useLocation } from 'react-router-dom';
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
  leietakere: 'LEIETAKERE',
  eiere: 'EIERE',
  forvalter: 'FORVALTER',
  energi: 'ENERGI',
  styrerapport: 'STYRERAPPORT',
  fond: 'FOND',
};

export function Breadcrumb() {
  const location = useLocation();
  const { buildings, funds } = usePortfolioContext();

  const pathParts = location.pathname.split('/').filter(Boolean);
  if (pathParts.length === 0) return null;

  const segments: BreadcrumbSegment[] = [];

  // Always start with PORTEFØLJE linking to dashboard
  segments.push({ label: 'PORTEFØLJE', to: '/' });

  // Determine which fund a building belongs to (for building detail breadcrumbs)
  function findFundForBuilding(buildingId: string) {
    return funds.find((f) => f.buildingIds.includes(buildingId));
  }

  if (pathParts[0] === 'fond' && pathParts[1]) {
    // /fond/:fondId or /fond/:fondId/...
    const fund = funds.find((f) => f.id === pathParts[1]);
    const fundLabel = fund?.name?.toUpperCase() ?? pathParts[1].toUpperCase();
    const isLast = pathParts.length === 2;
    segments.push({ label: fundLabel, to: isLast ? undefined : `/fond/${pathParts[1]}` });

    // Any sub-path after fond/:fondId
    for (let i = 2; i < pathParts.length; i++) {
      const isEnd = i === pathParts.length - 1;
      const part = pathParts[i];
      segments.push({
        label: routeLabels[part] ?? part.toUpperCase(),
        to: isEnd ? undefined : '/' + pathParts.slice(0, i + 1).join('/'),
      });
    }
  } else if (pathParts[0] === 'bygg') {
    if (pathParts[1]) {
      // /bygg/:buildingId/...
      const buildingId = pathParts[1];
      const building = buildings.find((b) => b.id === buildingId);
      const fund = findFundForBuilding(buildingId);

      // Insert fund level if building belongs to a fund
      if (fund) {
        segments.push({ label: fund.name.toUpperCase(), to: `/fond/${fund.id}` });
      }

      const buildingLabel = building?.name?.toUpperCase() ?? buildingId.toUpperCase();
      const isLast = pathParts.length === 2;
      segments.push({ label: buildingLabel, to: isLast ? undefined : `/bygg/${buildingId}` });

      // Sub-tab after building (arealer, avtaler, okonomi, etc.)
      for (let i = 2; i < pathParts.length; i++) {
        const isEnd = i === pathParts.length - 1;
        const part = pathParts[i];
        segments.push({
          label: routeLabels[part] ?? part.toUpperCase(),
          to: isEnd ? undefined : '/' + pathParts.slice(0, i + 1).join('/'),
        });
      }
    } else {
      // /bygg (building list)
      segments.push({ label: 'BYGG' });
    }
  } else if (pathParts[0] === 'rapporter') {
    segments.push({
      label: 'RAPPORTER',
      to: pathParts.length > 1 ? '/rapporter' : undefined,
    });
    for (let i = 1; i < pathParts.length; i++) {
      const isEnd = i === pathParts.length - 1;
      const part = pathParts[i];
      segments.push({
        label: routeLabels[part] ?? part.toUpperCase(),
        to: isEnd ? undefined : '/' + pathParts.slice(0, i + 1).join('/'),
      });
    }
  } else {
    // Other top-level routes
    const part = pathParts[0];
    segments.push({ label: routeLabels[part] ?? part.toUpperCase() });
  }

  // Remove PORTEFØLJE link if we're on the dashboard itself
  if (segments.length === 1 && segments[0].label === 'PORTEFØLJE') return null;

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
