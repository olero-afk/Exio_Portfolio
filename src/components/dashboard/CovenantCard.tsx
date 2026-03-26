import './CovenantCard.css';

export function CovenantCard() {
  return (
    <div className="cov-card">
      <span className="cov-card__title">COVENANT-STATUS</span>
      <div className="cov-card__grid">
        <div className="cov-card__placeholder">
          <span className="cov-card__metric-title">LTV</span>
          <span className="cov-card__badge">Kommer</span>
        </div>
        <div className="cov-card__placeholder">
          <span className="cov-card__metric-title">DSCR</span>
          <span className="cov-card__badge">Kommer</span>
        </div>
      </div>
      <div className="cov-card__footer">Planlagt Q4 2026</div>
    </div>
  );
}
