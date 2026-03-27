import { useOnboarding } from '../../../context/OnboardingContext.tsx';
import { ROLE_COLORS } from '../../../utils/roleDetection.ts';
import { OnboardingLayout } from '../OnboardingLayout.tsx';
import './Steps.css';

export function StepGjennomgang() {
  const {
    companyDisplayName,
    discoveredBuildings,
    selectedBuildingIds,
    buildingRoles,
    setStep,
  } = useOnboarding();

  const selectedBuildings = discoveredBuildings.filter((b) =>
    selectedBuildingIds.includes(b.id),
  );

  const eierBuildings = selectedBuildings.filter((b) => {
    const role = buildingRoles.find((r) => r.buildingId === b.id);
    return role?.confirmedRole === 'eier';
  });
  const investorBuildings = selectedBuildings.filter((b) => {
    const role = buildingRoles.find((r) => r.buildingId === b.id);
    return role?.confirmedRole === 'investor';
  });
  const forvalterBuildings = selectedBuildings.filter((b) => {
    const role = buildingRoles.find((r) => r.buildingId === b.id);
    return role?.confirmedRole === 'forvalter';
  });

  // Warnings
  const warnings: string[] = [];
  const missingEnergy = selectedBuildings.filter((b) => !b.energimerke).length;
  if (missingEnergy > 0) {
    warnings.push(`${missingEnergy} bygg mangler energimerke`);
  }
  warnings.push('Ingen kontrakter registrert ennå');

  return (
    <OnboardingLayout
      onNext={() => setStep(6)}
      onBack={() => setStep(4)}
      nextLabel="Godkjenn og start →"
    >
      <h2 className="onb-heading">Gjennomgang</h2>
      <p className="onb-subheading">
        Kontroller informasjonen før vi oppretter porteføljen din.
      </p>

      <div className="onb-card step-review__summary-card">
        <div className="step-review__summary-name">{companyDisplayName}</div>
        <div className="step-review__summary-stats">
          <span>{selectedBuildings.length} bygg totalt</span>
          <span className="step-review__dot">·</span>
          <span style={{ color: ROLE_COLORS.eier }}>{eierBuildings.length} eid</span>
          <span className="step-review__dot">·</span>
          <span style={{ color: ROLE_COLORS.investor }}>{investorBuildings.length} investert</span>
          <span className="step-review__dot">·</span>
          <span style={{ color: ROLE_COLORS.forvalter }}>{forvalterBuildings.length} forvaltet</span>
        </div>
      </div>

      <div className="step-review__sections">
        {eierBuildings.length > 0 && (
          <div className="step-review__group">
            <div className="step-review__group-header" style={{ borderLeftColor: ROLE_COLORS.eier }}>
              Eid av deg ({eierBuildings.length} bygg)
            </div>
            <div className="step-review__group-list">
              {eierBuildings.map((b) => (
                <div key={b.id} className="step-review__building-item">
                  <span>{b.adresse.adressetekst}</span>
                  <span className="step-review__building-meta">
                    {b.adresse.kommunenavn} · {b.bruksareal?.toLocaleString('nb-NO')} m²
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {investorBuildings.length > 0 && (
          <div className="step-review__group">
            <div className="step-review__group-header" style={{ borderLeftColor: ROLE_COLORS.investor }}>
              Investert i ({investorBuildings.length} bygg)
            </div>
            <div className="step-review__group-list">
              {investorBuildings.map((b) => (
                <div key={b.id} className="step-review__building-item">
                  <span>{b.adresse.adressetekst}</span>
                  <span className="step-review__building-meta">
                    {b.adresse.kommunenavn} · {b.bruksareal?.toLocaleString('nb-NO')} m²
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {forvalterBuildings.length > 0 && (
          <div className="step-review__group">
            <div className="step-review__group-header" style={{ borderLeftColor: ROLE_COLORS.forvalter }}>
              Forvalter for ({forvalterBuildings.length} bygg)
            </div>
            <div className="step-review__group-list">
              {forvalterBuildings.map((b) => (
                <div key={b.id} className="step-review__building-item">
                  <span>{b.adresse.adressetekst}</span>
                  <span className="step-review__building-meta">
                    {b.adresse.kommunenavn} · {b.bruksareal?.toLocaleString('nb-NO')} m²
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="step-review__warnings">
          <div className="step-review__warnings-header">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 14H1L8 1Z" stroke="#eab308" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 6v3" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11.5" r="0.75" fill="#eab308" />
            </svg>
            Merk
          </div>
          {warnings.map((w, i) => (
            <div key={i} className="step-review__warning-item">{w}</div>
          ))}
        </div>
      )}
    </OnboardingLayout>
  );
}
