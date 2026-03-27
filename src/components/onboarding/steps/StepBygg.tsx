import { useState, useCallback } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext.tsx';
import { discoverBuildings, summarizeBruksenheter, type PlacePointBuilding } from '../../../data/placepoint/buildings.ts';
import { detectRole, ROLE_COLORS, type DetectedRole } from '../../../utils/roleDetection.ts';
import { OnboardingLayout } from '../OnboardingLayout.tsx';
import './Steps.css';

const ENERGY_COLORS: Record<string, string> = {
  A: '#16a34a', B: '#22c55e', C: '#84cc16', D: '#eab308', E: '#f97316', F: '#ef4444', G: '#991b1b',
};

function BuildingCard({
  building,
  selected,
  role,
  onToggle,
  onRoleChange,
}: {
  building: PlacePointBuilding;
  selected: boolean;
  role: DetectedRole;
  onToggle: () => void;
  onRoleChange: (role: DetectedRole) => void;
}) {
  const b = building;
  const unitSummary = summarizeBruksenheter(b.bruksenheter);
  const lettableUnits = b.bruksenheter.filter((u) => u.bruksformaal !== 'Fellesareal' && u.bruksformaal !== 'Parkering');
  const lettableArea = lettableUnits.reduce((s, u) => s + u.bruksareal, 0);

  return (
    <div
      className={`disc-card ${selected ? 'disc-card--selected' : ''}`}
      onClick={onToggle}
    >
      <div className="disc-card__check">
        <div className={`disc-card__checkbox ${selected ? 'disc-card__checkbox--checked' : ''}`}>
          {selected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      <div className="disc-card__body">
        {/* Row 1: Address + type badge */}
        <div className="disc-card__row1">
          <span className="disc-card__address">
            {b.adresse.adressetekst}, {b.adresse.postnummer} {b.adresse.poststed}
          </span>
          <span className="disc-card__type-badge">{b.bygningstype.beskrivelse}</span>
        </div>

        {/* Row 2: Hjemmelshaver */}
        <div className="disc-card__owner">
          Hjemmelshaver: {b.hjemmelshaver.navn} ({b.hjemmelshaver.organisasjonsnummer})
        </div>

        {/* Row 3: Metadata */}
        <div className="disc-card__meta">
          <span><span className="disc-card__meta-label">Byggeår:</span> {b.byggeaar ?? '—'}</span>
          <span className="disc-card__sep">·</span>
          <span><span className="disc-card__meta-label">Etasjer:</span> {b.antallEtasjer ?? '—'}</span>
          <span className="disc-card__sep">·</span>
          <span><span className="disc-card__meta-label">BRA:</span> {(b.bruksareal ?? 0).toLocaleString('nb-NO')} m²</span>
        </div>

        {/* Row 4: Energy + plot */}
        <div className="disc-card__meta">
          <span className="disc-card__meta-label">Energimerke:</span>
          {b.energimerke?.karakter ? (
            <span className="disc-card__energy" style={{ background: ENERGY_COLORS[b.energimerke.karakter] }}>
              {b.energimerke.karakter}
            </span>
          ) : (
            <span className="disc-card__na">Mangler</span>
          )}
          {b.tomteareal && (
            <>
              <span className="disc-card__sep">·</span>
              <span><span className="disc-card__meta-label">Tomt:</span> {b.tomteareal.toLocaleString('nb-NO')} m²</span>
            </>
          )}
        </div>

        {/* Row 5: Bruksenheter summary */}
        <div className="disc-card__units">
          <span className="disc-card__meta-label">Bruksenheter:</span>
          <span>
            {lettableUnits.length} enheter ({unitSummary.map((u) => `${u.count} ${u.label.toLowerCase()}`).join(', ')})
          </span>
          <span className="disc-card__sep">·</span>
          <span>{lettableArea.toLocaleString('nb-NO')} m² utleibart</span>
        </div>

        {/* Row 6: Market rent */}
        {b.prisstatistikk?.prisPerKvm && (
          <div className="disc-card__market">
            Markedsleie ref: {b.prisstatistikk.prisPerKvm.toLocaleString('nb-NO')} kr/m²
            <span className="disc-card__market-source">{b.prisstatistikk.kilde}</span>
          </div>
        )}

        {/* Row 7: Role selector */}
        <div className="disc-card__role-row">
          <span className="disc-card__meta-label">Din rolle:</span>
          <select
            className="disc-card__role-select"
            style={{
              borderColor: `${ROLE_COLORS[role]}50`,
              color: ROLE_COLORS[role],
            }}
            value={role}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              onRoleChange(e.target.value as DetectedRole);
            }}
          >
            <option value="eier">Eier</option>
            <option value="investor">Investor</option>
            <option value="forvalter">Forvalter</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="disc-card disc-card--skeleton">
      <div className="disc-card__check">
        <div className="disc-card__checkbox disc-card__shimmer" />
      </div>
      <div className="disc-card__body">
        <div className="disc-card__shimmer disc-card__shimmer--title" />
        <div className="disc-card__shimmer disc-card__shimmer--subtitle" />
        <div className="disc-card__shimmer disc-card__shimmer--meta" />
        <div className="disc-card__shimmer disc-card__shimmer--meta2" />
      </div>
    </div>
  );
}

export function StepBygg() {
  const {
    company,
    konsernEntities,
    discoveredBuildings,
    setDiscoveredBuildings,
    selectedBuildingIds,
    toggleBuilding,
    selectAllBuildings,
    deselectAllBuildings,
    buildingRoles,
    setBuildingRoles,
    setStep,
  } = useOnboarding();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const konsernOrgNrs = konsernEntities.map((e) => e.organisasjonsnummer);

  const handleSearch = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    const buildings = await discoverBuildings(company.organisasjonsnummer);
    setDiscoveredBuildings(buildings);
    // Auto-detect roles for newly discovered buildings
    const roles = buildings.map((b) => {
      const detected = detectRole(b, company.organisasjonsnummer, konsernOrgNrs);
      return { buildingId: b.id, detectedRole: detected, confirmedRole: detected };
    });
    setBuildingRoles(roles);
    setLoading(false);
  }, [company, konsernOrgNrs, setDiscoveredBuildings, setBuildingRoles]);

  function handleNext() {
    // Ensure roles exist for all selected buildings
    const existing = new Set(buildingRoles.map((r) => r.buildingId));
    const newRoles = discoveredBuildings
      .filter((b) => selectedBuildingIds.includes(b.id) && !existing.has(b.id))
      .map((b) => {
        const detected = detectRole(b, company?.organisasjonsnummer ?? '', konsernOrgNrs);
        return { buildingId: b.id, detectedRole: detected, confirmedRole: detected };
      });
    if (newRoles.length > 0) {
      setBuildingRoles([...buildingRoles, ...newRoles]);
    }
    setStep(4);
  }

  function handleRoleChange(buildingId: string, role: DetectedRole) {
    const updated = buildingRoles.map((r) =>
      r.buildingId === buildingId ? { ...r, confirmedRole: role } : r,
    );
    // If building not in roles yet, add it
    if (!updated.some((r) => r.buildingId === buildingId)) {
      const b = discoveredBuildings.find((x) => x.id === buildingId);
      if (b) {
        updated.push({ buildingId, detectedRole: role, confirmedRole: role });
      }
    }
    setBuildingRoles(updated);
  }

  function getRoleForBuilding(buildingId: string): DetectedRole {
    const assignment = buildingRoles.find((r) => r.buildingId === buildingId);
    if (assignment) return assignment.confirmedRole;
    const b = discoveredBuildings.find((x) => x.id === buildingId);
    if (b) return detectRole(b, company?.organisasjonsnummer ?? '', konsernOrgNrs);
    return 'eier';
  }

  const allSelected = discoveredBuildings.length > 0 && selectedBuildingIds.length === discoveredBuildings.length;
  const hasBuildings = discoveredBuildings.length > 0;

  return (
    <OnboardingLayout
      onNext={handleNext}
      onBack={() => setStep(2)}
      nextDisabled={selectedBuildingIds.length === 0}
    >
      <h2 className="onb-heading">Bygg i porteføljen</h2>
      <p className="onb-subheading">
        {hasBuildings
          ? `${selectedBuildingIds.length} av ${discoveredBuildings.length} bygg valgt fra PlacePoint. Endre roller eller søk etter flere.`
          : 'Søk etter bygg via adresse, matrikkel eller organisasjonsnummer. Data hentes automatisk fra PlacePoint.'}
      </p>

      <div className="step-bygg__search-row">
        <input
          className="onb-input"
          type="text"
          placeholder="Søk etter bygg via adresse, matrikkel eller org.nr."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          className="onboarding__btn onboarding__btn--primary"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Søker...' : 'Søk i PlacePoint'}
        </button>
      </div>

      {/* Shimmer skeleton loading */}
      {loading && (
        <div className="step-bygg__skeleton-list">
          <div className="step-bygg__skeleton-label">Søker i PlacePoint...</div>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {hasBuildings && !loading && (
        <>
          <div className="step-bygg__toolbar">
            <button
              className="step-bygg__toggle-all"
              onClick={allSelected ? deselectAllBuildings : selectAllBuildings}
            >
              {allSelected ? 'Fjern alle' : 'Velg alle'}
            </button>
            <span className="step-bygg__counter">
              {selectedBuildingIds.length} av {discoveredBuildings.length} bygg valgt
            </span>
          </div>

          <div className="step-bygg__list">
            {discoveredBuildings.map((b) => (
              <BuildingCard
                key={b.id}
                building={b}
                selected={selectedBuildingIds.includes(b.id)}
                role={getRoleForBuilding(b.id)}
                onToggle={() => toggleBuilding(b.id)}
                onRoleChange={(role) => handleRoleChange(b.id, role)}
              />
            ))}
          </div>

          <div className="step-bygg__manual-add">
            <button className="step-bygg__manual-btn">+ Legg til manuelt</button>
          </div>
        </>
      )}

      {!hasBuildings && !loading && (
        <div className="step-bygg__empty">
          Ingen bygg funnet ennå. Søk etter bygg ovenfor.
        </div>
      )}
    </OnboardingLayout>
  );
}
