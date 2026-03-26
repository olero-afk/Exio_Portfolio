import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { PortfolioValueCard } from '../../components/dashboard/PortfolioValueCard.tsx';
import { NOIYieldCard } from '../../components/dashboard/NOIYieldCard.tsx';
import { CashFlowCard } from '../../components/dashboard/CashFlowCard.tsx';
import { OccupancyPortfolioCard } from '../../components/dashboard/OccupancyPortfolioCard.tsx';

export function PortfolioOverviewReport() {
  return (
    <ReportLayout title="Porteføljeoversikt">
      {(kpis) => (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <NOIYieldCard kpis={kpis} />
            <PortfolioValueCard kpis={kpis} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CashFlowCard kpis={kpis} />
            <OccupancyPortfolioCard kpis={kpis} />
          </div>
        </>
      )}
    </ReportLayout>
  );
}
