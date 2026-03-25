import { formatM2 } from '../../utils/formatters.ts';
import type { Building } from '../../types/index.ts';
import './AreaCards.css';

interface AreaCardsProps {
  building: Building;
}

export function AreaCards({ building }: AreaCardsProps) {
  const ledigM2 = building.totalRentableM2 - building.committedM2;

  const cards = [
    { label: 'TOTALT', value: formatM2(building.totalAreaM2), variant: '' },
    { label: 'LEDIG EKSLUSIVT', value: formatM2(ledigM2), variant: ledigM2 > 0 ? 'warning' : '' },
    { label: 'UTLEID EKSLUSIVT', value: formatM2(building.committedM2), variant: 'success' },
    { label: 'FELLESAREAL TOTALT', value: formatM2(building.totalCommonAreaM2), variant: '' },
  ];

  return (
    <div className="area-cards">
      {cards.map((card) => (
        <div key={card.label} className={`area-cards__card ${card.variant ? `area-cards__card--${card.variant}` : ''}`}>
          <span className="area-cards__label">{card.label}</span>
          <span className="area-cards__value">{card.value}</span>
        </div>
      ))}
    </div>
  );
}
