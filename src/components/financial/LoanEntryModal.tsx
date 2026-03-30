import { useState } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import type { Loan, Covenant } from '../../types/index.ts';
import '../contracts/ContractModal.css';

interface LoanEntryModalProps {
  buildingId: string;
  onClose: () => void;
}

interface CovenantDraft {
  type: Covenant['type'];
  threshold: string;
}

export function LoanEntryModal({ buildingId, onClose }: LoanEntryModalProps) {
  const { addLoanToActiveKundebase } = usePortfolioContext();

  const [lender, setLender] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [interestType, setInterestType] = useState<Loan['interestType']>('flytende');
  const [amortizationType, setAmortizationType] = useState<Loan['amortizationType']>('annuitet');
  const [startDate, setStartDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [annualPayment, setAnnualPayment] = useState('');
  const [covenants, setCovenants] = useState<CovenantDraft[]>([]);
  const [showCovenants, setShowCovenants] = useState(false);
  const [notes, setNotes] = useState('');

  const parseNum = (v: string): number => parseFloat(v.replace(/\s/g, '').replace(',', '.')) || 0;

  const isValid =
    lender.trim() !== '' &&
    parseNum(loanAmount) > 0 &&
    parseNum(outstandingBalance) > 0 &&
    parseNum(interestRate) > 0 &&
    startDate !== '' &&
    maturityDate !== '';

  function addCovenant() {
    setCovenants((prev) => [...prev, { type: 'LTV', threshold: '' }]);
  }

  function updateCovenant(index: number, field: keyof CovenantDraft, value: string) {
    setCovenants((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  }

  function removeCovenant(index: number) {
    setCovenants((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!isValid) return;

    const parsedCovenants: Covenant[] = covenants
      .filter((c) => parseNum(c.threshold) > 0)
      .map((c) => ({
        type: c.type,
        threshold: parseNum(c.threshold),
        status: 'ok' as const,
      }));

    const loan: Loan = {
      id: 'loan-' + Date.now(),
      buildingId,
      lender: lender.trim(),
      loanAmount: parseNum(loanAmount),
      outstandingBalance: parseNum(outstandingBalance),
      interestRate: parseNum(interestRate),
      interestType,
      startDate,
      maturityDate,
      amortizationType,
      ...(parseNum(annualPayment) > 0 ? { annualPayment: parseNum(annualPayment) } : {}),
      ...(parsedCovenants.length > 0 ? { covenants: parsedCovenants } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    addLoanToActiveKundebase(loan);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2 className="modal-card__title">Legg til lån</h2>
          <button className="modal-card__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal-card__body">
          <div className="modal-field">
            <label className="modal-field__label">Långiver</label>
            <input
              className="modal-field__input"
              type="text"
              placeholder="F.eks. DNB, Nordea"
              value={lender}
              onChange={(e) => setLender(e.target.value)}
            />
          </div>

          <div className="modal-field__row">
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Opprinnelig beløp (kr)</label>
              <input
                className="modal-field__input"
                type="text"
                placeholder="100 000 000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </div>
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Utestående (kr)</label>
              <input
                className="modal-field__input"
                type="text"
                placeholder="85 000 000"
                value={outstandingBalance}
                onChange={(e) => setOutstandingBalance(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-field__row">
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Rente (%)</label>
              <input
                className="modal-field__input"
                type="text"
                placeholder="4,5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Rentetype</label>
              <div className="modal-field__radio-row" style={{ paddingTop: 4 }}>
                <label className="modal-field__radio">
                  <input
                    type="radio"
                    name="interestType"
                    checked={interestType === 'flytende'}
                    onChange={() => setInterestType('flytende')}
                  />
                  Flytende
                </label>
                <label className="modal-field__radio">
                  <input
                    type="radio"
                    name="interestType"
                    checked={interestType === 'fast'}
                    onChange={() => setInterestType('fast')}
                  />
                  Fast
                </label>
              </div>
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-field__label">Avdragstype</label>
            <select
              className="modal-field__select"
              value={amortizationType}
              onChange={(e) => setAmortizationType(e.target.value as Loan['amortizationType'])}
            >
              <option value="annuitet">Annuitet</option>
              <option value="serie">Serie</option>
              <option value="avdragsfritt">Avdragsfritt</option>
            </select>
          </div>

          <div className="modal-field__row">
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Startdato</label>
              <input
                className="modal-field__input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Forfallsdato</label>
              <input
                className="modal-field__input"
                type="date"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-field__label">Årlig betjening (kr/år)</label>
            <input
              className="modal-field__input"
              type="text"
              placeholder="5 000 000"
              value={annualPayment}
              onChange={(e) => setAnnualPayment(e.target.value)}
            />
          </div>

          {/* Covenants */}
          <div style={{ marginTop: 4 }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setShowCovenants(!showCovenants)}
            >
              <span className="modal-section-label" style={{ margin: 0, padding: 0, border: 'none' }}>
                Covenants
              </span>
              <span style={{ color: '#7a7a7a', fontSize: 12 }}>{showCovenants ? '▾' : '▸'}</span>
            </div>

            {showCovenants && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {covenants.map((cov, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div className="modal-field" style={{ flex: 1 }}>
                      <label className="modal-field__label">Type</label>
                      <select
                        className="modal-field__select"
                        value={cov.type}
                        onChange={(e) => updateCovenant(i, 'type', e.target.value)}
                      >
                        <option value="LTV">LTV</option>
                        <option value="DSCR">DSCR</option>
                        <option value="ICR">ICR</option>
                        <option value="annet">Annet</option>
                      </select>
                    </div>
                    <div className="modal-field" style={{ flex: 1 }}>
                      <label className="modal-field__label">Terskel</label>
                      <input
                        className="modal-field__input"
                        type="text"
                        placeholder={cov.type === 'LTV' ? '70' : '1,2'}
                        value={cov.threshold}
                        onChange={(e) => updateCovenant(i, 'threshold', e.target.value)}
                      />
                    </div>
                    <button
                      className="modal-field__btn-sm"
                      style={{ padding: '8px 10px', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
                      onClick={() => removeCovenant(i)}
                      title="Fjern"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button className="modal-field__btn-sm" onClick={addCovenant} style={{ alignSelf: 'flex-start' }}>
                  + Legg til covenant
                </button>
              </div>
            )}
          </div>

          <div className="modal-field">
            <label className="modal-field__label">Notat</label>
            <input
              className="modal-field__input"
              type="text"
              placeholder="Valgfri merknad"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-card__footer">
          <button className="modal-card__btn-cancel" onClick={onClose}>Avbryt</button>
          <button className="modal-card__btn-primary" disabled={!isValid} onClick={handleSave}>
            Lagre lån →
          </button>
        </div>
      </div>
    </div>
  );
}
