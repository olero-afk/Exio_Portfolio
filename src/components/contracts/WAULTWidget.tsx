import { useMemo } from 'react';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatYears, formatNOK } from '../../utils/formatters.ts';
import type { Contract } from '../../types/index.ts';
import './WAULTWidget.css';

interface WAULTWidgetProps {
  buildingId: string;
}

export function WAULTWidget({ buildingId }: WAULTWidgetProps) {
  const { contracts } = usePortfolioContext();

  const { wault, effectiveWault, incomeAtRisk, activeCount, totalAnnualRent } = useMemo(() => {
    const active = contracts.filter(
      (c) => c.buildingId === buildingId && (c.status === 'active' || c.status === 'expiring_soon'),
    );
    const total = active.reduce((s, c) => s + c.annualRent, 0);

    const calcWault = (useEffective: boolean) => {
      if (total === 0) return 0;
      return active.reduce((sum, c) => {
        const term = useEffective ? c.effectiveRemainingYears : c.remainingTermYears;
        return sum + Math.max(0, term) * c.annualRent;
      }, 0) / total;
    };

    const risk = active
      .filter((c: Contract) => c.remainingTermYears < 1 && c.remainingTermYears > 0)
      .reduce((s: number, c: Contract) => s + c.annualRent, 0);

    return {
      wault: calcWault(false),
      effectiveWault: calcWault(true),
      incomeAtRisk: risk,
      activeCount: active.length,
      totalAnnualRent: total,
    };
  }, [contracts, buildingId]);

  return (
    <div className="wault-widget">
      <h3 className="wault-widget__title">WAULT</h3>
      <div className="wault-widget__grid">
        <div className="wault-widget__metric">
          <span className="wault-widget__label">WAULT</span>
          <span className="wault-widget__value">{formatYears(wault)}</span>
        </div>
        <div className="wault-widget__metric">
          <span className="wault-widget__label">Effektiv WAULT</span>
          <span className="wault-widget__value">{formatYears(effectiveWault)}</span>
        </div>
        <div className="wault-widget__metric">
          <span className="wault-widget__label">Inntekt i risiko (12 mnd)</span>
          <span className="wault-widget__value wault-widget__value--warning">
            {formatNOK(incomeAtRisk)}
          </span>
        </div>
        <div className="wault-widget__metric">
          <span className="wault-widget__label">Aktive kontrakter</span>
          <span className="wault-widget__value">{activeCount}</span>
        </div>
      </div>
      <div className="wault-widget__footer">
        Total årlig leie: {formatNOK(totalAnnualRent)}
      </div>
    </div>
  );
}
