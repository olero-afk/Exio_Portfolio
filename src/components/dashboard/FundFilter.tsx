import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { useFilterContext } from '../../context/FilterContext.tsx';
import './FundFilter.css';

export function FundFilter() {
  const { funds } = usePortfolioContext();
  const { selectedFundId, setSelectedFundId } = useFilterContext();

  return (
    <div className="fund-filter">
      <span className="fund-filter__label">FOND</span>
      <select
        className="fund-filter__select"
        value={selectedFundId ?? ''}
        onChange={(e) => setSelectedFundId(e.target.value || null)}
      >
        <option value="">Hele porteføljen</option>
        {funds.map((fund) => (
          <option key={fund.id} value={fund.id}>
            {fund.name}
          </option>
        ))}
      </select>
    </div>
  );
}
