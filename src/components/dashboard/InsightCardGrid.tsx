import { Link } from 'react-router-dom';
import type { Insight } from '../../hooks/usePersonaInsights.ts';
import type { SummaryCard } from '../../hooks/useOpportunityRisk.ts';
import './InsightCardGrid.css';

interface InsightCardGridProps {
  insights: Insight[];
  aiTexts: Map<string, string | null>;
  muligheter: SummaryCard;
  risiko: SummaryCard;
}

const severityColors: Record<string, string> = {
  info: '#22d4e8', warning: '#facc15', positive: '#4ade80', negative: '#f87171',
};

export function InsightCardGrid({ insights, aiTexts, muligheter, risiko }: InsightCardGridProps) {
  const cards = insights.slice(0, 4);
  while (cards.length < 4) cards.push({ id: `empty-${cards.length}`, title: '—', value: '—', detail: '', severity: 'info', breakdown: [] });

  return (
    <div className="ig">
      {cards.map((ins) => {
        const color = severityColors[ins.severity] ?? severityColors.info;
        const aiText = aiTexts.get(ins.id);
        const isLoading = aiTexts.has(ins.id) && aiText === null;

        const inner = (
          <div className="ig__card" style={{ borderTopColor: color }}>
            <div className="ig__head"><span className="ig__title">{ins.title}</span><span className="ig__dot" style={{ backgroundColor: color }} /></div>
            <div className="ig__val" style={{ color }}>{ins.value}</div>
            {ins.trend && <div className="ig__trend">{ins.trend}</div>}
            {ins.breakdown.length > 0 && (
              <div className="ig__breakdown">
                {ins.breakdown.map((b, i) => (
                  <div key={i} className="ig__bk-row"><span className="ig__bk-label">{b.label}</span><span className="ig__bk-value">{b.value}</span></div>
                ))}
              </div>
            )}
            {isLoading ? (
              <p className="ig__detail ig__detail--loading">Analyserer...</p>
            ) : (
              <p className="ig__detail">{aiText ?? ins.detail}</p>
            )}
            {ins.link && <span className="ig__link">Se detaljer →</span>}
          </div>
        );

        return ins.link ? (
          <Link key={ins.id} to={ins.link} className="ig__wrap">{inner}</Link>
        ) : (
          <div key={ins.id} className="ig__wrap">{inner}</div>
        );
      })}

      {/* Card 5: Muligheter */}
      <Link to={muligheter.link} className="ig__wrap">
        <div className="ig__sum ig__sum--green">
          <span className="ig__sum-title ig__sum-title--green">MULIGHETER</span>
          <div className="ig__sum-bullets">
            {muligheter.bullets.map((b, i) => (
              <div key={i} className="ig__bullet">
                <div className="ig__bullet-main">
                  <span className="ig__bullet-action">{b.action}</span>
                  <span className="ig__bullet-detail">{b.detail}</span>
                </div>
                {b.amount && <span className="ig__bullet-amount ig__bullet-amount--green">{b.amount}</span>}
              </div>
            ))}
          </div>
          <div className="ig__sum-bottom ig__sum-bottom--green">{muligheter.bottomLine}</div>
          <span className="ig__link">Se muligheter →</span>
        </div>
      </Link>

      {/* Card 6: Risiko */}
      <Link to={risiko.link} className="ig__wrap">
        <div className="ig__sum ig__sum--red">
          <span className="ig__sum-title ig__sum-title--red">RISIKO</span>
          <div className="ig__sum-bullets">
            {risiko.bullets.map((b, i) => (
              <div key={i} className="ig__bullet">
                <div className="ig__bullet-main">
                  <span className="ig__bullet-action">{b.action}</span>
                  <span className="ig__bullet-detail">{b.detail}</span>
                </div>
                {b.amount && <span className="ig__bullet-amount ig__bullet-amount--red">{b.amount}</span>}
              </div>
            ))}
          </div>
          <div className="ig__sum-bottom ig__sum-bottom--red">{risiko.bottomLine}</div>
          <span className="ig__link">Se risikoer →</span>
        </div>
      </Link>
    </div>
  );
}
