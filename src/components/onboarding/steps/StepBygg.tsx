import { useState, useCallback } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext.tsx';
import { discoverBuildings } from '../../../data/placepoint/buildings.ts';
import { detectRole, ROLE_LABELS, ROLE_COLORS } from '../../../utils/roleDetection.ts';
import { OnboardingLayout } from '../OnboardingLayout.tsx';
import './Steps.css';

const ENERGY_COLORS: Record<string, string> = {
  A: '#16a34a', B: '#22c55e', C: '#84cc16', D: '#eab308', E: '#f97316', F: '#ef4444', G: '#991b1b',
};

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
    setStep,
    setBuildingRoles,
  } = useOnboarding();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const konsernOrgNrs = konsernEntities.map((e) => e.organisasjonsnummer);

  const handleSearch = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    const buildings = await discoverBuildings(company.organisasjonsnummer);
    setDiscoveredBuildings(buildings);
    setLoading(false);
  }, [company, setDiscoveredBuildings]);

  function handleNext() {
    const roles = discoveredBuildings
      .filter((b) => selectedBuildingIds.includes(b.id))
      .map((b) => {
        const detected = detectRole(b, company?.organisasjonsnummer ?? '', konsernOrgNrs);
        return {
          buildingId: b.id,
          detectedRole: detected,
          confirmedRole: detected,
        };
      });
    setBuildingRoles(roles);
    setStep(4);
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
          ? `${selectedBuildingIds.length} av ${discoveredBuildings.length} bygg valgt. Du kan søke etter flere bygg eller legg til manuelt.`
          : 'Søk etter bygg via adresse, matrikkel eller organisasjonsnummer.'}
      </p>

      <div className="step-bygg__search-row">
        <input
          className="onb-input"
          type="text"
          placeholder="Søk etter flere bygg via adresse, matrikkel eller org.nr."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          className="onboarding__btn onboarding__btn--primary"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Søker...' : 'Søk'}
        </button>
      </div>

      {loading && (
        <div className="onb-loading">
          <div className="onb-spinner" />
          Henter bygningsdata fra PlacePoint...
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
            {discoveredBuildings.map((b) => {
              const selected = selectedBuildingIds.includes(b.id);
              const role = detectRole(b, company?.organisasjonsnummer ?? '', konsernOrgNrs);
              return (
                <div
                  key={b.id}
                  className={`step-bygg__card onb-card onb-card--interactive ${selected ? 'step-bygg__card--selected' : ''}`}
                  onClick={() => toggleBuilding(b.id)}
                >
                  <div className="step-bygg__card-check">
                    <div className={`step-bygg__checkbox ${selected ? 'step-bygg__checkbox--checked' : ''}`}>
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="step-bygg__card-content">
                    <div className="step-bygg__card-top">
                      <span className="step-bygg__card-address">{b.adresse.adressetekst}</span>
                      <span className="step-bygg__card-type-badge">{b.bygningstype.beskrivelse}</span>
                      {b.byggeaar && <span className="step-bygg__card-year">{b.byggeaar}</span>}
                    </div>
                    <div className="step-bygg__card-meta">
                      {b.bruksareal && <span>{b.bruksareal.toLocaleString('nb-NO')} m²</span>}
                      {b.antallEtasjer && <span>{b.antallEtasjer} etasjer</span>}
                      {b.energimerke?.karakter && (
                        <span className="step-bygg__energy-badge" style={{ background: ENERGY_COLORS[b.energimerke.karakter] }}>
                          {b.energimerke.karakter}
                        </span>
                      )}
                      {!b.energimerke && <span className="step-bygg__no-energy">Ingen energimerke</span>}
                    </div>
                    <div className="step-bygg__card-bottom">
                      <span className="step-bygg__card-owner">Hjemmelshaver: {b.hjemmelshaver.navn}</span>
                      <span className="onb-badge" style={{ background: `${ROLE_COLORS[role]}20`, color: ROLE_COLORS[role] }}>
                        {ROLE_LABELS[role]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
