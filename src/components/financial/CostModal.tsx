import { useState, useMemo } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import type { CostEntry, StandardCostCategory } from '../../types/index.ts';
import '../contracts/ContractModal.css';

const COST_CATEGORIES: { value: StandardCostCategory; label: string }[] = [
  { value: 'drift', label: 'Drift' },
  { value: 'vedlikehold', label: 'Vedlikehold' },
  { value: 'forsikring', label: 'Forsikring' },
  { value: 'administrasjon', label: 'Administrasjon' },
  { value: 'eiendomsskatt', label: 'Eiendomsskatt' },
];

interface CostModalProps {
  buildingId?: string;
  onClose: () => void;
}

export function CostModal({ buildingId: initialBuildingId, onClose }: CostModalProps) {
  const { buildings, addCostToActiveKundebase } = usePortfolioContext();

  const [buildingId, setBuildingId] = useState(initialBuildingId ?? '');
  const [category, setCategory] = useState<StandardCostCategory>('drift');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'annual' | 'monthly'>('annual');
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');

  const activeBuildings = useMemo(() => buildings.filter((b) => !b.isArchived), [buildings]);

  const parsedAmount = parseFloat(amount.replace(/\s/g, '').replace(',', '.')) || 0;
  const annualized = period === 'monthly' ? parsedAmount * 12 : parsedAmount;

  const isValid = buildingId && parsedAmount > 0;

  function handleSave() {
    if (!isValid) return;

    // Create 12 monthly entries (evenly distributed)
    const monthlyAmount = Math.round(annualized / 12);

    for (let month = 1; month <= 12; month++) {
      const cost: CostEntry = {
        id: `cost-new-${Date.now()}-${month}`,
        buildingId,
        category,
        year,
        month,
        amount: monthlyAmount,
        source: 'manual',
      };
      addCostToActiveKundebase(cost);
    }

    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2 className="modal-card__title">Legg til driftskostnad</h2>
          <button className="modal-card__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal-card__body">
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

          <div className="modal-field">
            <label className="modal-field__label">Kategori</label>
            <select className="modal-field__select" value={category} onChange={(e) => setCategory(e.target.value as StandardCostCategory)}>
              {COST_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="modal-field__row">
            <div className="modal-field" style={{ flex: 1 }}>
              <label className="modal-field__label">Beløp (kr)</label>
              <input className="modal-field__input" type="text" placeholder="540 000" value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label className="modal-field__label">Periode</label>
              <div className="modal-field__radio-row">
                <label className="modal-field__radio">
                  <input type="radio" name="period" checked={period === 'annual'} onChange={() => setPeriod('annual')} /> Årlig
                </label>
                <label className="modal-field__radio">
                  <input type="radio" name="period" checked={period === 'monthly'} onChange={() => setPeriod('monthly')} /> Månedlig
                </label>
              </div>
            </div>
          </div>

          {period === 'monthly' && parsedAmount > 0 && (
            <div className="modal-field__computed">
              Årlig: {annualized.toLocaleString('nb-NO')} kr ({parsedAmount.toLocaleString('nb-NO')} × 12)
            </div>
          )}

          <div className="modal-field">
            <label className="modal-field__label">År</label>
            <select className="modal-field__select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-field__label">Beskrivelse (valgfritt)</label>
            <input className="modal-field__input" type="text" placeholder="F.eks. Inkl. renhold og vakthold" value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-card__footer">
          <button className="modal-card__btn-cancel" onClick={onClose}>Avbryt</button>
          <button className="modal-card__btn-primary" disabled={!isValid} onClick={handleSave}>
            Lagre kostnad →
          </button>
        </div>
      </div>
    </div>
  );
}
