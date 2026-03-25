import { useState, type ReactNode } from 'react';
import './KPICard.css';

interface TooltipData {
  title: string;
  formula: string;
  values: string;
  source: string;
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  tooltip: TooltipData;
  negative?: boolean;
  children?: ReactNode;
}

export function KPICard({ title, value, subtitle, tooltip, negative, children }: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="kpi-card">
      <div className="kpi-card__header">
        <span className="kpi-card__title">{title}</span>
        <div
          className="kpi-card__info"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span className="kpi-card__info-icon">ⓘ</span>
          {showTooltip && (
            <div className="kpi-card__tooltip">
              <div className="kpi-card__tooltip-title">{tooltip.title}</div>
              <div className="kpi-card__tooltip-row">
                <span className="kpi-card__tooltip-label">Formel:</span>
                <span>{tooltip.formula}</span>
              </div>
              <div className="kpi-card__tooltip-row">
                <span className="kpi-card__tooltip-label">Verdier:</span>
                <span>{tooltip.values}</span>
              </div>
              <div className="kpi-card__tooltip-row">
                <span className="kpi-card__tooltip-label">Kilde:</span>
                <span>{tooltip.source}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={`kpi-card__value ${negative ? 'negative' : ''}`}>{value}</div>
      {subtitle && <div className="kpi-card__subtitle">{subtitle}</div>}
      {children && <div className="kpi-card__content">{children}</div>}
    </div>
  );
}
