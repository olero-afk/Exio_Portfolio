import { useState } from 'react';
import './WelcomeWizard.css';

interface WelcomeWizardProps {
  onLoadDemo: () => void;
}

export function WelcomeWizard({ onLoadDemo }: WelcomeWizardProps) {
  const [step, setStep] = useState(0);
  const [orgNr, setOrgNr] = useState('');
  const [address, setAddress] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);

  function simulateEnrichment(nextStep: number) {
    setIsEnriching(true);
    setTimeout(() => {
      setIsEnriching(false);
      setStep(nextStep);
    }, 1200);
  }

  if (step === 0) {
    return (
      <div className="wizard">
        <div className="wizard__card">
          <div className="wizard__logo">exio</div>
          <h1 className="wizard__title">Velkommen til Exio Portfolio</h1>
          <p className="wizard__desc">
            Porteføljeanalyse for norsk næringseiendom. Start med å legge til ditt selskap,
            eller utforsk med eksempeldata.
          </p>
          <div className="wizard__actions">
            <button className="wizard__btn wizard__btn--primary" onClick={() => setStep(1)}>
              Legg til selskap
            </button>
            <button className="wizard__btn wizard__btn--secondary" onClick={onLoadDemo}>
              Utforsk med eksempeldata
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="wizard">
        <div className="wizard__card">
          <div className="wizard__step-badge">Steg 1 av 4</div>
          <h2 className="wizard__subtitle">Legg til selskap</h2>
          <p className="wizard__desc">Skriv inn organisasjonsnummeret til selskapet ditt. Vi henter data fra BRREG automatisk.</p>
          <div className="wizard__field">
            <label className="wizard__label">Organisasjonsnummer</label>
            <input
              className="wizard__input"
              placeholder="123 456 789"
              value={orgNr}
              onChange={(e) => setOrgNr(e.target.value)}
              maxLength={11}
            />
          </div>
          <div className="wizard__actions">
            <button
              className="wizard__btn wizard__btn--primary"
              disabled={orgNr.replace(/\s/g, '').length < 9 || isEnriching}
              onClick={() => simulateEnrichment(2)}
            >
              {isEnriching ? 'Henter fra BRREG...' : 'Søk i BRREG'}
            </button>
            <button className="wizard__btn wizard__btn--ghost" onClick={() => setStep(0)}>Tilbake</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="wizard">
        <div className="wizard__card">
          <div className="wizard__step-badge">Steg 2 av 4</div>
          <h2 className="wizard__subtitle">Bekreft selskap</h2>
          <div className="wizard__enriched">
            <div className="wizard__enriched-row"><span>Navn:</span><strong>Fjordvest Eiendom AS</strong></div>
            <div className="wizard__enriched-row"><span>Org.nr:</span><strong>{orgNr || '987 654 321'}</strong></div>
            <div className="wizard__enriched-row"><span>Organisasjonsform:</span><strong>AS</strong></div>
            <div className="wizard__enriched-row"><span>Adresse:</span><strong>Strandgaten 45, 5013 Bergen</strong></div>
            <div className="wizard__enriched-row"><span>NACE-kode:</span><strong>68.209 — Utleie av egen eiendom</strong></div>
          </div>
          <div className="wizard__source">Kilde: BRREG Enhetsregisteret</div>
          <div className="wizard__actions">
            <button className="wizard__btn wizard__btn--primary" onClick={() => setStep(3)}>Bekreft og fortsett</button>
            <button className="wizard__btn wizard__btn--ghost" onClick={() => setStep(1)}>Endre org.nr.</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="wizard">
        <div className="wizard__card">
          <div className="wizard__step-badge">Steg 3 av 4</div>
          <h2 className="wizard__subtitle">Legg til første bygg</h2>
          <p className="wizard__desc">Skriv inn adressen til bygningen. Vi henter data fra PlacePoint automatisk.</p>
          <div className="wizard__field">
            <label className="wizard__label">Bygningsadresse</label>
            <input
              className="wizard__input"
              placeholder="Bryggegata 6, Oslo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="wizard__actions">
            <button
              className="wizard__btn wizard__btn--primary"
              disabled={address.length < 5 || isEnriching}
              onClick={() => simulateEnrichment(4)}
            >
              {isEnriching ? 'Henter fra PlacePoint...' : 'Søk bygning'}
            </button>
            <button className="wizard__btn wizard__btn--ghost" onClick={() => setStep(2)}>Tilbake</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4
  return (
    <div className="wizard">
      <div className="wizard__card">
        <div className="wizard__step-badge">Steg 4 av 4</div>
        <h2 className="wizard__subtitle">Legg til kontrakter</h2>
        <p className="wizard__desc">
          Bygningen er lagt til. Neste steg er å legge til leiekontrakter.
          For demonstrasjonsformål kan du laste inn eksempeldata.
        </p>
        <div className="wizard__enriched">
          <div className="wizard__enriched-row"><span>Bygning:</span><strong>{address || 'Bryggegata 6, Oslo'}</strong></div>
          <div className="wizard__enriched-row"><span>Type:</span><strong>Kontor</strong></div>
          <div className="wizard__enriched-row"><span>Energimerking:</span><strong>B</strong></div>
          <div className="wizard__enriched-row"><span>Etasjer:</span><strong>8</strong></div>
        </div>
        <div className="wizard__source">Kilde: PlacePoint</div>
        <div className="wizard__actions">
          <button className="wizard__btn wizard__btn--primary" onClick={onLoadDemo}>
            Last inn eksempeldata
          </button>
          <button className="wizard__btn wizard__btn--ghost" onClick={() => setStep(3)}>Tilbake</button>
        </div>
      </div>
    </div>
  );
}
