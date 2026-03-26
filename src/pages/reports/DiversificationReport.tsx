import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { DiversificationCard } from '../../components/dashboard/DiversificationCard.tsx';
import { formatNOK, formatPercent } from '../../utils/formatters.ts';
import type { DiversificationSlice } from '../../types/index.ts';

function DataTable({ title, slices }: { title: string; slices: DiversificationSlice[] }) {
  return (
    <div style={{ backgroundColor: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 'var(--radius-card)', padding: 'var(--padding-section)' }}>
      <h3 style={{ fontSize: 'var(--font-size-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--app-text-muted)', marginBottom: 12 }}>{title}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--app-border-mid)', textAlign: 'left', fontSize: 'var(--font-size-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--app-text-muted)' }}>Kategori</th>
            <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--app-border-mid)', textAlign: 'right', fontSize: 'var(--font-size-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--app-text-muted)' }}>Årlig leie</th>
            <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--app-border-mid)', textAlign: 'right', fontSize: 'var(--font-size-label)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--app-text-muted)' }}>Andel</th>
          </tr>
        </thead>
        <tbody>
          {slices.map((s) => (
            <tr key={s.label}>
              <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-border)', fontSize: 'var(--font-size-body)', color: 'var(--app-text-secondary)' }}>{s.label}</td>
              <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-border)', textAlign: 'right', fontSize: 'var(--font-size-body)', color: 'var(--app-text-secondary)' }}>{formatNOK(s.value)}</td>
              <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-border)', textAlign: 'right', fontSize: 'var(--font-size-body)', color: 'var(--app-text)' }}>{formatPercent(s.percent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DiversificationReport() {
  return (
    <ReportLayout title="Diversifisering">
      {(kpis) => (
        <>
          <DiversificationCard kpis={kpis} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <DataTable title="Geografi" slices={kpis.diversification.byGeography} />
            <DataTable title="Segment" slices={kpis.diversification.byAssetType} />
            <DataTable title="Bransje" slices={kpis.diversification.byTenantIndustry} />
          </div>
        </>
      )}
    </ReportLayout>
  );
}
