import { formatNOK, formatPercent, formatM2 } from '../../utils/formatters.ts';
import type { Building } from '../../types/index.ts';
import './BuildingInfo.css';

function energyLabelInfo(building: Building) {
  if (!building.energyLabel) return null;
  const date = building.energyLabelDate;
  if (!date) return { label: building.energyLabel, year: null, validYear: null, warning: null };

  const issued = new Date(date);
  const validUntil = new Date(issued);
  validUntil.setFullYear(validUntil.getFullYear() + 10);
  const now = new Date();
  const isExpired = validUntil < now;
  const oneYearFromNow = new Date(now);
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const isExpiringSoon = !isExpired && validUntil < oneYearFromNow;

  return {
    label: building.energyLabel,
    year: issued.getFullYear(),
    validYear: validUntil.getFullYear(),
    warning: isExpired ? 'expired' as const : isExpiringSoon ? 'expiring' as const : null,
  };
}

interface BuildingInfoProps {
  building: Building;
}

function EnergyLabelDisplay({ building }: { building: Building }) {
  const info = energyLabelInfo(building);
  if (!info) return <span>—</span>;
  if (!info.year) return <span>{info.label}</span>;
  if (info.warning === 'expired') {
    return <span>{info.label} ({info.year}) · <span style={{ color: '#f87171' }}>⚠ Utløpt {info.validYear} — ny merking påkrevd</span></span>;
  }
  if (info.warning === 'expiring') {
    return <span>{info.label} ({info.year}) · <span style={{ color: '#facc15' }}>⚠ Utløper {info.validYear}</span></span>;
  }
  return <span>{info.label} ({info.year}) · Gyldig til {info.validYear}</span>;
}

export function BuildingInfo({ building }: BuildingInfoProps) {
  const rows: { label: string; value: string | null }[] = [
    { label: 'Bygningstype', value: building.buildingType },
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
        <div className="building-info__row">
          <dt className="building-info__label">Energimerking</dt>
          <dd className="building-info__value"><EnergyLabelDisplay building={building} /></dd>
        </div>
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
