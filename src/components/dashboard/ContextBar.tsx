import { usePersona } from '../../context/PersonaContext.tsx';
import { usePortfolioContext } from '../../context/PortfolioContext.tsx';
import { formatNOK, formatPercent, formatYears } from '../../utils/formatters.ts';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import './ContextBar.css';

interface ContextBarProps {
  kpis: PortfolioKPIs;
}

export function ContextBar({ kpis }: ContextBarProps) {
  const { persona, clients } = usePersona();
  const { funds, contracts } = usePortfolioContext();

  const expiringCount = contracts.filter((c) => c.status === 'expiring_soon').length;

  let segments: string[];

  if (persona === 'eier') {
    segments = [
      `${kpis.buildingCount} BYGG`,
      `PORTEFØLJEVERDI: ${formatNOK(kpis.totalPortfolioValue)}`,
      `NOI-YIELD: ${formatPercent(kpis.noiYield)}`,
      `WAULT: ${formatYears(kpis.portfolioWAULT)}`,
    ];
  } else if (persona === 'investor') {
    segments = [
      `${funds.length} FOND`,
      `${kpis.buildingCount} BYGG`,
      `PORTEFØLJEVERDI: ${formatNOK(kpis.totalPortfolioValue)}`,
      `NOI-YIELD: ${formatPercent(kpis.noiYield)}`,
      `WAULT: ${formatYears(kpis.portfolioWAULT)}`,
    ];
  } else {
    segments = [
      `${clients.length} KUNDER`,
      `${kpis.buildingCount} BYGG`,
      `FORVALTET KAPITAL: ${formatNOK(kpis.totalPortfolioValue)}`,
      `${expiringCount} KONTRAKTER UTLØPER`,
    ];
  }

  return (
    <div className="context-bar">
      {segments.map((seg, i) => (
        <span key={i} className="context-bar__segment">
          {i > 0 && <span className="context-bar__pipe">|</span>}
          {seg}
        </span>
      ))}
    </div>
  );
}
