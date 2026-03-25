import { useMemo } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK } from '../../utils/formatters.ts';
import './CostTable.css';

interface CostTableProps {
  buildingId: string;
}

const categoryLabels: Record<string, string> = {
  drift: 'Drift',
  vedlikehold: 'Vedlikehold',
  forsikring: 'Forsikring',
  administrasjon: 'Administrasjon',
  eiendomsskatt: 'Eiendomsskatt',
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

export function CostTable({ buildingId }: CostTableProps) {
  const { costs } = usePortfolioContext();

  const { categories, months, grid, categoryTotals, monthTotals, grandTotal } = useMemo(() => {
    const buildingCosts = costs.filter((c) => c.buildingId === buildingId);

    const catSet = new Set<string>();
    const monthSet = new Set<number>();
    for (const c of buildingCosts) {
      catSet.add(c.category);
      monthSet.add(c.month);
    }

    const cats = Array.from(catSet).sort((a, b) => {
      const order = ['drift', 'vedlikehold', 'forsikring', 'administrasjon', 'eiendomsskatt'];
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    const mos = Array.from(monthSet).sort((a, b) => a - b);

    const g: Map<string, Map<number, number>> = new Map();
    for (const cat of cats) {
      const row = new Map<number, number>();
      for (const m of mos) row.set(m, 0);
      g.set(cat, row);
    }
    for (const c of buildingCosts) {
      g.get(c.category)?.set(c.month, (g.get(c.category)?.get(c.month) ?? 0) + c.amount);
    }

    const catTotals = new Map<string, number>();
    for (const cat of cats) {
      catTotals.set(cat, mos.reduce((s, m) => s + (g.get(cat)?.get(m) ?? 0), 0));
    }

    const moTotals = new Map<number, number>();
    for (const m of mos) {
      moTotals.set(m, cats.reduce((s, cat) => s + (g.get(cat)?.get(m) ?? 0), 0));
    }

    const gt = Array.from(catTotals.values()).reduce((s, v) => s + v, 0);

    return { categories: cats, months: mos, grid: g, categoryTotals: catTotals, monthTotals: moTotals, grandTotal: gt };
  }, [costs, buildingId]);

  return (
    <div className="cost-table">
      <h3 className="cost-table__title">KOSTNADSSTRUKTUR</h3>
      <div className="cost-table__scroll">
        <table>
          <thead>
            <tr>
              <th>Kategori</th>
              {months.map((m) => (
                <th key={m} style={{ textAlign: 'right' }}>{monthNames[m - 1]}</th>
              ))}
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat}>
                <td>{categoryLabels[cat] ?? cat}</td>
                {months.map((m) => (
                  <td key={m} style={{ textAlign: 'right' }}>
                    {formatNOK(grid.get(cat)?.get(m) ?? 0)}
                  </td>
                ))}
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formatNOK(categoryTotals.get(cat) ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="cost-table__total-row">
              <td><strong>TOTAL</strong></td>
              {months.map((m) => (
                <td key={m} style={{ textAlign: 'right' }}>
                  <strong>{formatNOK(monthTotals.get(m) ?? 0)}</strong>
                </td>
              ))}
              <td style={{ textAlign: 'right' }}>
                <strong>{formatNOK(grandTotal)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
