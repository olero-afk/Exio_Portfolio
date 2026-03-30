import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { formatM2, formatPercent, formatNumber } from '../../utils/formatters.ts';
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

/* ── Main export ─────────────────────────────────────────────── */

export function PortfolioOverviewReport() {
  return (
    <ReportLayout title="Porteføljeoversikt">
      {(kpis) => (
        <>
          <SectionA kpis={kpis} />
          <SectionB kpis={kpis} />
          <SectionC kpis={kpis} />
        </>
      )}
    </ReportLayout>
  );
}
