import { useOnboarding } from '../../../context/OnboardingContext.tsx';
import { ROLE_LABELS, ROLE_COLORS, type DetectedRole } from '../../../utils/roleDetection.ts';
import { OnboardingLayout } from '../OnboardingLayout.tsx';
import './Steps.css';

const FUND_OPTIONS = [
  { id: 'fund-core', name: 'Nordic Core Fund I' },
  { id: 'fund-va', name: 'Nordic Value-Add II' },
];

export function StepRoller() {
  const {
    discoveredBuildings,
    selectedBuildingIds,
    buildingRoles,
    setBuildingRole,
    setBuildingFund,
    setStep,
  } = useOnboarding();

  const selectedBuildings = discoveredBuildings.filter((b) =>
    selectedBuildingIds.includes(b.id),
  );

  const roleCounts = buildingRoles.reduce(
    (acc, r) => {
      acc[r.confirmedRole] = (acc[r.confirmedRole] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <OnboardingLayout onNext={() => setStep(5)} onBack={() => setStep(3)}>
      <h2 className="onb-heading">Roller per bygg</h2>
      <p className="onb-subheading">
        Vi har automatisk detektert din rolle per bygg. Du kan endre roller og tildele fond.
      </p>

      <div className="step-roller__summary">
        {(['eier', 'investor', 'forvalter'] as DetectedRole[]).map((role) => (
          <div key={role} className="step-roller__summary-item" style={{ borderLeftColor: ROLE_COLORS[role] }}>
            <span className="step-roller__summary-count">{roleCounts[role] || 0}</span>
            <span className="step-roller__summary-label">bygg som {ROLE_LABELS[role]}</span>
          </div>
        ))}
      </div>

      <div className="step-roller__table-wrap">
        <table className="step-roller__table">
          <thead>
            <tr>
              <th>Bygg</th>
              <th>Adresse</th>
              <th>Type</th>
              <th>m²</th>
              <th>Hjemmelshaver</th>
              <th>Din rolle</th>
              <th>Fond</th>
            </tr>
          </thead>
          <tbody>
            {selectedBuildings.map((b) => {
              const roleAssignment = buildingRoles.find((r) => r.buildingId === b.id);
              if (!roleAssignment) return null;
              const currentRole = roleAssignment.confirmedRole;
              return (
                <tr key={b.id}>
                  <td className="step-roller__cell-name">
                    {b.adresse.kommunenavn}
                  </td>
                  <td>{b.adresse.adressetekst}</td>
                  <td>
                    <span className="step-roller__type-badge">
                      {b.bygningstype.beskrivelse}
                    </span>
                  </td>
                  <td className="step-roller__cell-num">
                    {b.bruksareal?.toLocaleString('nb-NO') ?? '—'}
                  </td>
                  <td className="step-roller__cell-owner">{b.hjemmelshaver.navn}</td>
                  <td>
                    <select
                      className="onb-select step-roller__role-select"
                      style={{
                        borderColor: `${ROLE_COLORS[currentRole]}60`,
                        color: ROLE_COLORS[currentRole],
                      }}
                      value={currentRole}
                      onChange={(e) =>
                        setBuildingRole(b.id, e.target.value as DetectedRole)
                      }
                    >
                      <option value="eier">Eier</option>
                      <option value="investor">Investor</option>
                      <option value="forvalter">Forvalter</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="onb-select"
                      value={roleAssignment.fundAssignment ?? ''}
                      onChange={(e) => setBuildingFund(b.id, e.target.value)}
                    >
                      <option value="">— Velg fond —</option>
                      {FUND_OPTIONS.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </OnboardingLayout>
  );
}
