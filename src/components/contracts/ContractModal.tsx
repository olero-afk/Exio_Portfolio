import { useState, useMemo } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { lookupCompany } from '../../data/brreg/companies.ts';
import type { Contract, AssetClass } from '../../types/index.ts';
import './ContractModal.css';

const AREA_TYPES: AssetClass[] = ['Kontor', 'LogistikkLager', 'Handel', 'Hotell', 'Helse', 'Undervisning', 'Kombinasjon', 'Parkering'];
const AREA_TYPE_LABELS: Record<string, string> = {
  Kontor: 'Kontor', LogistikkLager: 'Lager', Handel: 'Handel', Hotell: 'Hotell',
  Helse: 'Helse', Undervisning: 'Undervisning', Kombinasjon: 'Annet', Parkering: 'Parkering',
};

interface ContractModalProps {
  buildingId?: string;
  onClose: () => void;
}

export function ContractModal({ buildingId: initialBuildingId, onClose }: ContractModalProps) {
  const { buildings, addContractToActiveKundebase } = usePortfolioContext();

  const [buildingId, setBuildingId] = useState(initialBuildingId ?? '');
  const [tenantName, setTenantName] = useState('');
  const [tenantOrgNr, setTenantOrgNr] = useState('');
  const [tenantBankrupt, setTenantBankrupt] = useState(false);
  const [bkLoading, setBkLoading] = useState(false);
  const [contactPerson, setContactPerson] = useState('');
  const [areaType, setAreaType] = useState<AssetClass>('Kontor');
  const [areaM2, setAreaM2] = useState('');
  const [annualRent, setAnnualRent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [breakClauseDate, setBreakClauseDate] = useState('');
  const [renewalOption, setRenewalOption] = useState('');
  const [kpiType, setKpiType] = useState<'ssb' | 'fast' | 'ingen'>('ingen');
  const [kpiPercent, setKpiPercent] = useState('');
  const [notes, setNotes] = useState('');

  const parsedArea = parseFloat(areaM2.replace(/\s/g, '').replace(',', '.')) || 0;
  const parsedRent = parseFloat(annualRent.replace(/\s/g, '').replace(',', '.')) || 0;
  const rentPerM2 = parsedArea > 0 ? Math.round(parsedRent / parsedArea) : 0;

  const activeBuildings = useMemo(() => buildings.filter((b) => !b.isArchived), [buildings]);

  const isValid = buildingId && tenantName.trim() && parsedArea > 0 && parsedRent > 0 && startDate && endDate;

  async function handleBrregLookup() {
    if (!tenantOrgNr.trim()) return;
    setBkLoading(true);
    const result = await lookupCompany(tenantOrgNr);
    setBkLoading(false);
    if (result) {
      setTenantName(result.navn);
      setTenantBankrupt(result.konkurs);
    }
  }

  function handleSave() {
    if (!isValid) return;

    const now = new Date();
    const end = new Date(endDate);
    const remainingYears = Math.max(0, (end.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const breakDate = breakClauseDate ? new Date(breakClauseDate) : null;
    const effectiveYears = breakDate
      ? Math.max(0, (breakDate.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : remainingYears;

    let status: Contract['status'] = 'active';
    if (end < now) status = 'expired';
    else if (new Date(startDate) > now) status = 'future';
    else if (remainingYears < 1) status = 'expiring_soon';

    const contract: Contract = {
      id: `con-new-${Date.now()}`,
      buildingId,
      areaType,
      areaM2: parsedArea,
      tenantName: tenantName.trim(),
      tenantOrgNr: tenantOrgNr.trim() || undefined,
      tenantIsBankrupt: tenantBankrupt,
      tenantIndustry: undefined,
      annualRent: parsedRent,
      startDate,
      endDate,
      breakClauseDate: breakClauseDate || undefined,
      renewalOption: renewalOption.trim() || undefined,
      kpiAdjustmentPercent: kpiType === 'fast' ? (parseFloat(kpiPercent) || 0) : kpiType === 'ssb' ? 100 : 0,
      kpiSource: kpiType === 'ssb' ? 'ssb' : 'manual',
      status,
      remainingTermYears: Math.round(remainingYears * 100) / 100,
      effectiveRemainingYears: Math.round(effectiveYears * 100) / 100,
    };

    addContractToActiveKundebase(contract);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2 className="modal-card__title">Ny leieavtale</h2>
          <button className="modal-card__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal-card__body">
          {/* Building */}
          <div className="modal-field">
            <label className="modal-field__label">Bygg</label>
            <select className="modal-field__select" value={buildingId} onChange={(e) => setBuildingId(e.target.value)}>
              <option value="">— Velg bygg —</option>
              {activeBuildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}, {b.address.postalCode} {b.address.municipality}
                </option>
              ))}
            </select>
          </div>

          {/* Tenant */}
          <div className="modal-section-label">Leietaker</div>
          <div className="modal-field__row">
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Org.nr. (valgfritt)</label>
              <div className="modal-field__inline">
                <input className="modal-field__input" type="text" placeholder="912 345 678" value={tenantOrgNr}
                  onChange={(e) => setTenantOrgNr(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBrregLookup()}
                />
                <button className="modal-field__btn-sm" onClick={handleBrregLookup} disabled={bkLoading}>
                  {bkLoading ? '...' : 'Søk'}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-field">
            <label className="modal-field__label">Navn</label>
            <input className="modal-field__input" type="text" placeholder="Leietaker AS" value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
            />
            {tenantBankrupt && (
              <span className="modal-field__bankrupt">Konkurs — registrert i BRREG</span>
            )}
          </div>
          <div className="modal-field">
            <label className="modal-field__label">Kontaktperson (valgfritt)</label>
            <input className="modal-field__input" type="text" placeholder="Ola Nordmann" value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>

          {/* Area */}
          <div className="modal-section-label">Areal</div>
          <div className="modal-field__row">
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Arealtype</label>
              <select className="modal-field__select" value={areaType} onChange={(e) => setAreaType(e.target.value as AssetClass)}>
                {AREA_TYPES.map((t) => <option key={t} value={t}>{AREA_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Areal (m²)</label>
              <input className="modal-field__input" type="text" placeholder="1 200" value={areaM2}
                onChange={(e) => setAreaM2(e.target.value)}
              />
            </div>
          </div>

          {/* Financial */}
          <div className="modal-section-label">Økonomi</div>
          <div className="modal-field__row">
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Årlig leie (kr)</label>
              <input className="modal-field__input" type="text" placeholder="3 600 000" value={annualRent}
                onChange={(e) => setAnnualRent(e.target.value)}
              />
            </div>
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Leie per m²</label>
              <div className="modal-field__computed">
                {rentPerM2 > 0 ? `${rentPerM2.toLocaleString('nb-NO')} kr/m²` : '—'}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="modal-section-label">Periode</div>
          <div className="modal-field__row">
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Startdato</label>
              <input className="modal-field__input" type="date" value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Sluttdato</label>
              <input className="modal-field__input" type="date" value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-field__row">
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Bruddklausul (valgfritt)</label>
              <input className="modal-field__input" type="date" value={breakClauseDate}
                onChange={(e) => setBreakClauseDate(e.target.value)}
              />
            </div>
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Fornyelse (valgfritt)</label>
              <input className="modal-field__input" type="text" placeholder="+5 år" value={renewalOption}
                onChange={(e) => setRenewalOption(e.target.value)}
              />
            </div>
          </div>

          {/* KPI regulation */}
          <div className="modal-section-label">KPI-regulering</div>
          <div className="modal-field__radio-row">
            <label className="modal-field__radio">
              <input type="radio" name="kpi" checked={kpiType === 'ssb'} onChange={() => setKpiType('ssb')} /> SSB KPI
            </label>
            <label className="modal-field__radio">
              <input type="radio" name="kpi" checked={kpiType === 'fast'} onChange={() => setKpiType('fast')} /> Fast %
            </label>
            <label className="modal-field__radio">
              <input type="radio" name="kpi" checked={kpiType === 'ingen'} onChange={() => setKpiType('ingen')} /> Ingen
            </label>
            {kpiType === 'fast' && (
              <input className="modal-field__input modal-field__input--narrow" type="text" placeholder="3,5" value={kpiPercent}
                onChange={(e) => setKpiPercent(e.target.value)}
              />
            )}
          </div>

          {/* Notes */}
          <div className="modal-field">
            <label className="modal-field__label">Notat (valgfritt)</label>
            <input className="modal-field__input" type="text" placeholder="Merknader..." value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-card__footer">
          <button className="modal-card__btn-cancel" onClick={onClose}>Avbryt</button>
          <button className="modal-card__btn-primary" disabled={!isValid} onClick={handleSave}>
            Lagre avtale →
          </button>
        </div>
      </div>
    </div>
  );
}
