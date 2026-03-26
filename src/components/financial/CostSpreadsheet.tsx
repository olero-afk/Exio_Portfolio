import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, formatNumber } from '../../utils/formatters.ts';
import type { Building } from '../../types/index.ts';
import './CostSpreadsheet.css';

interface CostSpreadsheetProps {
  building: Building;
}

const STANDARD_CATS = ['drift', 'vedlikehold', 'forsikring', 'administrasjon', 'eiendomsskatt'];
const CAT_LABELS: Record<string, string> = {
  drift: 'Drift', vedlikehold: 'Vedlikehold', forsikring: 'Forsikring',
  administrasjon: 'Administrasjon', eiendomsskatt: 'Eiendomsskatt',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

type GridData = Map<string, number[]>; // category → [month1..month12]

function parseNumber(s: string): number {
  const cleaned = s.replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatCell(n: number): string {
  if (n === 0) return '—';
  return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(n);
}

export function CostSpreadsheet({ building }: CostSpreadsheetProps) {
  const { costs, budgets, contracts } = usePortfolioContext();
  const [year, setYear] = useState(2026);
  const [toast, setToast] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Build grid from existing cost data
  const [grid, setGrid] = useState<GridData>(() => buildGrid(costs, building.id, year));
  const [categories, setCategories] = useState<string[]>(() => buildCategories(costs, building.id, year));

  // Rebuild when year or building changes
  useEffect(() => {
    setGrid(buildGrid(costs, building.id, year));
    setCategories(buildCategories(costs, building.id, year));
  }, [costs, building.id, year]);

  // Editing state
  const [editCell, setEditCell] = useState<{ cat: string; month: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [editCell]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }
  }, [toast]);

  const startEdit = useCallback((cat: string, month: number) => {
    const val = grid.get(cat)?.[month] ?? 0;
    setEditCell({ cat, month });
    setEditValue(val === 0 ? '' : String(val));
  }, [grid]);

  const commitEdit = useCallback(() => {
    if (!editCell) return;
    const num = parseNumber(editValue);
    setGrid((prev) => {
      const next = new Map(prev);
      const row = [...(next.get(editCell.cat) ?? new Array(12).fill(0))];
      row[editCell.month] = num;
      next.set(editCell.cat, row);
      return next;
    });
    setEditCell(null);
  }, [editCell, editValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editCell) return;
    if (e.key === 'Enter') {
      commitEdit();
      // Move down
      const idx = categories.indexOf(editCell.cat);
      if (idx < categories.length - 1) startEdit(categories[idx + 1], editCell.month);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      commitEdit();
      const nextMonth = e.shiftKey ? editCell.month - 1 : editCell.month + 1;
      if (nextMonth >= 0 && nextMonth < 12) startEdit(editCell.cat, nextMonth);
    } else if (e.key === 'Escape') {
      setEditCell(null);
    }
  }, [editCell, editValue, categories, commitEdit, startEdit]);

  // Paste handler
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (!editCell) return;
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const rows = text.split('\n').filter((r) => r.trim());
    let count = 0;
    setGrid((prev) => {
      const next = new Map(prev);
      const catIdx = categories.indexOf(editCell.cat);
      for (let r = 0; r < rows.length && catIdx + r < categories.length; r++) {
        const cells = rows[r].split('\t');
        const cat = categories[catIdx + r];
        const row = [...(next.get(cat) ?? new Array(12).fill(0))];
        for (let c = 0; c < cells.length && editCell.month + c < 12; c++) {
          row[editCell.month + c] = parseNumber(cells[c]);
          count++;
        }
        next.set(cat, row);
      }
      return next;
    });
    setEditCell(null);
    setToast(`Limt inn ${count} verdier`);
  }, [editCell, categories]);

  // Add custom category
  const addCategory = useCallback(() => {
    const name = newCatName.trim();
    if (!name || categories.includes(name.toLowerCase())) return;
    const key = name.toLowerCase();
    setCategories((prev) => [...prev, key]);
    setGrid((prev) => { const next = new Map(prev); next.set(key, new Array(12).fill(0)); return next; });
    CAT_LABELS[key] = name;
    setNewCatName('');
    setAddingCategory(false);
  }, [newCatName, categories]);

  // Computed totals
  const rowTotals = useMemo(() => {
    const m = new Map<string, number>();
    for (const cat of categories) {
      m.set(cat, (grid.get(cat) ?? []).reduce((s, v) => s + v, 0));
    }
    return m;
  }, [grid, categories]);

  const colTotals = useMemo(() => {
    const arr = new Array(12).fill(0);
    for (const cat of categories) {
      const row = grid.get(cat) ?? [];
      for (let i = 0; i < 12; i++) arr[i] += row[i] ?? 0;
    }
    return arr;
  }, [grid, categories]);

  const grandTotal = colTotals.reduce((s, v) => s + v, 0);

  // NOI calculation
  const activeContracts = contracts.filter((c) => c.buildingId === building.id && (c.status === 'active' || c.status === 'expiring_soon'));
  const grossIncome = activeContracts.reduce((s, c) => s + c.annualRent, 0);
  const noi = grossIncome - grandTotal;
  const noiPerM2 = building.totalRentableM2 > 0 ? noi / building.totalRentableM2 : 0;
  const noiMargin = grossIncome > 0 ? (noi / grossIncome) * 100 : 0;
  const costPerM2Total = building.totalRentableM2 > 0 ? grandTotal / building.totalRentableM2 : 0;

  // Portfolio avg cost/m² for comparison
  const allBuildingCosts = costs.reduce((s, c) => s + c.amount, 0);
  const allMs = new Set(costs.map((c) => `${c.year}-${c.month}`)).size;
  const allRentable = 52400; // approximate total from all buildings
  const portfolioAvg = allMs > 0 && allRentable > 0 ? (allBuildingCosts / allMs * 12) / allRentable : 0;

  // Budget data
  const budgetGrid = useMemo(() => {
    const bg = new Map<string, number[]>();
    const bc = budgets.filter((b) => b.buildingId === building.id && b.year === year);
    for (const b of bc) {
      if (!bg.has(b.category)) bg.set(b.category, new Array(12).fill(0));
      const row = bg.get(b.category)!;
      row[b.month - 1] += b.amount;
    }
    return bg;
  }, [budgets, building.id, year]);
  const hasBudget = budgetGrid.size > 0;
  const budgetColTotals = useMemo(() => {
    const arr = new Array(12).fill(0);
    for (const row of budgetGrid.values()) {
      for (let i = 0; i < 12; i++) arr[i] += row[i] ?? 0;
    }
    return arr;
  }, [budgetGrid]);

  // Cost per m² by category chart
  const catCostPerM2 = categories.map((cat) => ({
    cat: CAT_LABELS[cat] ?? cat,
    value: building.totalRentableM2 > 0 ? (rowTotals.get(cat) ?? 0) / building.totalRentableM2 : 0,
  }));

  const costBarOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: ['#22d4e8'],
    plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '60%' } },
    xaxis: { labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: string) => formatNumber(Number(v), 0) + ' kr' }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: '#9a9a9a', fontSize: '10px' } } },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) + '/m²' } },
    dataLabels: { enabled: false },
  };

  const budgetBarOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    theme: { mode: 'dark' },
    colors: ['#22d4e8', '#7a7a7a'],
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 2 } },
    xaxis: { categories: MONTHS, labels: { style: { colors: '#7a7a7a', fontSize: '9px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#7a7a7a', fontSize: '9px' }, formatter: (v: number) => formatNumber(v / 1000) + 'k' } },
    grid: { borderColor: 'rgba(255,255,255,0.04)', strokeDashArray: 3 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => formatNOK(v) } },
    legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#7a7a7a' }, fontSize: '9px', markers: { size: 4 } },
    dataLabels: { enabled: false },
  };

  return (
    <div className="cost-sheet">
      {/* Spreadsheet */}
      <div className="cost-sheet__section">
        <div className="cost-sheet__header">
          <h3 className="cost-sheet__title">Driftskostnader</h3>
          <select className="cost-sheet__year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
        <div className="cost-sheet__scroll" onPaste={handlePaste}>
          <table className="cost-sheet__grid">
            <thead>
              <tr>
                <th className="cost-sheet__cat-header">Kategori</th>
                {MONTHS.map((m, i) => <th key={i} className="cost-sheet__month-header">{m}</th>)}
                <th className="cost-sheet__total-header">Total</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const row = grid.get(cat) ?? new Array(12).fill(0);
                return (
                  <tr key={cat}>
                    <td className="cost-sheet__cat-cell">{CAT_LABELS[cat] ?? cat}</td>
                    {row.map((val, m) => {
                      const isEditing = editCell?.cat === cat && editCell.month === m;
                      return (
                        <td key={m} className={`cost-sheet__cell ${isEditing ? 'cost-sheet__cell--editing' : ''}`}
                            onClick={() => startEdit(cat, m)}>
                          {isEditing ? (
                            <input ref={inputRef} className="cost-sheet__input" value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={commitEdit} onKeyDown={handleKeyDown} />
                          ) : (
                            <span className={val === 0 ? 'cost-sheet__cell--empty' : ''}>{formatCell(val)}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="cost-sheet__total-cell">{formatCell(rowTotals.get(cat) ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="cost-sheet__total-row">
                <td className="cost-sheet__cat-cell"><strong>TOTAL</strong></td>
                {colTotals.map((v, i) => <td key={i} className="cost-sheet__total-cell"><strong>{formatCell(v)}</strong></td>)}
                <td className="cost-sheet__grand-total"><strong>{formatCell(grandTotal)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {addingCategory ? (
          <div className="cost-sheet__add-row">
            <input className="cost-sheet__add-input" placeholder="Kategorinavn..." value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)} autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') setAddingCategory(false); }} />
            <button className="cost-sheet__add-btn" onClick={addCategory}>Legg til</button>
            <button className="cost-sheet__add-cancel" onClick={() => setAddingCategory(false)}>Avbryt</button>
          </div>
        ) : (
          <button className="cost-sheet__add-trigger" onClick={() => setAddingCategory(true)}>+ Legg til kategori</button>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="cost-sheet__toast">{toast}</div>}

      {/* Section B: NOI */}
      <div className="cost-sheet__section">
        <h3 className="cost-sheet__title">NOI Beregning</h3>
        <div className="cost-sheet__noi-grid">
          <div className="cost-sheet__noi-card">
            <span className="cost-sheet__noi-label">Leieinntekter</span>
            <span className="cost-sheet__noi-value">{formatNOK(grossIncome)}</span>
          </div>
          <div className="cost-sheet__noi-card">
            <span className="cost-sheet__noi-label">Driftskostnader</span>
            <span className="cost-sheet__noi-value" style={{ color: '#f87171' }}>−{formatNOK(grandTotal)}</span>
          </div>
          <div className="cost-sheet__noi-card cost-sheet__noi-card--highlight">
            <span className="cost-sheet__noi-label">NOI</span>
            <span className="cost-sheet__noi-value" style={{ color: noi >= 0 ? '#4ade80' : '#f87171' }}>{formatNOK(noi)}</span>
          </div>
        </div>
        <div className="cost-sheet__noi-sub">
          <span>NOI per m²: <strong>{formatNOK(noiPerM2)}</strong></span>
          <span>NOI-margin: <strong>{formatPercent(noiMargin)}</strong></span>
        </div>
      </div>

      {/* Section C: Cost per m² */}
      <div className="cost-sheet__section">
        <h3 className="cost-sheet__title">Kostnad per m²</h3>
        <div className="cost-sheet__cost-header">
          <div className="cost-sheet__noi-card">
            <span className="cost-sheet__noi-label">Total kostnad/m²</span>
            <span className="cost-sheet__noi-value">{formatNOK(costPerM2Total)}</span>
          </div>
          <span className="cost-sheet__cost-compare">
            Porteføljesnitt: {formatNOK(portfolioAvg)}/m² ({costPerM2Total > portfolioAvg ? '+' : ''}{formatNOK(costPerM2Total - portfolioAvg)} vs. snitt)
          </span>
        </div>
        {catCostPerM2.length > 0 && (
          <ReactApexChart options={costBarOpts} series={[{ name: 'Kostnad/m²', data: catCostPerM2.map((c) => ({ x: c.cat, y: Math.round(c.value) })) }]} type="bar" height={catCostPerM2.length * 36 + 30} />
        )}
      </div>

      {/* Section D: Budget vs Actual */}
      <div className="cost-sheet__section">
        <h3 className="cost-sheet__title">Budsjett vs. Faktisk</h3>
        {hasBudget ? (
          <ReactApexChart options={budgetBarOpts} series={[
            { name: 'Faktisk', data: colTotals },
            { name: 'Budsjett', data: budgetColTotals },
          ]} type="bar" height={220} />
        ) : (
          <p className="cost-sheet__empty">Ingen budsjettdata registrert for {year}</p>
        )}
      </div>
    </div>
  );
}

function buildGrid(costs: ReturnType<typeof usePortfolioContext>['costs'], buildingId: string, year: number): GridData {
  const grid: GridData = new Map();
  const bc = costs.filter((c) => c.buildingId === buildingId && c.year === year);
  for (const c of bc) {
    if (!grid.has(c.category)) grid.set(c.category, new Array(12).fill(0));
    const row = grid.get(c.category)!;
    row[c.month - 1] += c.amount;
  }
  // Ensure standard categories exist
  for (const cat of STANDARD_CATS) {
    if (!grid.has(cat)) grid.set(cat, new Array(12).fill(0));
  }
  return grid;
}

function buildCategories(costs: ReturnType<typeof usePortfolioContext>['costs'], buildingId: string, year: number): string[] {
  const bc = costs.filter((c) => c.buildingId === buildingId && c.year === year);
  const cats = new Set(STANDARD_CATS);
  for (const c of bc) cats.add(c.category);
  return Array.from(cats).sort((a, b) => {
    const ia = STANDARD_CATS.indexOf(a);
    const ib = STANDARD_CATS.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}
