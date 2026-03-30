import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, formatNumber, formatYears } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './report-shared.css';

const dateFmt = new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' });

function waultColor(years: number): string {
  if (years > 5) return 'report-metric__value--positive';
  if (years >= 2) return 'report-metric__value--warning';
  return 'report-metric__value--danger';
}

function remainColor(years: number): string {
  if (years > 2) return 'var(--color-green, #4ade80)';
  if (years >= 1) return 'var(--color-yellow, #facc15)';
  return 'var(--color-red, #f87171)';
}

/* ─── Section A: Top KPI Summary Bar ─── */

function SectionA({ kpis }: { kpis: PortfolioKPIs }) {
  const { contracts } = usePortfolioContext();
  const filteredBuildingIds = useMemo(() => new Set(kpis.filteredBuildings.map((b) => b.id)), [kpis.filteredBuildings]);

  const activeContractCount = useMemo(
    () =>
      contracts.filter(
        (c) =>
          (c.status === 'active' || c.status === 'expiring_soon') &&
          filteredBuildingIds.has(c.buildingId),
      ).length,
    [contracts, filteredBuildingIds],
  );

  return (
    <div className="report-metrics">
      <div className="report-metric">
        <span className="report-metric__label">WAULT (kontraktsl.)</span>
        <span className={`report-metric__value ${waultColor(kpis.portfolioWAULT)}`}>
          {formatYears(kpis.portfolioWAULT)}
        </span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Eff. WAULT (bruddklausul)</span>
        <span className={`report-metric__value ${waultColor(kpis.effectiveWAULT)}`}>
          {formatYears(kpis.effectiveWAULT)}
        </span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Antall avtaler</span>
        <span className="report-metric__value">{activeContractCount}</span>
      </div>
      <div className="report-metric">
        <span className="report-metric__label">Inntekt i risiko (12 mnd)</span>
        <span className="report-metric__value report-metric__value--danger">
          {formatNOK(kpis.incomeAtRisk)}
        </span>
      </div>
    </div>
  );
}

/* ─── Section B: Expiry Profile Chart ─── */

function SectionB({ kpis }: { kpis: PortfolioKPIs }) {
  const expiryProfile = kpis.expiryProfile;

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: expiryProfile.map((_, i) => (i === 0 ? '#f87171' : '#22d4e8')),
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%', distributed: true } },
    xaxis: {
      categories: expiryProfile.map((e) => e.label),
      labels: { style: { colors: '#9a9a9a', fontSize: '11px' } },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#7a7a7a', fontSize: '9px' },
        formatter: (v: number) => formatNumber(v / 1e6, 1) + 'M',
      },
    },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) } },
    dataLabels: {
      enabled: true,
      formatter: (_v: string | number | number[], opt?: { dataPointIndex?: number }) =>
        formatPercent(expiryProfile[opt?.dataPointIndex ?? 0]?.percentOfTotal ?? 0),
      style: { fontSize: '9px', colors: ['#e8e8e8'] },
      offsetY: -8,
    },
    legend: { show: false },
  };

  return (
    <div className="report-section">
      <h3 className="report-section__title">Utløpsprofil</h3>
      {expiryProfile.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: 'Utløpende leie', data: expiryProfile.map((e) => e.expiringRent) }]}
          type="bar"
          height={320}
        />
      ) : (
        <p style={{ color: 'var(--app-text-dim)', fontSize: 'var(--font-size-body)' }}>Ingen kontraktsdata</p>
      )}
    </div>
  );
}

/* ─── Section C: WAULT per Building Table ─── */

type BuildingSortKey = 'name' | 'contractCount' | 'annualRent' | 'wault' | 'effectiveWault' | 'incomeAtRisk';

interface BuildingRow {
  buildingId: string;
  name: string;
  contractCount: number;
  annualRent: number;
  wault: number;
  effectiveWault: number;
  incomeAtRisk: number;
}

function SectionC({ kpis }: { kpis: PortfolioKPIs }) {
  const { contracts } = usePortfolioContext();
  const [sortKey, setSortKey] = useState<BuildingSortKey>('wault');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredBuildingIds = useMemo(() => new Set(kpis.filteredBuildings.map((b) => b.id)), [kpis.filteredBuildings]);

  const activeContracts = useMemo(
    () =>
      contracts.filter(
        (c) =>
          (c.status === 'active' || c.status === 'expiring_soon') &&
          filteredBuildingIds.has(c.buildingId),
      ),
    [contracts, filteredBuildingIds],
  );

  const rows: BuildingRow[] = useMemo(() => {
    return kpis.filteredBuildings.map((b) => {
      const bContracts = activeContracts.filter((c) => c.buildingId === b.id);
      const contractCount = bContracts.length;
      const annualRent = bContracts.reduce((s, c) => s + c.annualRent, 0);
      const wault = annualRent > 0 ? bContracts.reduce((s, c) => s + c.remainingTermYears * c.annualRent, 0) / annualRent : 0;
      const effectiveWault = annualRent > 0 ? bContracts.reduce((s, c) => s + c.effectiveRemainingYears * c.annualRent, 0) / annualRent : 0;
      const incomeAtRisk = bContracts.filter((c) => c.remainingTermYears < 1).reduce((s, c) => s + c.annualRent, 0);
      return { buildingId: b.id, name: b.name, contractCount, annualRent, wault, effectiveWault, incomeAtRisk };
    });
  }, [kpis.filteredBuildings, activeContracts]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return copy;
  }, [rows, sortKey, sortAsc]);

  const totals = useMemo(() => {
    const contractCount = rows.reduce((s, r) => s + r.contractCount, 0);
    const annualRent = rows.reduce((s, r) => s + r.annualRent, 0);
    const wault = annualRent > 0 ? rows.reduce((s, r) => s + r.wault * r.annualRent, 0) / annualRent : 0;
    const effectiveWault = annualRent > 0 ? rows.reduce((s, r) => s + r.effectiveWault * r.annualRent, 0) / annualRent : 0;
    const incomeAtRisk = rows.reduce((s, r) => s + r.incomeAtRisk, 0);
    return { contractCount, annualRent, wault, effectiveWault, incomeAtRisk };
  }, [rows]);

  function handleSort(key: BuildingSortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'wault');
    }
  }

  function sortIndicator(key: BuildingSortKey) {
    if (sortKey !== key) return '';
    return sortAsc ? ' \u25B2' : ' \u25BC';
  }

  return (
    <div className="report-section">
      <h3 className="report-section__title">WAULT per bygg</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>Bygg{sortIndicator('name')}</th>
            <th data-align="right" style={{ cursor: 'pointer' }} onClick={() => handleSort('contractCount')}>Antall avtaler{sortIndicator('contractCount')}</th>
            <th data-align="right" style={{ cursor: 'pointer' }} onClick={() => handleSort('annualRent')}>Årlig leie{sortIndicator('annualRent')}</th>
            <th data-align="right" style={{ cursor: 'pointer' }} onClick={() => handleSort('wault')}>WAULT{sortIndicator('wault')}</th>
            <th data-align="right" style={{ cursor: 'pointer' }} onClick={() => handleSort('effectiveWault')}>Eff. WAULT{sortIndicator('effectiveWault')}</th>
            <th data-align="right" style={{ cursor: 'pointer' }} onClick={() => handleSort('incomeAtRisk')}>Inntekt i risiko{sortIndicator('incomeAtRisk')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.buildingId}>
              <td>
                <Link to={`/bygg/${r.buildingId}`} className="report-table__link">{r.name}</Link>
              </td>
              <td data-align="right">{r.contractCount}</td>
              <td data-align="right">{formatNOK(r.annualRent)}</td>
              <td data-align="right" style={{ color: remainColor(r.wault) }}>{formatYears(r.wault)}</td>
              <td data-align="right" style={{ color: remainColor(r.effectiveWault) }}>{formatYears(r.effectiveWault)}</td>
              <td data-align="right" style={{ color: r.incomeAtRisk > 0 ? 'var(--color-red, #f87171)' : undefined }}>{formatNOK(r.incomeAtRisk)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 600 }}>
            <td>Totalt</td>
            <td data-align="right">{totals.contractCount}</td>
            <td data-align="right">{formatNOK(totals.annualRent)}</td>
            <td data-align="right" style={{ color: remainColor(totals.wault) }}>{formatYears(totals.wault)}</td>
            <td data-align="right" style={{ color: remainColor(totals.effectiveWault) }}>{formatYears(totals.effectiveWault)}</td>
            <td data-align="right" style={{ color: totals.incomeAtRisk > 0 ? 'var(--color-red, #f87171)' : undefined }}>{formatNOK(totals.incomeAtRisk)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ─── Section D: Contract Detail Table ─── */

type ContractSortKey = 'tenantName' | 'buildingName' | 'areaType' | 'areaM2' | 'annualRent' | 'startDate' | 'endDate' | 'remainingTermYears' | 'status';

interface ContractRow {
  id: string;
  tenantName: string;
  tenantIsBankrupt: boolean;
  buildingName: string;
  buildingId: string;
  areaType: string;
  areaM2: number;
  annualRent: number;
  startDate: string;
  endDate: string;
  remainingTermYears: number;
  status: 'active' | 'expiring_soon';
}

function SectionD({ kpis }: { kpis: PortfolioKPIs }) {
  const { contracts } = usePortfolioContext();
  const [sortKey, setSortKey] = useState<ContractSortKey>('remainingTermYears');
  const [sortAsc, setSortAsc] = useState(true);

  const buildingMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of kpis.filteredBuildings) {
      map.set(b.id, b.name);
    }
    return map;
  }, [kpis.filteredBuildings]);

  const filteredBuildingIds = useMemo(() => new Set(kpis.filteredBuildings.map((b) => b.id)), [kpis.filteredBuildings]);

  const rows: ContractRow[] = useMemo(
    () =>
      contracts
        .filter(
          (c): c is typeof c & { status: 'active' | 'expiring_soon' } =>
            (c.status === 'active' || c.status === 'expiring_soon') &&
            filteredBuildingIds.has(c.buildingId),
        )
        .map((c) => ({
          id: c.id,
          tenantName: c.tenantName,
          tenantIsBankrupt: c.tenantIsBankrupt,
          buildingName: buildingMap.get(c.buildingId) ?? c.buildingId,
          buildingId: c.buildingId,
          areaType: c.areaType,
          areaM2: c.areaM2,
          annualRent: c.annualRent,
          startDate: c.startDate,
          endDate: c.endDate,
          remainingTermYears: c.remainingTermYears,
          status: c.status,
        })),
    [contracts, filteredBuildingIds, buildingMap],
  );

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      if (typeof av === 'boolean' && typeof bv === 'boolean') return sortAsc ? (av ? 1 : 0) - (bv ? 1 : 0) : (bv ? 1 : 0) - (av ? 1 : 0);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return copy;
  }, [rows, sortKey, sortAsc]);

  function handleSort(key: ContractSortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'remainingTermYears');
    }
  }

  function sortIndicator(key: ContractSortKey) {
    if (sortKey !== key) return '';
    return sortAsc ? ' \u25B2' : ' \u25BC';
  }

  function formatDate(iso: string): string {
    return dateFmt.format(new Date(iso));
  }

  function statusBadge(status: 'active' | 'expiring_soon') {
    if (status === 'expiring_soon') {
      return <span className="report-table__badge" style={{ background: 'var(--color-yellow, #facc15)', color: '#000' }}>Utløper snart</span>;
    }
    return <span className="report-table__badge" style={{ background: 'var(--color-green, #4ade80)', color: '#000' }}>Aktiv</span>;
  }

  return (
    <div className="report-section">
      <h3 className="report-section__title">Kontraktsdetaljer</h3>
      {rows.length > 0 ? (
        <table className="report-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('tenantName')}>Leietaker{sortIndicator('tenantName')}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('buildingName')}>Bygg{sortIndicator('buildingName')}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('areaType')}>Arealtype{sortIndicator('areaType')}</th>
              <th data-align="right" style={{ cursor: 'pointer' }} onClick={() => handleSort('areaM2')}>m²{sortIndicator('areaM2')}</th>
              <th data-align="right" style={{ cursor: 'pointer' }} onClick={() => handleSort('annualRent')}>Årlig leie{sortIndicator('annualRent')}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('startDate')}>Start{sortIndicator('startDate')}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('endDate')}>Slutt{sortIndicator('endDate')}</th>
              <th data-align="right" style={{ cursor: 'pointer' }} onClick={() => handleSort('remainingTermYears')}>Gjenstår{sortIndicator('remainingTermYears')}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>Status{sortIndicator('status')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.tenantName}
                  {r.tenantIsBankrupt && (
                    <span className="report-table__badge" style={{ background: 'var(--color-red, #f87171)', color: '#fff', marginLeft: 6 }}>KONKURS</span>
                  )}
                </td>
                <td>
                  <Link to={`/bygg/${r.buildingId}`} className="report-table__link">{r.buildingName}</Link>
                </td>
                <td>{r.areaType}</td>
                <td data-align="right">{formatNumber(r.areaM2, 0)}</td>
                <td data-align="right">{formatNOK(r.annualRent)}</td>
                <td>{formatDate(r.startDate)}</td>
                <td>{formatDate(r.endDate)}</td>
                <td data-align="right" style={{ color: remainColor(r.remainingTermYears) }}>{formatYears(r.remainingTermYears)}</td>
                <td>{statusBadge(r.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: 'var(--app-text-dim)', fontSize: 'var(--font-size-body)' }}>Ingen aktive kontrakter</p>
      )}
    </div>
  );
}

/* ─── Main Export ─── */

export function ContractAnalysisReport() {
  return (
    <ReportLayout title="Kontraktsanalyse">
      {(kpis) => (
        <>
          <SectionA kpis={kpis} />
          <SectionB kpis={kpis} />
          <SectionC kpis={kpis} />
          <SectionD kpis={kpis} />
        </>
      )}
    </ReportLayout>
  );
}
