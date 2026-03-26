import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { TenantConcentrationCard } from '../../components/dashboard/TenantConcentrationCard.tsx';
import { DiversificationCard } from '../../components/dashboard/DiversificationCard.tsx';

export function TenantAnalysisReport() {
  return (
    <ReportLayout title="Leietakeranalyse">
      {(kpis) => (
        <>
          <TenantConcentrationCard kpis={kpis} />
          <DiversificationCard kpis={kpis} />
        </>
      )}
    </ReportLayout>
  );
}
