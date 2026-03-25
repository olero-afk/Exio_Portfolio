import { formatNOK, formatPercent, formatM2 } from '../../utils/formatters.ts';
import type { Building } from '../../types/index.ts';
import './BuildingInfo.css';

interface BuildingInfoProps {
  building: Building;
}

export function BuildingInfo({ building }: BuildingInfoProps) {
  const rows: { label: string; value: string | null }[] = [
    { label: 'Bygningstype', value: building.buildingType },
    { label: 'Energimerking', value: building.energyLabel },
    { label: 'Standard', value: building.standard },
    { label: 'Konstruksjonsår', value: building.yearBuilt?.toString() ?? null },
    { label: 'Antall etasjer', value: building.numberOfFloors?.toString() ?? null },
    { label: 'Tomteareal', value: building.plotAreaM2 ? formatM2(building.plotAreaM2) : null },
    { label: 'Markedsleie', value: building.marketRentPerM2 ? `${formatNOK(building.marketRentPerM2)}/m²` : null },
    { label: 'Markedsverdi', value: building.estimatedMarketValue ? formatNOK(building.estimatedMarketValue) : null },
    { label: 'Kjøpspris', value: building.purchasePrice ? formatNOK(building.purchasePrice) : null },
    { label: 'Utleiegrad', value: formatPercent(building.occupancyRate * 100) },
    { label: 'Eier (Hjemmelshaver)', value: building.ownerName },
    { label: 'Kilde', value: building.source },
  ];

  return (
    <div className="building-info">
      <h3 className="building-info__title">EIENDOMSINFORMASJON</h3>
      <dl className="building-info__list">
        {rows.map((row) =>
          row.value ? (
            <div key={row.label} className="building-info__row">
              <dt className="building-info__label">{row.label}</dt>
              <dd className="building-info__value">{row.value}</dd>
            </div>
          ) : null,
        )}
      </dl>
      {building.ownershipMismatch && (
        <div className="building-info__warning">
          Eier i PlacePoint samsvarer ikke med selskap i BRREG
        </div>
      )}
    </div>
  );
}
