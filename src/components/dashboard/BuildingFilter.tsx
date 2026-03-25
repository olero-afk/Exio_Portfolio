import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { useFilterContext } from '../../context/FilterContext.tsx';
import './BuildingFilter.css';

export function BuildingFilter() {
  const { buildings } = usePortfolioContext();
  const { selectedBuildingId, setSelectedBuildingId } = useFilterContext();

  return (
    <div className="building-filter">
      <span className="building-filter__label">BYGNINGER</span>
      <select
        className="building-filter__select"
        value={selectedBuildingId ?? ''}
        onChange={(e) => setSelectedBuildingId(e.target.value || null)}
      >
        <option value="">Alle bygninger</option>
        {buildings
          .filter((b) => !b.isArchived)
          .map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
      </select>
    </div>
  );
}
