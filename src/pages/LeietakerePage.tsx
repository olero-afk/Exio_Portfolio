import { useState, useMemo } from 'react';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { usePersona, EIER_BUILDING_IDS } from '../context/PersonaContext.tsx';
import { formatNOK, formatPercent, formatM2, formatNumber } from '../utils/formatters.ts';
import { usePageTitle } from '../hooks/usePageTitle.ts';
import './reports/report-shared.css';

interface TenantSummary {
  name: string;
  orgNr: string;
  buildings: string[];
  totalContracts: number;
  totalAreaM2: number;
  totalAnnualRent: number;
  avgRentPerM2: number;
  earliestExpiry: string;
  isBankrupt: boolean;
  isExpiring: boolean;
}

type SortKey = 'name' | 'orgNr' | 'totalContracts' | 'totalAreaM2' | 'totalAnnualRent' | 'avgRentPerM2' | 'earliestExpiry';

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function getExpiryColor(dateStr: string): string {
  const expiry = new Date(dateStr);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);
  if (diffMonths < 12) return 'var(--color-red, #ef4444)';
  if (diffMonths < 24) return '#facc15';
  return 'var(--color-green, #22c55e)';
}

export function LeietakerePage() {
  usePageTitle('Leietakere');
  const { contracts, buildings } = usePortfolioContext();
  const { persona, clientBuildingIds } = usePersona();

  const personaBuildingIds = persona === 'eier'
    ? EIER_BUILDING_IDS
    : persona === 'forvalter'
      ? clientBuildingIds
      : null;

  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'totalAnnualRent',
    dir: 'desc',
  });

  const tenants = useMemo(() => {
    const scopedBuildingIds = personaBuildingIds ? new Set(personaBuildingIds) : null;
    const active = contracts.filter(c =>
      (c.status === 'active' || c.status === 'expiring_soon') &&
      (!scopedBuildingIds || scopedBuildingIds.has(c.buildingId))
    );

    const map = new Map<string, TenantSummary>();
    for (const c of active) {
      const key = c.tenantName;
      const building = buildings.find(b => b.id === c.buildingId);
      const existing = map.get(key);
      if (existing) {
        existing.totalContracts++;
        existing.totalAreaM2 += c.areaM2;
        existing.totalAnnualRent += c.annualRent;
        if (!existing.buildings.includes(building?.name ?? '')) existing.buildings.push(building?.name ?? '');
        if (c.endDate < existing.earliestExpiry) existing.earliestExpiry = c.endDate;
        if (c.tenantIsBankrupt) existing.isBankrupt = true;
        if (c.status === 'expiring_soon') existing.isExpiring = true;
      } else {
        map.set(key, {
          name: c.tenantName,
          orgNr: c.tenantOrgNr ?? '',
          buildings: [building?.name ?? ''],
          totalContracts: 1,
          totalAreaM2: c.areaM2,
          totalAnnualRent: c.annualRent,
          avgRentPerM2: 0,
          earliestExpiry: c.endDate,
          isBankrupt: c.tenantIsBankrupt,
          isExpiring: c.status === 'expiring_soon',
        });
      }
    }

    const result = Array.from(map.values());
    for (const t of result) {
      t.avgRentPerM2 = t.totalAreaM2 > 0 ? t.totalAnnualRent / t.totalAreaM2 : 0;
    }
    return result;
  }, [contracts, buildings, personaBuildingIds]);

  // KPI computations
  const tenantCount = tenants.length;
  const totalRent = tenants.reduce((s, t) => s + t.totalAnnualRent, 0);
  const totalAreaM2 = tenants.reduce((s, t) => s + t.totalAreaM2, 0);
  const avgRentPerM2 = totalAreaM2 > 0 ? totalRent / totalAreaM2 : 0;
  const riskCount = tenants.filter(t => t.isExpiring || t.isBankrupt).length;

  // Sorting
  const sortedTenants = useMemo(() => {
    const sorted = [...tenants];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sort.key) {
        case 'name':
          cmp = a.name.localeCompare(b.name, 'nb-NO');
          break;
        case 'orgNr':
          cmp = a.orgNr.localeCompare(b.orgNr, 'nb-NO');
          break;
        case 'totalContracts':
          cmp = a.totalContracts - b.totalContracts;
          break;
        case 'totalAreaM2':
          cmp = a.totalAreaM2 - b.totalAreaM2;
          break;
        case 'totalAnnualRent':
          cmp = a.totalAnnualRent - b.totalAnnualRent;
          break;
        case 'avgRentPerM2':
          cmp = a.avgRentPerM2 - b.avgRentPerM2;
          break;
        case 'earliestExpiry':
          cmp = a.earliestExpiry.localeCompare(b.earliestExpiry);
          break;
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [tenants, sort]);

  // Konsentrasjonsrisiko - top 5
  const concentrationData = useMemo(() => {
    const byRent = [...tenants].sort((a, b) => b.totalAnnualRent - a.totalAnnualRent);
    const top5 = byRent.slice(0, 5);
    const rest = byRent.slice(5);
    const restSum = rest.reduce((s, t) => s + t.totalAnnualRent, 0);
    return { top5, restCount: rest.length, restSum };
  }, [tenants]);

  function handleSort(key: SortKey) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' }
    );
  }

  function sortIndicator(key: SortKey): string {
    if (sort.key !== key) return '';
    return sort.dir === 'asc' ? ' ▲' : ' ▼';
  }

  function thStyle(key: SortKey): React.CSSProperties {
    return sort.key === key ? { color: '#FED092' } : {};
  }

  function getStatusBadge(tenant: TenantSummary): React.ReactNode {
    if (tenant.isBankrupt) {
      return (
        <span style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 700,
          background: 'rgba(239, 68, 68, 0.2)',
          color: 'var(--color-red, #ef4444)',
        }}>
          KONKURS
        </span>
      );
    }
    if (tenant.isExpiring) {
      return (
        <span style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 700,
          background: 'rgba(250, 204, 21, 0.2)',
          color: '#facc15',
        }}>
          Utl\u00f8per
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: 700,
        background: 'rgba(34, 197, 94, 0.2)',
        color: 'var(--color-green, #22c55e)',
      }}>
        Aktiv
      </span>
    );
  }

  function getAndelColor(pct: number): string {
    if (pct > 25) return 'var(--color-red, #ef4444)';
    if (pct >= 15) return '#facc15';
    return 'var(--color-green, #22c55e)';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1200 }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--app-text)' }}>Leietakere</h1>

      {/* KPI cards */}
      <div className="report-section">
        <div className="report-metrics">
          <div className="report-metric">
            <span className="report-metric__label">Antall leietakere</span>
            <span className="report-metric__value">{formatNumber(tenantCount)}</span>
          </div>
          <div className="report-metric">
            <span className="report-metric__label">Total \u00e5rlig leie</span>
            <span className="report-metric__value">{formatNOK(totalRent)}</span>
          </div>
          <div className="report-metric">
            <span className="report-metric__label">Gj.snitt leie/m\u00b2</span>
            <span className="report-metric__value">{formatNOK(avgRentPerM2)}</span>
          </div>
          <div className="report-metric">
            <span className="report-metric__label">Risiko-leietakere</span>
            <span className={`report-metric__value${riskCount > 0 ? ' report-metric__value--danger' : ''}`}>
              {formatNumber(riskCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Tenant table */}
      <div className="report-section">
        <h3 className="report-section__title">LEIETAKEROVERSIKT</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={thStyle('name')}>
                Leietaker{sortIndicator('name')}
              </th>
              <th onClick={() => handleSort('orgNr')} style={thStyle('orgNr')}>
                Org.nr{sortIndicator('orgNr')}
              </th>
              <th>Bygg</th>
              <th onClick={() => handleSort('totalContracts')} data-align="right" style={thStyle('totalContracts')}>
                Avtaler{sortIndicator('totalContracts')}
              </th>
              <th onClick={() => handleSort('totalAreaM2')} data-align="right" style={thStyle('totalAreaM2')}>
                Areal m\u00b2{sortIndicator('totalAreaM2')}
              </th>
              <th onClick={() => handleSort('totalAnnualRent')} data-align="right" style={thStyle('totalAnnualRent')}>
                \u00c5rlig leie{sortIndicator('totalAnnualRent')}
              </th>
              <th onClick={() => handleSort('avgRentPerM2')} data-align="right" style={thStyle('avgRentPerM2')}>
                Leie/m\u00b2{sortIndicator('avgRentPerM2')}
              </th>
              <th onClick={() => handleSort('earliestExpiry')} data-align="right" style={thStyle('earliestExpiry')}>
                Tidligste utl\u00f8p{sortIndicator('earliestExpiry')}
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedTenants.map(t => (
              <tr key={t.name}>
                <td style={{ fontWeight: 600, color: 'var(--app-text)' }}>{t.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{t.orgNr}</td>
                <td>{t.buildings.join(', ')}</td>
                <td data-align="right">{t.totalContracts}</td>
                <td data-align="right">{formatM2(t.totalAreaM2)}</td>
                <td data-align="right">{formatNOK(t.totalAnnualRent)}</td>
                <td data-align="right">{formatNOK(t.avgRentPerM2)}</td>
                <td data-align="right" style={{ color: getExpiryColor(t.earliestExpiry) }}>
                  {dateFormatter.format(new Date(t.earliestExpiry))}
                </td>
                <td>{getStatusBadge(t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Konsentrasjonsrisiko */}
      <div className="report-section">
        <h3 className="report-section__title">KONSENTRASJONSRISIKO</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Leietaker</th>
              <th data-align="right">\u00c5rlig leie</th>
              <th data-align="right">Andel av total</th>
            </tr>
          </thead>
          <tbody>
            {concentrationData.top5.map(t => {
              const andel = totalRent > 0 ? (t.totalAnnualRent / totalRent) * 100 : 0;
              return (
                <tr key={t.name}>
                  <td style={{ fontWeight: 600, color: 'var(--app-text)' }}>{t.name}</td>
                  <td data-align="right">{formatNOK(t.totalAnnualRent)}</td>
                  <td data-align="right" style={{ color: getAndelColor(andel), fontWeight: 600 }}>
                    {formatPercent(andel)}
                  </td>
                </tr>
              );
            })}
            {concentrationData.restCount > 0 && (() => {
              const restAndel = totalRent > 0 ? (concentrationData.restSum / totalRent) * 100 : 0;
              return (
                <tr style={{ borderTop: '2px solid var(--app-border-mid)' }}>
                  <td style={{ color: 'var(--app-text-muted)', fontStyle: 'italic' }}>
                    Andre ({concentrationData.restCount} leietakere)
                  </td>
                  <td data-align="right">{formatNOK(concentrationData.restSum)}</td>
                  <td data-align="right" style={{ color: getAndelColor(restAndel), fontWeight: 600 }}>
                    {formatPercent(restAndel)}
                  </td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
