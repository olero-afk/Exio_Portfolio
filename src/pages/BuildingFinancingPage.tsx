import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { BuildingTabs } from '../components/building/BuildingTabs.tsx';
import { LoanEntryModal } from '../components/financial/LoanEntryModal.tsx';
import { formatNOK, formatPercent, formatNumber } from '../utils/formatters.ts';
import type { Loan, Covenant } from '../types/index.ts';
import './BuildingDetailPage.css';

const dateFmt = new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' });

const AMORT_LABELS: Record<Loan['amortizationType'], string> = {
  annuitet: 'Annuitet',
  serie: 'Serie',
  avdragsfritt: 'Avdragsfritt',
};

function covenantStatusIcon(status: Covenant['status']): string {
  if (status === 'ok') return '✅';
  if (status === 'advarsel') return '⚠️';
  return '❌';
}

function determineLtvStatus(currentValue: number, threshold: number): Covenant['status'] {
  if (currentValue > threshold) return 'brudd';
  if (currentValue > threshold * 0.9) return 'advarsel';
  return 'ok';
}

function determineDscrStatus(currentValue: number, threshold: number): Covenant['status'] {
  if (currentValue < threshold) return 'brudd';
  if (currentValue < threshold * 1.1) return 'advarsel';
  return 'ok';
}

export function BuildingFinancingPage() {
  const { buildingId } = useParams();
  const { buildings, loans, contracts, costs } = usePortfolioContext();
  const building = buildings.find((b) => b.id === buildingId);

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editMarketValue, setEditMarketValue] = useState('');
  const [editPurchasePrice, setEditPurchasePrice] = useState('');
  const [valuesInitialized, setValuesInitialized] = useState(false);

  const buildingLoans = useMemo(
    () => (buildingId ? loans.filter((l) => l.buildingId === buildingId) : []),
    [loans, buildingId],
  );

  const noi = useMemo(() => {
    if (!buildingId) return 0;
    const active = contracts.filter(
      (c) => c.buildingId === buildingId && (c.status === 'active' || c.status === 'expiring_soon'),
    );
    const income = active.reduce((s, c) => s + c.annualRent, 0);

    const bc = costs.filter((c) => c.buildingId === buildingId);
    const ms = new Set(bc.map((c) => `${c.year}-${c.month}`)).size;
    const totalCost = bc.reduce((s, c) => s + c.amount, 0);
    const annualized = ms > 0 ? (totalCost / ms) * 12 : 0;

    return income - annualized;
  }, [buildingId, contracts, costs]);

  const totalDebt = useMemo(
    () => buildingLoans.reduce((s, l) => s + l.outstandingBalance, 0),
    [buildingLoans],
  );

  const ltv = useMemo(() => {
    if (!building?.estimatedMarketValue) return null;
    return (totalDebt / building.estimatedMarketValue) * 100;
  }, [totalDebt, building?.estimatedMarketValue]);

  const dscr = useMemo(() => {
    const totalAnnualPayment = buildingLoans.reduce((s, l) => s + (l.annualPayment ?? 0), 0);
    if (totalAnnualPayment === 0) return null;
    return noi / totalAnnualPayment;
  }, [noi, buildingLoans]);

  // Initialize editable values once building loads
  if (building && !valuesInitialized) {
    setEditMarketValue(building.estimatedMarketValue?.toString() ?? '');
    setEditPurchasePrice(building.purchasePrice?.toString() ?? '');
    setValuesInitialized(true);
  }

  if (!building || !buildingId) return null;

  function ltvColor(v: number | null): string {
    if (v === null) return '#e8e8e8';
    if (v < 60) return '#4ade80';
    if (v <= 70) return '#facc15';
    return '#f87171';
  }

  function dscrColor(v: number | null): string {
    if (v === null) return '#e8e8e8';
    if (v > 1.5) return '#4ade80';
    if (v >= 1.2) return '#facc15';
    return '#f87171';
  }

  function renderCovenants(loan: Loan) {
    if (!loan.covenants || loan.covenants.length === 0) return null;
    const estimatedMV = building!.estimatedMarketValue ?? 0;

    return (
      <div style={{ marginTop: 8 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Covenants
        </span>
        {loan.covenants.map((cov, i) => {
          let currentValue = cov.currentValue;
          let status = cov.status;

          // Auto-calculate for LTV and DSCR
          if (cov.type === 'LTV' && estimatedMV > 0) {
            currentValue = (loan.outstandingBalance / estimatedMV) * 100;
            status = determineLtvStatus(currentValue, cov.threshold);
          } else if (cov.type === 'DSCR' && loan.annualPayment && loan.annualPayment > 0) {
            currentValue = noi / loan.annualPayment;
            status = determineDscrStatus(currentValue, cov.threshold);
          }

          const operator = cov.type === 'LTV' ? '≤' : '≥';
          const formattedThreshold = cov.type === 'LTV'
            ? formatPercent(cov.threshold)
            : formatNumber(cov.threshold, 2);
          const formattedValue = currentValue !== undefined
            ? (cov.type === 'LTV' ? formatPercent(currentValue) : formatNumber(currentValue, 2))
            : '—';

          return (
            <div key={i} style={{ fontSize: 13, color: '#c0c0c0', marginTop: 4 }}>
              {cov.type} {operator} {formattedThreshold} → {formattedValue} {covenantStatusIcon(status)}
              {cov.description && <span style={{ color: '#7a7a7a', marginLeft: 8 }}>({cov.description})</span>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="building-detail">
      <div className="building-detail__header">
        <h1 className="building-detail__name">{building.name}</h1>
        <p className="building-detail__address">
          {building.address.street}, {building.address.postalCode} {building.address.municipality}
        </p>
      </div>
      <BuildingTabs />

      {/* KPI Cards */}
      <div className="building-kpis" style={{ marginTop: 16 }}>
        <h3 className="building-kpis__title">FINANSIERING</h3>
        <div className="building-kpis__grid">
          <div className="building-kpis__metric">
            <span className="building-kpis__label">Gjeld totalt</span>
            <span className="building-kpis__value">{formatNOK(totalDebt)}</span>
          </div>
          <div className="building-kpis__metric">
            <span className="building-kpis__label">Belåningsgrad (LTV)</span>
            <span className="building-kpis__value" style={{ color: ltvColor(ltv) }}>
              {ltv !== null ? formatPercent(ltv) : '—'}
            </span>
          </div>
          <div className="building-kpis__metric">
            <span className="building-kpis__label">DSCR</span>
            <span className="building-kpis__value" style={{ color: dscrColor(dscr) }}>
              {dscr !== null ? formatNumber(dscr, 2) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Loan Cards */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e8e8e8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Lån
          </h3>
          <button
            onClick={() => setShowLoanModal(true)}
            style={{
              background: '#FED092',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            + Legg til lån
          </button>
        </div>

        {buildingLoans.length === 0 && (
          <div style={{
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            borderRadius: 8,
            padding: 32,
            textAlign: 'center',
            color: '#7a7a7a',
            fontSize: 14,
          }}>
            Ingen lån registrert for dette bygget.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {buildingLoans.map((loan) => (
            <div
              key={loan.id}
              style={{
                background: 'var(--app-surface)',
                border: '1px solid var(--app-border)',
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: '#e8e8e8', marginBottom: 8 }}>
                {loan.lender}
              </div>
              <div style={{ fontSize: 13, color: '#c0c0c0', lineHeight: 1.8 }}>
                <div>
                  Opprinnelig: {formatNOK(loan.loanAmount)} &middot; Utestående: {formatNOK(loan.outstandingBalance)}
                </div>
                <div>
                  Rente: {formatNumber(loan.interestRate, 2)}% ({loan.interestType === 'fast' ? 'Fast' : 'Flytende'}) &middot; Type: {AMORT_LABELS[loan.amortizationType]}
                </div>
                <div>
                  Start: {dateFmt.format(new Date(loan.startDate))} &middot; Forfall: {dateFmt.format(new Date(loan.maturityDate))}
                </div>
                {loan.annualPayment !== undefined && (
                  <div>
                    Årlig betjening: {formatNOK(loan.annualPayment)} kr/år
                  </div>
                )}
              </div>
              {renderCovenants(loan)}
              {loan.notes && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#7a7a7a', fontStyle: 'italic' }}>
                  {loan.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Verdivurdering Section */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e8e8e8', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Verdivurdering
        </h3>
        <div style={{
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          borderRadius: 8,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: '#9a9a9a', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Estimert markedsverdi (kr)
            </label>
            <input
              type="number"
              value={editMarketValue}
              onChange={(e) => setEditMarketValue(e.target.value)}
              style={{
                background: '#2a2a2a',
                color: '#e8e8e8',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: '#9a9a9a', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Kjøpspris (kr)
            </label>
            <input
              type="number"
              value={editPurchasePrice}
              onChange={(e) => setEditPurchasePrice(e.target.value)}
              style={{
                background: '#2a2a2a',
                color: '#e8e8e8',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: '#9a9a9a', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Kjøpsdato
            </label>
            <span style={{ color: '#c0c0c0', fontSize: 14, padding: '8px 0' }}>
              {building.acquisitionDate ? dateFmt.format(new Date(building.acquisitionDate)) : '—'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              style={{
                background: '#FED092',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: 6,
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Lagre
            </button>
          </div>
        </div>
      </div>

      {showLoanModal && (
        <LoanEntryModal buildingId={buildingId} onClose={() => setShowLoanModal(false)} />
      )}
    </div>
  );
}
