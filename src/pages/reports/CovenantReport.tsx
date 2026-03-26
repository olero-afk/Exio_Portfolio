import { ReportLayout } from '../../components/reports/ReportLayout.tsx';
import { CovenantCard } from '../../components/dashboard/CovenantCard.tsx';

export function CovenantReport() {
  return (
    <ReportLayout title="Covenant-status">
      {() => (
        <CovenantCard />
      )}
    </ReportLayout>
  );
}
