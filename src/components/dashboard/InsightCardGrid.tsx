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
  info: '#22d4e8',
  warning: '#facc15',
  positive: '#4ade80',
  negative: '#f87171',
};

export function InsightCardGrid({ insights, aiTexts, muligheter, risiko }: InsightCardGridProps) {
  const kpiCards = insights.slice(0, 4);

  // Pad to 4 if needed
  while (kpiCards.length < 4) {
    kpiCards.push({ id: `empty-${kpiCards.length}`, title: '—', value: '—', detail: '', severity: 'info' });
  }

  return (
    <div className="insight-grid">
      {/* Cards 1-4: KPI cards with AI text */}
      {kpiCards.map((insight) => {
        const color = severityColors[insight.severity] ?? severityColors.info;
        const aiText = aiTexts.get(insight.id);
        const isLoading = aiTexts.has(insight.id) && aiText === null;

        const content = (
          <div className="insight-grid__card" style={{ borderTopColor: color }}>
            <div className="insight-grid__card-header">
              <span className="insight-grid__card-title">{insight.title}</span>
              <span className="insight-grid__card-dot" style={{ backgroundColor: color }} />
            </div>
            <div className="insight-grid__card-value" style={{ color }}>{insight.value}</div>
            {isLoading ? (
              <p className="insight-grid__card-detail insight-grid__card-detail--loading">Analyserer...</p>
            ) : (
              <p className="insight-grid__card-detail">{aiText ?? insight.detail}</p>
            )}
            {insight.link && <span className="insight-grid__card-link">Se detaljer →</span>}
          </div>
        );

        return insight.link ? (
          <Link key={insight.id} to={insight.link} className="insight-grid__card-wrapper">{content}</Link>
        ) : (
          <div key={insight.id} className="insight-grid__card-wrapper">{content}</div>
        );
      })}

      {/* Card 5: Muligheter */}
      <Link to={muligheter.link} className="insight-grid__card-wrapper">
        <div className="insight-grid__summary-card insight-grid__summary-card--muligheter">
          <span className="insight-grid__summary-title insight-grid__summary-title--green">MULIGHETER</span>
          <ul className="insight-grid__summary-bullets">
            {muligheter.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <div className="insight-grid__summary-bottom insight-grid__summary-bottom--green">{muligheter.bottomLine}</div>
          <span className="insight-grid__card-link">Se muligheter →</span>
        </div>
      </Link>

      {/* Card 6: Risiko */}
      <Link to={risiko.link} className="insight-grid__card-wrapper">
        <div className="insight-grid__summary-card insight-grid__summary-card--risiko">
          <span className="insight-grid__summary-title insight-grid__summary-title--red">RISIKO</span>
          <ul className="insight-grid__summary-bullets">
            {risiko.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <div className="insight-grid__summary-bottom insight-grid__summary-bottom--red">{risiko.bottomLine}</div>
          <span className="insight-grid__card-link">Se risikoer →</span>
        </div>
      </Link>
    </div>
  );
}
