import { useState, useRef, useEffect } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext.tsx';
import { lookupCompany, type BrregCompany } from '../../../data/brreg/companies.ts';
import { discoverBuildings } from '../../../data/placepoint/buildings.ts';
import { OnboardingLayout } from '../OnboardingLayout.tsx';
import './Steps.css';

export function StepSelskap() {
  const {
    company, companyDisplayName, companyLogoUrl,
    setCompany, setCompanyDisplayName, setCompanyLogoUrl,
    discoveredBuildings, setDiscoveredBuildings,
    selectedBuildingIds, toggleBuilding, selectAllBuildings, deselectAllBuildings,
    setStep,
  } = useOnboarding();

  const [orgNr, setOrgNr] = useState(company?.organisasjonsnummer ?? '');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<BrregCompany | null>(company);
  const [logoMode, setLogoMode] = useState<'url' | 'upload'>(companyLogoUrl ? 'url' : 'url');
  const [logoUrlInput, setLogoUrlInput] = useState(companyLogoUrl ?? '');
  const [logoError, setLogoError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [buildingsLoading, setBuildingsLoading] = useState(false);
  const [buildingsLoaded, setBuildingsLoaded] = useState(discoveredBuildings.length > 0);

  // Auto-discover buildings after company is found
  useEffect(() => {
    if (result && !buildingsLoaded && !buildingsLoading) {
      setBuildingsLoading(true);
      discoverBuildings(result.organisasjonsnummer).then((buildings) => {
        setDiscoveredBuildings(buildings);
        setBuildingsLoading(false);
        setBuildingsLoaded(true);
      });
    }
  }, [result, buildingsLoaded, buildingsLoading, setDiscoveredBuildings]);

  async function handleSearch() {
    if (!orgNr.replace(/\s/g, '')) return;
    setLoading(true);
    setNotFound(false);
    setBuildingsLoaded(false);
    const found = await lookupCompany(orgNr);
    setLoading(false);
    if (found) {
      setResult(found);
      setCompany(found);
    } else {
      setResult(null);
      setNotFound(true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleLogoUrl(input: string) {
    setLogoError(false);
    let domain = input.replace(/^https?:\/\//, '').split('/')[0];
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const img = new Image();
    img.onload = () => { setCompanyLogoUrl(clearbitUrl); setLogoUrlInput(input); };
    img.onerror = () => { setCompanyLogoUrl(faviconUrl); setLogoUrlInput(input); };
    img.src = clearbitUrl;
  }

  function handleFileUpload(file: File) {
    setLogoError(false);
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setCompanyLogoUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  const allSelected = discoveredBuildings.length > 0 && selectedBuildingIds.length === discoveredBuildings.length;
  const nextDisabled = !result || selectedBuildingIds.length === 0;

  return (
    <OnboardingLayout
      onNext={() => setStep(2)}
      nextDisabled={nextDisabled}
      showBack={false}
    >
      <h2 className="onb-heading">Registrer selskapet ditt</h2>
      <p className="onb-subheading">
        Søk opp selskapet ditt i Brønnøysundregistrene med organisasjonsnummer.
      </p>

      <div className="step-selskap__search">
        <label className="step-selskap__label">Organisasjonsnummer</label>
        <div className="step-selskap__search-row">
          <input
            className="onb-input"
            type="text"
            placeholder="F.eks. 923 456 789"
            value={orgNr}
            onChange={(e) => setOrgNr(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="onboarding__btn onboarding__btn--primary"
            onClick={handleSearch}
            disabled={loading || !orgNr.replace(/\s/g, '')}
          >
            {loading ? 'Søker...' : 'Søk'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="onb-loading">
          <div className="onb-spinner" />
          Henter selskapsdata fra BRREG...
        </div>
      )}

      {notFound && !loading && (
        <div className="step-selskap__not-found">
          Fant ingen selskap med org.nr. {orgNr}. Sjekk nummeret og prøv igjen.
        </div>
      )}

      {result && !loading && (
        <div className="step-selskap__result">
          {/* Company card */}
          <div className="onb-card">
            <div className="step-selskap__company-header">
              <div>
                <div className="step-selskap__company-name">{result.navn}</div>
                <div className="step-selskap__company-meta">
                  Org.nr. {result.organisasjonsnummer} · {result.organisasjonsform.kode} · Stiftet{' '}
                  {new Date(result.stiftelsesdato).toLocaleDateString('nb-NO')}
                </div>
              </div>
              {!result.konkurs && (
                <div className="step-selskap__status step-selskap__status--ok">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#4ade80" strokeWidth="2" />
                    <path d="M5 8L7 10L11 6" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Aktiv
                </div>
              )}
            </div>

            <div className="step-selskap__details">
              <div className="step-selskap__detail">
                <span className="step-selskap__detail-label">Adresse</span>
                <span>{result.forretningsadresse.adresse[0]}, {result.forretningsadresse.postnummer} {result.forretningsadresse.poststed}</span>
              </div>
              <div className="step-selskap__detail">
                <span className="step-selskap__detail-label">NACE-kode</span>
                <span>{result.naeringskode1.kode} — {result.naeringskode1.beskrivelse}</span>
              </div>
              <div className="step-selskap__detail">
                <span className="step-selskap__detail-label">Ansatte</span>
                <span>{result.antallAnsatte}</span>
              </div>
            </div>

            {result.erIKonsern && result.konsern && (
              <div className="step-selskap__konsern">
                <div className="onb-badge onb-badge--investor">
                  Del av konsern: {result.konsern.children.length} datterselskaper
                </div>
                <div className="step-selskap__konsern-list">
                  {result.konsern.children.map((child) => (
                    <div key={child.organisasjonsnummer} className="step-selskap__konsern-item">
                      <span className="step-selskap__konsern-name">{child.navn}</span>
                      <span className="step-selskap__konsern-org">{child.organisasjonsnummer}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Building discovery inside the card */}
            {buildingsLoading && (
              <div className="step-selskap__buildings-inline-loading">
                <div className="onb-spinner" />
                <span>Henter bygg tilknyttet selskapet...</span>
              </div>
            )}

            {buildingsLoaded && !buildingsLoading && discoveredBuildings.length > 0 && (
              <div className="step-selskap__buildings-inline">
                <div className="step-selskap__buildings-inline-header">
                  <span className="step-selskap__buildings-inline-title">
                    Bygg tilknyttet selskapet ({discoveredBuildings.length})
                  </span>
                  <div className="step-selskap__buildings-inline-actions">
                    <button className="step-selskap__buildings-toggle" onClick={allSelected ? deselectAllBuildings : selectAllBuildings}>
                      {allSelected ? 'Fjern alle' : 'Velg alle'}
                    </button>
                    <span className="step-selskap__buildings-count">
                      {selectedBuildingIds.length} valgt
                    </span>
                  </div>
                </div>

                <div className="step-selskap__buildings-inline-list">
                  {discoveredBuildings.map((b) => {
                    const selected = selectedBuildingIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        className={`step-selskap__building-row ${selected ? 'step-selskap__building-row--selected' : ''}`}
                        onClick={() => toggleBuilding(b.id)}
                      >
                        <div className={`step-selskap__building-check ${selected ? 'step-selskap__building-check--checked' : ''}`}>
                          {selected && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="step-selskap__building-info">
                          <span className="step-selskap__building-address">
                            {b.adresse.adressetekst}, {b.adresse.postnummer} {b.adresse.poststed}
                          </span>
                          <span className="step-selskap__building-owner">
                            Hjemmelshaver: {b.hjemmelshaver.navn}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {buildingsLoaded && !buildingsLoading && discoveredBuildings.length === 0 && (
              <div className="step-selskap__buildings-inline-empty">
                Ingen bygg funnet tilknyttet dette selskapet.
              </div>
            )}
          </div>

          {/* Company name + logo */}
          <div className="step-selskap__edit-section">
            <label className="step-selskap__label">Selskapsnavn (kan redigeres)</label>
            <input
              className="onb-input"
              type="text"
              value={companyDisplayName}
              onChange={(e) => setCompanyDisplayName(e.target.value)}
            />
          </div>

          <div className="step-selskap__logo-section">
            <label className="step-selskap__label">Logo (valgfritt)</label>
            <div className="step-selskap__logo-tabs">
              <button className={`step-selskap__logo-tab ${logoMode === 'url' ? 'step-selskap__logo-tab--active' : ''}`} onClick={() => setLogoMode('url')}>Fra nettside</button>
              <button className={`step-selskap__logo-tab ${logoMode === 'upload' ? 'step-selskap__logo-tab--active' : ''}`} onClick={() => setLogoMode('upload')}>Last opp fil</button>
            </div>

            {logoMode === 'url' && (
              <div className="step-selskap__logo-url-section">
                <div className="step-selskap__logo-url-row">
                  <input className="onb-input" type="url" placeholder="https://dinbedrift.no" value={logoUrlInput}
                    onChange={(e) => { setLogoUrlInput(e.target.value); setLogoError(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && logoUrlInput.trim()) handleLogoUrl(logoUrlInput.trim()); }}
                  />
                  <button className="onboarding__btn onboarding__btn--primary" disabled={!logoUrlInput.trim()} onClick={() => handleLogoUrl(logoUrlInput.trim())}>Hent logo</button>
                </div>
                <p className="step-selskap__logo-hint">Vi henter logoen fra nettsiden automatisk via favicon/meta-tags.</p>
              </div>
            )}

            {logoMode === 'upload' && (
              <div className="step-selskap__logo-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('step-selskap__logo-dropzone--dragover'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('step-selskap__logo-dropzone--dragover'); }}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('step-selskap__logo-dropzone--dragover'); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
              >
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7a7a7a" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Dra og slipp logofil her, eller klikk for å velge</span>
                <span className="step-selskap__logo-formats">PNG, JPG, SVG eller WebP</span>
              </div>
            )}

            {companyLogoUrl && (
              <div className="step-selskap__logo-preview">
                <div className="step-selskap__logo-preview-img-wrap">
                  <img src={companyLogoUrl} alt="Selskapslogo" className="step-selskap__logo-preview-img"
                    onError={() => { setLogoError(true); setCompanyLogoUrl(null); }}
                  />
                </div>
                <button className="step-selskap__logo-remove" onClick={() => { setCompanyLogoUrl(null); setLogoUrlInput(''); }}>Fjern logo</button>
              </div>
            )}

            {logoError && !companyLogoUrl && (
              <div className="step-selskap__logo-error">Kunne ikke laste logoen. Prøv en annen URL eller last opp en fil.</div>
            )}
          </div>

        </div>
      )}
    </OnboardingLayout>
  );
}
