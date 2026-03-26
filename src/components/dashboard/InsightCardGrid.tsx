import { Link } from 'react-router-dom';
import type { Insight } from '../../hooks/usePersonaInsights.ts';
import './InsightCardGrid.css';

interface InsightCardGridProps {
  insights: Insight[];
}

const severityColors: Record<string, string> = {
  info: '#22d4e8',
  warning: '#facc15',
  positive: '#4ade80',
  negative: '#f87171',
};

export function InsightCardGrid({ insights }: InsightCardGridProps) {
  // Always show exactly 6 cards
  const cards = insights.slice(0, 6);
  while (cards.length < 6) {
    cards.push({ id: `empty-${cards.length}`, title: '—', value: '—', detail: '', severity: 'info' });
  }

  return (
    <div className="insight-grid">
      {cards.map((insight) => {
        const color = severityColors[insight.severity] ?? severityColors.info;
        const content = (
          <div className="insight-grid__card" style={{ borderTopColor: color }}>
            <div className="insight-grid__card-header">
              <span className="insight-grid__card-title">{insight.title}</span>
              <span className="insight-grid__card-dot" style={{ backgroundColor: color }} />
            </div>
            <div className="insight-grid__card-value" style={{ color }}>{insight.value}</div>
            <p className="insight-grid__card-detail">{insight.detail}</p>
            {insight.link && (
              <span className="insight-grid__card-link">Se detaljer →</span>
            )}
          </div>
        );

        if (insight.link) {
          return <Link key={insight.id} to={insight.link} className="insight-grid__card-wrapper">{content}</Link>;
        }
        return <div key={insight.id} className="insight-grid__card-wrapper">{content}</div>;
      })}
    </div>
  );
}
