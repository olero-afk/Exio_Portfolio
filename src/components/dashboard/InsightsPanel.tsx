import type { Insight } from '../../hooks/usePersonaInsights.ts';
import { usePersona } from '../../context/PersonaContext.tsx';
import './InsightsPanel.css';

interface InsightsPanelProps {
  insights: Insight[];
}

const severityColors: Record<string, string> = {
  info: 'var(--color-cyan)',
  warning: '#facc15',
  positive: 'var(--color-green)',
  negative: 'var(--color-red)',
};

const severityBg: Record<string, string> = {
  info: 'rgba(34, 212, 232, 0.06)',
  warning: 'rgba(250, 204, 21, 0.06)',
  positive: 'rgba(74, 222, 128, 0.06)',
  negative: 'rgba(248, 113, 113, 0.06)',
};

const personaLabels: Record<string, string> = {
  eier: 'Eier-innsikt',
  investor: 'Investor-innsikt',
  forvalter: 'Forvalter-innsikt',
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const { persona } = usePersona();

  if (insights.length === 0) return null;

  return (
    <div className="insights-panel">
      <div className="insights-panel__header">
        <span className="insights-panel__title">{personaLabels[persona] ?? 'INNSIKT'}</span>
        <span className="insights-panel__badge">{insights.length} KPI-er</span>
      </div>
      <div className="insights-panel__grid">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="insights-panel__card"
            style={{
              borderLeftColor: severityColors[insight.severity],
              backgroundColor: severityBg[insight.severity],
            }}
          >
            <div className="insights-panel__card-header">
              <span className="insights-panel__card-title">{insight.title}</span>
            </div>
            <div className="insights-panel__card-value" style={{ color: severityColors[insight.severity] }}>
              {insight.value}
            </div>
            <p className="insights-panel__card-detail">{insight.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
