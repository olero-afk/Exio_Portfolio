import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { formatM2, formatPercent, formatNumber, formatNOK } from '../../utils/formatters.ts';
import { LockedSection } from '../../components/shared/LockedSection.tsx';
import { mockYieldData, mockPaymentData } from '../../data/lockedSectionMocks.ts';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import type { Building } from '../../types/index.ts';
import './report-shared.css';

/* ── helpers ─────────────────────────────────────────────────── */

function occupancyClass(rate: number): string {
  const pct = rate * 100;
  if (pct >= 90) return 'report-metric__value--positive';
  if (pct >= 70) return 'report-metric__value--warning';
  return 'report-metric__value--danger';
}

function vacancyClass(rate: number): string {
  const pct = (1 - rate) * 100;
  if (pct < 10) return 'report-metric__value--positive';
  if (pct <= 30) return 'report-metric__value--warning';
  return 'report-metric__value--danger';
}

function occupancyCellColor(rate: number): string {
  const pct = rate * 100;
  if (pct >= 90) return 'var(--color-green)';
  if (pct >= 70) return '#facc15';
  return 'var(--color-red)';
}

function energyBadgeColor(label: string | null): string {
  if (!label) return 'transparent';
  if (label === 'A' || label === 'B') return 'rgba(74, 222, 128, 0.20)';
  if (label === 'C' || label === 'D') return 'rgba(250, 204, 21, 0.20)';
  return 'rgba(248, 113, 113, 0.20)';
}

function energyTextColor(label: string | null): string {
  if (!label) return 'var(--app-text-dim)';
  if (label === 'A' || label === 'B') return '#4ade80';
  if (label === 'C' || label === 'D') return '#facc15';
  return '#f87171';
}

/* ── sort keys ───────────────────────────────────────────────── */

type SortKey = 'name' | 'address' | 'type' | 'totalM2' | 'committedM2' | 'vacantM2' | 'occupancy' | 'energy' | 'yearBuilt' | 'owner';
type SortDir = 'asc' | 'desc';

interface SortState {
  key: SortKey;
  dir: SortDir;
}

function getSortValue(b: Building, key: SortKey): string | number {
  switch (key) {
    case 'name': return b.name.toLowerCase();
    case 'address': return b.address.street.toLowerCase();
    case 'type': return b.buildingType.toLowerCase();
    case 'totalM2': return b.totalRentableM2;
    case 'committedM2': return b.committedM2;
    case 'vacantM2': return b.totalRentableM2 - b.committedM2;
    case 'occupancy': return b.occupancyRate;
    case 'energy': return b.energyLabel ?? 'Z';
    case 'yearBuilt': return b.yearBuilt ?? 0;
    case 'owner': return (b.ownerName ?? '').toLowerCase();
  }
}

function sortBuildings(buildings: Building[], sort: SortState): Building[] {
  return [...buildings].sort((a, b) => {
    const aVal = getSortValue(a, sort.key);
    const bVal = getSortValue(b, sort.key);
    if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sort.dir === 'asc' ? 1 : -1;
    return 0;
  });
}

/* ── Section A: Top KPI Summary Bar ──────────────────────────── */

function SectionA({ kpis }: { kpis: PortfolioKPIs }) {
  return (
    <div className="report-metrics">
      <div className="report-metric">
        <span className="report-metric__label">Antall bygg</span>
        <span className="report-metric__value">{kpis.buildingCount}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Total areal</span>
        <span className="report-metric__value">{formatM2(kpis.totalRentableM2)}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Utleiegrad</span>
        <span className={`report-metric__value ${occupancyClass(kpis.portfolioOccupancyRate)}`}>
          {formatPercent(kpis.portfolioOccupancyRate * 100)}
        </span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Ledighetsrate</span>
        <span className={`report-metric__value ${vacancyClass(kpis.portfolioOccupancyRate)}`}>
          {formatPercent((1 - kpis.portfolioOccupancyRate) * 100)}
        </span>
      </div>
    </div>
  );
}

/* ── Section B: Sortable Building Register Table ─────────────── */

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'name', label: 'Bygg' },
  { key: 'address', label: 'Adresse' },
  { key: 'type', label: 'Type' },
  { key: 'totalM2', label: 'BRA m²', align: 'right' },
  { key: 'committedM2', label: 'Utleid m²', align: 'right' },
  { key: 'vacantM2', label: 'Ledig m²', align: 'right' },
  { key: 'occupancy', label: 'Utleiegrad', align: 'right' },
  { key: 'energy', label: 'Energi' },
  { key: 'yearBuilt', label: 'Byggeår', align: 'right' },
  { key: 'owner', label: 'Hjemmelshaver' },
];

function SectionB({ kpis }: { kpis: PortfolioKPIs }) {
  const [sort, setSort] = useState<SortState>({ key: 'name', dir: 'asc' });

  const sorted = useMemo(
    () => sortBuildings(kpis.filteredBuildings, sort),
    [kpis.filteredBuildings, sort],
  );

  const totals = useMemo(() => {
    let totalM2 = 0;
    let committed = 0;
    for (const b of kpis.filteredBuildings) {
      totalM2 += b.totalRentableM2;
      committed += b.committedM2;
    }
    const vacant = totalM2 - committed;
    const avgOccupancy = totalM2 > 0 ? committed / totalM2 : 0;
    return { totalM2, committed, vacant, avgOccupancy };
  }, [kpis.filteredBuildings]);

  function handleSort(key: SortKey) {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <div className="report-section">
      <h3 className="report-section__title">Bygningsregister</h3>
      <table className="report-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                data-align={col.align}
                style={sort.key === col.key ? { color: '#FED092' } : undefined}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sort.key === col.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((b) => {
            const vacantM2 = b.totalRentableM2 - b.committedM2;
            return (
              <tr key={b.id}>
                <td>
                  <Link to={`/bygg/${b.id}`} className="report-table__link">
                    {b.name}
                  </Link>
                </td>
                <td>{b.address.street}, {b.address.postalCode} {b.address.municipality}</td>
                <td>{b.buildingType}</td>
                <td data-align="right">{formatM2(b.totalRentableM2)}</td>
                <td data-align="right">{formatM2(b.committedM2)}</td>
                <td data-align="right">{formatM2(vacantM2)}</td>
                <td data-align="right" style={{ color: occupancyCellColor(b.occupancyRate) }}>
                  {formatPercent(b.occupancyRate * 100)}
                </td>
                <td>
                  {b.energyLabel ? (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 3,
                        color: energyTextColor(b.energyLabel),
                        backgroundColor: energyBadgeColor(b.energyLabel),
                      }}
                    >
                      {b.energyLabel}
                      {b.energyLabelDate && (() => {
                        const yr = new Date(b.energyLabelDate).getFullYear();
                        const validYr = yr + 10;
                        const isExpired = validYr <= new Date().getFullYear();
                        return <span>{isExpired ? ' ⚠' : ''} ({yr})</span>;
                      })()}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--app-text-dim)' }}>—</span>
                  )}
                </td>
                <td data-align="right">{b.yearBuilt ?? '—'}</td>
                <td>{b.ownerName ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 700, borderTop: '2px solid var(--app-border-mid)' }}>
            <td>Totalt</td>
            <td></td>
            <td></td>
            <td data-align="right">{formatM2(totals.totalM2)}</td>
            <td data-align="right">{formatM2(totals.committed)}</td>
            <td data-align="right">{formatM2(totals.vacant)}</td>
            <td data-align="right" style={{ color: occupancyCellColor(totals.avgOccupancy) }}>
              {formatPercent(totals.avgOccupancy * 100)}
            </td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── Section C: Distribution by Type & Geography ─────────────── */

function SectionC({ kpis }: { kpis: PortfolioKPIs }) {
  return (
    <div className="report-grid-2">
      <div className="report-section">
        <h3 className="report-section__title">Fordeling etter type</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {kpis.diversification.byAssetType.map((slice) => (
            <div
              key={slice.label}
              style={{
                fontSize: 'var(--font-size-body)',
                color: 'var(--app-text-secondary)',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--app-text)' }}>{slice.label}:</span>{' '}
              {formatNumber(slice.value)} m² ({formatPercent(slice.percent)}%)
            </div>
          ))}
        </div>
      </div>
      <div className="report-section">
        <h3 className="report-section__title">Fordeling etter geografi</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {kpis.diversification.byGeography.map((slice) => (
            <div
              key={slice.label}
              style={{
                fontSize: 'var(--font-size-body)',
                color: 'var(--app-text-secondary)',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--app-text)' }}>{slice.label}:</span>{' '}
              {formatNumber(slice.value)} m² ({formatPercent(slice.percent)}%)
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Section D: Kontantstrøm ─────────────────────────────────── */

function SectionD({ kpis }: { kpis: PortfolioKPIs }) {
  const { contracts, costs, loans } = usePortfolioContext();

  const waterfall = useMemo(() => {
    const buildingIds = new Set(kpis.filteredBuildings.map(b => b.id));
    const bruttoLeie = kpis.totalGrossRentalIncome;
    const driftskostnader = kpis.totalOperatingExpenses;
    const totalNOI = kpis.totalNOI;
    const totalM2 = kpis.totalRentableM2;

    const filteredLoans = loans.filter(l => buildingIds.has(l.buildingId));
    const totalRentekostnad = filteredLoans.reduce((s, l) => s + (l.outstandingBalance * l.interestRate / 100), 0);
    const totalGjeldsbetjening = filteredLoans.reduce((s, l) => s + (l.annualPayment ?? 0), 0);
    const totalAvdrag = totalGjeldsbetjening - totalRentekostnad;
    const nettoKontantstrom = totalNOI - totalGjeldsbetjening;
    const dscr = totalGjeldsbetjening > 0 ? totalNOI / totalGjeldsbetjening : 0;
    const totalDebt = filteredLoans.reduce((s, l) => s + l.outstandingBalance, 0);
    const totalMarketValue = kpis.filteredBuildings.reduce((s, b) => s + (b.estimatedMarketValue ?? 0), 0);
    const ltvVal = totalMarketValue > 0 ? (totalDebt / totalMarketValue) * 100 : 0;

    const rows = [
      { label: 'Brutto leieinntekt', value: bruttoLeie, perM2: totalM2 > 0 ? bruttoLeie / totalM2 : 0, color: '#4ade80', bold: false, separator: false },
      { label: '− Driftskostnader', value: -driftskostnader, perM2: totalM2 > 0 ? -driftskostnader / totalM2 : 0, color: '#f87171', bold: false, separator: false },
      { label: '= NOI', value: totalNOI, perM2: totalM2 > 0 ? totalNOI / totalM2 : 0, color: undefined, bold: true, separator: true },
      { label: '− Rentekostnader', value: -totalRentekostnad, perM2: totalM2 > 0 ? -totalRentekostnad / totalM2 : 0, color: '#f87171', bold: false, separator: false },
      { label: '− Avdrag', value: -totalAvdrag, perM2: totalM2 > 0 ? -totalAvdrag / totalM2 : 0, color: '#f87171', bold: false, separator: false },
      { label: '= Netto kontantstrøm', value: nettoKontantstrom, perM2: totalM2 > 0 ? nettoKontantstrom / totalM2 : 0, color: nettoKontantstrom >= 0 ? '#4ade80' : '#f87171', bold: true, separator: true },
    ];

    return { rows, dscr, ltv: ltvVal };
  }, [kpis, loans]);

  const perBuilding = useMemo(() => {
    return kpis.filteredBuildings.map(b => {
      const income = contracts.filter(c => c.buildingId === b.id && (c.status === 'active' || c.status === 'expiring_soon')).reduce((s, c) => s + c.annualRent, 0);
      const bc = costs.filter(c => c.buildingId === b.id);
      const ms = new Set(bc.map(c => `${c.year}-${c.month}`)).size;
      const totalCost = bc.reduce((s, c) => s + c.amount, 0);
      const annualized = ms > 0 ? (totalCost / ms) * 12 : 0;
      const bNoi = income - annualized;
      const bLoans = loans.filter(l => l.buildingId === b.id);
      const bRenter = bLoans.reduce((s, l) => s + (l.outstandingBalance * l.interestRate / 100), 0);
      const bBetjening = bLoans.reduce((s, l) => s + (l.annualPayment ?? 0), 0);
      const bAvdrag = bBetjening - bRenter;
      const bNettoKS = bNoi - bBetjening;
      const bDscr = bBetjening > 0 ? bNoi / bBetjening : 0;
      const hasLoans = bLoans.length > 0;
      return { building: b, income, annualized, noi: bNoi, renter: bRenter, avdrag: bAvdrag, nettoKS: bNettoKS, dscr: bDscr, hasLoans };
    }).sort((a, b) => a.nettoKS - b.nettoKS);
  }, [kpis.filteredBuildings, contracts, costs, loans]);

  function dscrCellColor(v: number): string {
    if (v > 1.5) return '#4ade80';
    if (v >= 1.2) return '#facc15';
    return '#f87171';
  }

  return (
    <>
      <div className="report-section">
        <h3 className="report-section__title">Kontantstrøm — portefølje</h3>
        <table className="report-table">
          <thead><tr>
            <th>Post</th>
            <th data-align="right">Portefølje</th>
            <th data-align="right">Per m²</th>
          </tr></thead>
          <tbody>
            {waterfall.rows.map(({ label, value, perM2, color, bold, separator }) => (
              <tr key={label} style={{ fontWeight: bold ? 700 : undefined, borderTop: separator ? '1px solid rgba(255,255,255,0.1)' : undefined }}>
                <td>{label}</td>
                <td data-align="right" style={{ color }}>{formatNOK(value)}</td>
                <td data-align="right" style={{ color }}>{formatNOK(perM2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td>DSCR</td><td data-align="right">{formatNumber(waterfall.dscr, 2)}</td><td /></tr>
            <tr><td>Belåningsgrad (LTV)</td><td data-align="right">{formatPercent(waterfall.ltv)}</td><td /></tr>
          </tfoot>
        </table>
      </div>

      <div className="report-section">
        <h3 className="report-section__title">Kontantstrøm — per bygg</h3>
        <table className="report-table">
          <thead><tr>
            <th>Bygg</th>
            <th data-align="right">Brutto leie</th>
            <th data-align="right">Driftskostn.</th>
            <th data-align="right">NOI</th>
            <th data-align="right">Renter</th>
            <th data-align="right">Avdrag</th>
            <th data-align="right">Netto KS</th>
            <th data-align="right">DSCR</th>
          </tr></thead>
          <tbody>
            {perBuilding.map(({ building: b, income, annualized, noi: bNoi, renter, avdrag, nettoKS, dscr: bDscr, hasLoans }) => (
              <tr key={b.id}>
                <td>
                  <Link to={`/bygg/${b.id}`} className="report-table__link">
                    {b.name}
                  </Link>
                </td>
                <td data-align="right">{formatNOK(income)}</td>
                <td data-align="right">{formatNOK(annualized)}</td>
                <td data-align="right">{formatNOK(bNoi)}</td>
                <td data-align="right">{hasLoans ? formatNOK(renter) : '—'}</td>
                <td data-align="right">{hasLoans ? formatNOK(avdrag) : '—'}</td>
                <td data-align="right" style={{ color: hasLoans ? (nettoKS >= 0 ? '#4ade80' : '#f87171') : undefined }}>
                  {hasLoans ? formatNOK(nettoKS) : '—'}
                </td>
                <td data-align="right" style={{ color: hasLoans ? dscrCellColor(bDscr) : undefined }}>
                  {hasLoans ? formatNumber(bDscr, 2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Main export ─────────────────────────────────────────────── */

export function PortfolioOverviewReport() {
  return (
    <ReportLayout title="Porteføljeoversikt">
      {(kpis) => (
        <>
          <SectionA kpis={kpis} />
          <SectionB kpis={kpis} />
          <SectionC kpis={kpis} />
          <SectionD kpis={kpis} />

          <LockedSection requiredLevel={2} currentLevel={1} title="Verdivurdering og yield" description="Se NIY/Cap Rate, markedsverdi og yield-endring per bygg">
            <div className="report-section">
              <h3 className="report-section__title">Verdivurdering og yield</h3>
              <table className="report-table">
                <thead><tr>
                  <th>Bygg</th>
                  <th data-align="right">Markedsverdi</th>
                  <th data-align="right">NOI</th>
                  <th data-align="right">NIY</th>
                  <th data-align="right">Yield Δ YoY</th>
                </tr></thead>
                <tbody>
                  {mockYieldData.map((r) => (
                    <tr key={r.building}>
                      <td>{r.building}</td>
                      <td data-align="right">{formatNOK(r.marketValue)}</td>
                      <td data-align="right">{formatNOK(r.noi)}</td>
                      <td data-align="right">{formatPercent(r.niy)}</td>
                      <td data-align="right" style={{ color: r.yoyChange >= 0 ? '#4ade80' : '#f87171' }}>
                        {r.yoyChange >= 0 ? '+' : ''}{formatPercent(r.yoyChange)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LockedSection>

          <LockedSection requiredLevel={3} currentLevel={1} title="Leietakeroversikt med betalingsstatus" description="Se betalingsstatus per leietaker — live fra Kontraktsforvaltning">
            <div className="report-section">
              <h3 className="report-section__title">Betalingsstatus per leietaker</h3>
              <table className="report-table">
                <thead><tr>
                  <th>Leietaker</th>
                  <th>Bygg</th>
                  <th data-align="right">Årlig leie</th>
                  <th>Status</th>
                  <th>Siste betaling</th>
                </tr></thead>
                <tbody>
                  {mockPaymentData.map((r) => (
                    <tr key={r.tenant}>
                      <td>{r.tenant}</td>
                      <td>{r.building}</td>
                      <td data-align="right">{formatNOK(r.annualRent)}</td>
                      <td>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3,
                          color: r.status === 'Betalt' ? '#4ade80' : r.status === 'Forfalt 14 dager' ? '#facc15' : '#f87171',
                          background: r.status === 'Betalt' ? 'rgba(74,222,128,0.1)' : r.status === 'Forfalt 14 dager' ? 'rgba(250,204,21,0.1)' : 'rgba(248,113,113,0.1)',
                        }}>{r.status}</span>
                      </td>
                      <td style={{ color: '#9a9a9a' }}>{r.lastPayment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LockedSection>
        </>
      )}
    </ReportLayout>
  );
}
