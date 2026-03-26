import { Link } from 'react-router-dom';
import type { Insight } from '../../hooks/usePersonaInsights.ts';
import type { SummaryCard } from '../../hooks/useOpportunityRisk.ts';
import './InsightCardGrid.css';

interface Props {
  insights: Insight[];
  muligheter: SummaryCard;
  risiko: SummaryCard;
}

const SEV_COLORS: Record<string, string> = {
  info: '#22d4e8', warning: '#FED092', positive: '#4ade80', negative: '#f87171',
};

export function InsightCardGrid({ insights, muligheter, risiko }: Props) {
  const cards = insights.slice(0, 4);
  while (cards.length < 4) cards.push({ id: `e${cards.length}`, title: '—', value: '—', context: '', severity: 'info' });

  return (
    <div className="cg">
      {cards.map((c) => {
        const color = SEV_COLORS[c.severity];
        const inner = (
          <div className="cg__kpi" style={{ borderLeftColor: color }}>
            <span className="cg__kpi-title">{c.title}</span>
            <span className="cg__kpi-value" style={{ color }}>{c.value}</span>
            <span className="cg__kpi-ctx">{c.context}</span>
            <span className="cg__kpi-link">Se detaljer →</span>
          </div>
        );
        return c.link ? <Link key={c.id} to={c.link} className="cg__wrap">{inner}</Link> : <div key={c.id} className="cg__wrap">{inner}</div>;
      })}

      <Link to={muligheter.link} className="cg__wrap">
        <div className="cg__sum cg__sum--green">
          <span className="cg__sum-title cg__sum-title--green">MULIGHETER</span>
          <ul className="cg__sum-list">
            {muligheter.bullets.map((b, i) => (
              <li key={i} className="cg__sum-bullet">
                <span className="cg__sum-text">{b.action}{b.detail ? ` — ${b.detail}` : ''}</span>
                {b.amount && <span className="cg__sum-amt cg__sum-amt--green">{b.amount}</span>}
              </li>
            ))}
          </ul>
          <div className="cg__sum-bottom cg__sum-bottom--green">{muligheter.bottomLine}</div>
          <span className="cg__kpi-link">Se muligheter →</span>
        </div>
      </Link>

      <Link to={risiko.link} className="cg__wrap">
        <div className="cg__sum cg__sum--red">
          <span className="cg__sum-title cg__sum-title--red">RISIKO</span>
          <ul className="cg__sum-list">
            {risiko.bullets.map((b, i) => (
              <li key={i} className="cg__sum-bullet">
                <span className="cg__sum-text">{b.action}{b.detail ? ` — ${b.detail}` : ''}</span>
                {b.amount && <span className="cg__sum-amt cg__sum-amt--red">{b.amount}</span>}
              </li>
            ))}
          </ul>
          <div className="cg__sum-bottom cg__sum-bottom--red">{risiko.bottomLine}</div>
          <span className="cg__kpi-link">Se risikoer →</span>
        </div>
      </Link>
    </div>
  );
}
