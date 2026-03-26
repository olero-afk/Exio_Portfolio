import { useNavigate } from 'react-router-dom';
import type { Insight } from '../../hooks/usePersonaInsights.ts';
import type { SummaryCard } from '../../hooks/useOpportunityRisk.ts';
import { useFilterContext } from '../../context/FilterContext.tsx';
import './InsightCardGrid.css';

interface Props {
  insights: Insight[];
  muligheter: SummaryCard;
  risiko: SummaryCard;
}

const SEV_COLORS: Record<string, string> = {
  info: '#22d4e8', warning: '#FED092', positive: '#4ade80', negative: '#f87171',
};

/** Navigate to report page after clearing all filters so report shows full portfolio */
function useReportNav() {
  const navigate = useNavigate();
  const { setSelectedBuildingId, setSelectedFundId } = useFilterContext();
  return (path: string) => {
    setSelectedBuildingId(null);
    setSelectedFundId(null);
    navigate(path);
  };
}

function KpiCard({ c }: { c: Insight }) {
  const color = SEV_COLORS[c.severity];
  const navTo = useReportNav();

  return (
    <div className="cg__wrap" onClick={c.link ? () => navTo(c.link!) : undefined} style={{ cursor: c.link ? 'pointer' : undefined }}>
      <div className="cg__kpi" style={{ borderLeftColor: color }}>
        <span className="cg__kpi-title">{c.title}</span>
        <span className="cg__kpi-value" style={{ color }}>{c.value}</span>
        <span className="cg__kpi-ctx">{c.context}</span>
        {c.bullets.length > 0 && (
          <ul className="cg__kpi-bullets">
            {c.bullets.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        )}
        <span className="cg__kpi-link">Se detaljer →</span>
      </div>
    </div>
  );
}

function SumCard({ card, variant }: { card: SummaryCard; variant: 'green' | 'red' }) {
  const navTo = useReportNav();

  return (
    <div className="cg__wrap" onClick={() => navTo(card.link)} style={{ cursor: 'pointer' }}>
      <div className={`cg__sum cg__sum--${variant}`}>
        <span className={`cg__sum-title cg__sum-title--${variant}`}>{variant === 'green' ? 'MULIGHETER' : 'RISIKO'}</span>
        <ul className="cg__sum-list">
          {card.bullets.map((b, i) => (
            <li key={i} className="cg__sum-bullet">
              <span className="cg__sum-text">{b.action}{b.detail ? ` — ${b.detail}` : ''}</span>
              {b.amount && <span className={`cg__sum-amt cg__sum-amt--${variant}`}>{b.amount}</span>}
            </li>
          ))}
        </ul>
        <div className={`cg__sum-bottom cg__sum-bottom--${variant}`}>{card.bottomLine}</div>
        <span className="cg__kpi-link">{variant === 'green' ? 'Se muligheter' : 'Se risikoer'} →</span>
      </div>
    </div>
  );
}

export function InsightCardGrid({ insights, muligheter, risiko }: Props) {
  const cards = insights.slice(0, 4);
  while (cards.length < 4) cards.push({ id: `e${cards.length}`, title: '—', value: '—', context: '', bullets: [], severity: 'info' });

  return (
    <div className="cg">
      <KpiCard c={cards[0]} />
      <KpiCard c={cards[1]} />
      <SumCard card={muligheter} variant="green" />
      <KpiCard c={cards[2]} />
      <KpiCard c={cards[3]} />
      <SumCard card={risiko} variant="red" />
    </div>
  );
}
