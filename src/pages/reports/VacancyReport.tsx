import { Link } from 'react-router-dom';
import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { VacancyCostPortfolioCard } from '../../components/dashboard/VacancyCostPortfolioCard.tsx';
import { formatNOK, formatM2, formatPercent } from '../../utils/formatters.ts';

export function VacancyReport() {
  return (
    <ReportLayout title="Ledighetsoversikt">
      {(kpis) => {
        const ranked = kpis.filteredBuildings
          .map((b) => ({
            building: b,
            vacantM2: b.totalRentableM2 - b.committedM2,
            vacancyCost: (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0),
          }))
          .sort((a, b) => b.vacancyCost - a.vacancyCost);

        return (
          <>
            <VacancyCostPortfolioCard kpis={kpis} />
            <div style={{ backgroundColor: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 'var(--radius-card)', padding: 'var(--padding-section)' }}>
              <h3 style={{ fontSize: 'var(--font-size-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--app-text-muted)', marginBottom: 12 }}>LEDIGHET PER BYGG</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--app-border-mid)', textAlign: 'left', fontSize: 'var(--font-size-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--app-text-muted)' }}>Bygning</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--app-border-mid)', textAlign: 'right', fontSize: 'var(--font-size-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--app-text-muted)' }}>Ledig m²</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--app-border-mid)', textAlign: 'right', fontSize: 'var(--font-size-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--app-text-muted)' }}>Ledighetsgrad</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--app-border-mid)', textAlign: 'right', fontSize: 'var(--font-size-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--app-text-muted)' }}>Ledighetskostnad</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((r) => (
                    <tr key={r.building.id}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-border)', fontSize: 'var(--font-size-body)' }}>
                        <Link to={`/bygg/${r.building.id}`} style={{ color: 'var(--app-text-secondary)', textDecoration: 'none' }}>{r.building.name}</Link>
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-border)', textAlign: 'right', fontSize: 'var(--font-size-body)', color: 'var(--app-text-secondary)' }}>{formatM2(r.vacantM2)}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-border)', textAlign: 'right', fontSize: 'var(--font-size-body)', color: 'var(--app-text-secondary)' }}>{formatPercent(r.building.vacancyRate * 100)}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-border)', textAlign: 'right', fontSize: 'var(--font-size-body)', color: r.vacancyCost > 0 ? 'var(--color-red)' : 'var(--color-green)' }}>{formatNOK(r.vacancyCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      }}
    </ReportLayout>
  );
}
