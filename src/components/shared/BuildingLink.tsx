import { Link } from 'react-router-dom';
import './BuildingLink.css';

interface BuildingLinkProps {
  buildingId: string;
  name: string;
  detail?: string;
}

export function BuildingLink({ buildingId, name, detail }: BuildingLinkProps) {
  return (
    <Link to={`/bygg/${buildingId}`} className="building-link">
      <span className="building-link__name">{name}</span>
      {detail && <span className="building-link__detail">{detail}</span>}
    </Link>
  );
}
