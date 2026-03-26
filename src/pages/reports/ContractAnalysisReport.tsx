import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { WAULTPortfolioCard } from '../../components/dashboard/WAULTPortfolioCard.tsx';
import { ExpiryProfileCard } from '../../components/dashboard/ExpiryProfileCard.tsx';
import { ContractExpirySection } from '../../components/dashboard/ContractExpirySection.tsx';

export function ContractAnalysisReport() {
  return (
    <ReportLayout title="Kontraktsanalyse">
      {(kpis) => (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <WAULTPortfolioCard kpis={kpis} />
            <ExpiryProfileCard kpis={kpis} />
          </div>
          <ContractExpirySection />
        </>
      )}
    </ReportLayout>
  );
}
