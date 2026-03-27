import { useState, useCallback } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { discoverBuildings, type PlacePointBuilding } from '../../data/placepoint/buildings.ts';
import type { Building, AreaUnit } from '../../types/index.ts';
import './AddBuildingModal.css';

const ENERGY_COLORS: Record<string, string> = {
  A: '#16a34a', B: '#22c55e', C: '#84cc16', D: '#eab308', E: '#f97316', F: '#ef4444', G: '#991b1b',
};

function mapBuildingType(beskrivelse: string): Building['buildingType'] {
  const map: Record<string, Building['buildingType']> = {
    'Kontorbygg': 'Kontor', 'Lagerbygg': 'LogistikkLager', 'Butikkbygning': 'Handel',
  };
  return map[beskrivelse] ?? 'Kombinasjon';
}

function mapEnergyLabel(karakter: string | null): Building['energyLabel'] {
  if (!karakter) return null;
  const valid = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  return valid.includes(karakter) ? (karakter as Building['energyLabel']) : null;
}

function convertToBuilding(ppb: PlacePointBuilding, portfolioId: string): { building: Building; areaUnits: AreaUnit[] } {
  const buildingId = `b-add-${ppb.id}`;
  const rentableUnits = ppb.bruksenheter.filter((u) => u.bruksformaal !== 'Fellesareal');
  const commonUnits = ppb.bruksenheter.filter((u) => u.bruksformaal === 'Fellesareal');
  const totalRentable = rentableUnits.reduce((s, u) => s + u.bruksareal, 0);
  const totalCommon = commonUnits.reduce((s, u) => s + u.bruksareal, 0);

  const building: Building = {
    id: buildingId,
    portfolioId,
    name: ppb.adresse.adressetekst,
    address: {
      street: ppb.adresse.adressetekst,
      postalCode: ppb.adresse.postnummer,
      municipality: ppb.adresse.kommunenavn,
      country: 'Norge',
    },
    coordinates: { lat: ppb.adresse.koordinater.lat, lng: ppb.adresse.koordinater.lon },
    matrikkelNr: `${ppb.matrikkelNummer.kommunenummer}-${ppb.matrikkelNummer.gaardsnummer}/${ppb.matrikkelNummer.bruksnummer}`,
    buildingType: mapBuildingType(ppb.bygningstype.beskrivelse),
    yearBuilt: ppb.byggeaar,
    numberOfFloors: ppb.antallEtasjer,
    energyLabel: mapEnergyLabel(ppb.energimerke?.karakter ?? null),
    plotAreaM2: ppb.tomteareal,
    ownerName: ppb.hjemmelshaver.navn,
    ownershipMismatch: false,
    priceStatsPerM2: ppb.prisstatistikk?.prisPerKvm ?? null,
    marketRentPerM2: ppb.bygningstype.beskrivelse === 'Lagerbygg' ? 1200 : ppb.bygningstype.beskrivelse === 'Butikkbygning' ? 2800 : 2400,
    purchasePrice: null,
    estimatedMarketValue: (ppb.bruksareal ?? 0) * (ppb.prisstatistikk?.prisPerKvm ?? 40000),
    acquisitionDate: null,
    totalAreaM2: ppb.bruksareal ?? 0,
    totalRentableM2: totalRentable,
    totalCommonAreaM2: totalCommon,
    committedM2: 0,
    occupancyRate: 0,
    vacancyRate: 1,
    standard: null,
    isArchived: false,
    source: 'placepoint',
  };

  const areaUnits: AreaUnit[] = ppb.bruksenheter.map((unit, ui) => ({
    id: `au-add-${buildingId}-${ui}`,
    buildingId,
    name: `${unit.bruksformaal} — ${unit.bruksenhetsnummer}`,
    areaType: mapBuildingType(unit.bruksformaal === 'Lager' ? 'Lagerbygg' : unit.bruksformaal === 'Butikk' ? 'Butikkbygning' : 'Kontorbygg'),
    classification: unit.bruksformaal === 'Fellesareal' ? 'fellesareal' as const : 'ekslusivt' as const,
    areaM2: unit.bruksareal,
    floor: ui + 1,
    groupName: `${ui + 1}. Etg`,
    isLeased: false,
    source: 'placepoint' as const,
  }));

  return { building, areaUnits };
}

interface AddBuildingModalProps {
  onClose: () => void;
}

export function AddBuildingModal({ onClose }: AddBuildingModalProps) {
  const { addBuildingsToActiveKundebase, activeKundebase, buildings: existingBuildings } = usePortfolioContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlacePointBuilding[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter out buildings that already exist (by matrikkelNr match)
  const existingMatrikkels = new Set(existingBuildings.map((b) => b.matrikkelNr).filter(Boolean));

  const handleSearch = useCallback(async () => {
    setLoading(true);
    // In production this would search by query; mock returns all
    const buildings = await discoverBuildings(activeKundebase.orgNr || '923456789');
    // Filter out already-added buildings
    const filtered = buildings.filter((b) => {
      const mk = `${b.matrikkelNummer.kommunenummer}-${b.matrikkelNummer.gaardsnummer}/${b.matrikkelNummer.bruksnummer}`;
      return !existingMatrikkels.has(mk);
    });
    setResults(filtered);
    setHasSearched(true);
    setLoading(false);
  }, [activeKundebase.orgNr, existingMatrikkels]);

  function toggleBuilding(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(results.map((b) => b.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  function handleAdd() {
    const selected = results.filter((b) => selectedIds.has(b.id));
    const portfolioId = activeKundebase.portfolios[0]?.id ?? 'p-001';

    const allBuildings: Building[] = [];
    const allAreaUnits: AreaUnit[] = [];

    for (const ppb of selected) {
      const { building, areaUnits } = convertToBuilding(ppb, portfolioId);
      allBuildings.push(building);
      allAreaUnits.push(...areaUnits);
    }

    addBuildingsToActiveKundebase(allBuildings, allAreaUnits);
    onClose();
  }

  const allSelected = results.length > 0 && selectedIds.size === results.length;

  return (
    <div className="add-building-overlay" onClick={onClose}>
      <div className="add-building-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-building-modal__header">
          <div>
            <h2 className="add-building-modal__title">Legg til bygg</h2>
            <p className="add-building-modal__subtitle">
              Søk etter bygg via adresse, matrikkel eller org.nr. Vi henter data fra PlacePoint.
            </p>
          </div>
          <button className="add-building-modal__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="add-building-modal__search">
          <input
            className="add-building-modal__input"
            type="text"
            placeholder="Søk etter bygg via adresse, matrikkel eller org.nr."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            autoFocus
          />
          <button
            className="add-building-modal__search-btn"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Søker...' : 'Søk'}
          </button>
        </div>

        <div className="add-building-modal__body">
          {loading && (
            <div className="add-building-modal__loading">
              <div className="add-building-modal__spinner" />
              Henter bygningsdata fra PlacePoint...
            </div>
          )}

          {hasSearched && !loading && results.length === 0 && (
            <div className="add-building-modal__empty">
              Ingen nye bygg funnet. Alle tilgjengelige bygg er allerede lagt til.
            </div>
          )}

          {hasSearched && !loading && results.length > 0 && (
            <>
              <div className="add-building-modal__toolbar">
                <button className="add-building-modal__toggle-all" onClick={allSelected ? deselectAll : selectAll}>
                  {allSelected ? 'Fjern alle' : 'Velg alle'}
                </button>
                <span className="add-building-modal__counter">
                  {selectedIds.size} av {results.length} valgt
                </span>
              </div>

              <div className="add-building-modal__list">
                {results.map((b) => {
                  const selected = selectedIds.has(b.id);
                  return (
                    <div
                      key={b.id}
                      className={`add-building-modal__card ${selected ? 'add-building-modal__card--selected' : ''}`}
                      onClick={() => toggleBuilding(b.id)}
                    >
                      <div className={`add-building-modal__checkbox ${selected ? 'add-building-modal__checkbox--checked' : ''}`}>
                        {selected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="add-building-modal__card-content">
                        <div className="add-building-modal__card-top">
                          <span className="add-building-modal__card-address">{b.adresse.adressetekst}</span>
                          <span className="add-building-modal__card-type">{b.bygningstype.beskrivelse}</span>
                          {b.byggeaar && <span className="add-building-modal__card-year">{b.byggeaar}</span>}
                        </div>
                        <div className="add-building-modal__card-meta">
                          {b.bruksareal && <span>{b.bruksareal.toLocaleString('nb-NO')} m²</span>}
                          {b.antallEtasjer && <span>{b.antallEtasjer} etasjer</span>}
                          {b.energimerke?.karakter && (
                            <span className="add-building-modal__energy" style={{ background: ENERGY_COLORS[b.energimerke.karakter] }}>
                              {b.energimerke.karakter}
                            </span>
                          )}
                        </div>
                        <span className="add-building-modal__card-owner">
                          Hjemmelshaver: {b.hjemmelshaver.navn}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="add-building-modal__footer">
          <button className="add-building-modal__btn-cancel" onClick={onClose}>Avbryt</button>
          <button
            className="add-building-modal__btn-add"
            disabled={selectedIds.size === 0}
            onClick={handleAdd}
          >
            Legg til {selectedIds.size > 0 ? `${selectedIds.size} bygg` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
