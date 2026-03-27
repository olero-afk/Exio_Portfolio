import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext.tsx';
import { FilterProvider } from './context/FilterContext.tsx';
import { PersonaProvider } from './context/PersonaContext.tsx';
import { OnboardingProvider } from './context/OnboardingContext.tsx';
import { MainLayout } from './components/layout/MainLayout.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { BuildingListPage } from './pages/BuildingListPage.tsx';
import { BuildingDetailPage } from './pages/BuildingDetailPage.tsx';
import { BuildingAreasPage } from './pages/BuildingAreasPage.tsx';
import { BuildingContractsPage } from './pages/BuildingContractsPage.tsx';
import { BuildingFinancialsPage } from './pages/BuildingFinancialsPage.tsx';
import { BuildingTabPlaceholder } from './pages/BuildingTabPlaceholder.tsx';
import { ComparisonPage } from './pages/ComparisonPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { BoardReportPage } from './pages/BoardReportPage.tsx';
import { PortfolioOverviewReport } from './pages/reports/PortfolioOverviewReport.tsx';
import { ContractAnalysisReport } from './pages/reports/ContractAnalysisReport.tsx';
import { TenantAnalysisReport } from './pages/reports/TenantAnalysisReport.tsx';
import { VacancyReport } from './pages/reports/VacancyReport.tsx';
import { DiversificationReport } from './pages/reports/DiversificationReport.tsx';
import { CovenantReport } from './pages/reports/CovenantReport.tsx';
import { BenchmarkReport } from './pages/reports/BenchmarkReport.tsx';
import { PlaceholderPage } from './pages/PlaceholderPage.tsx';
import { FundViewPage } from './pages/FundViewPage.tsx';
import { OnboardingPage } from './pages/OnboardingPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <PortfolioProvider>
        <OnboardingProvider>
        <PersonaProvider>
        <FilterProvider>
          <Routes>
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="fond/:fondId" element={<FundViewPage />} />
              <Route path="bygg" element={<BuildingListPage />} />
              <Route path="bygg/:buildingId" element={<BuildingDetailPage />} />
              <Route path="bygg/:buildingId/arealer" element={<BuildingAreasPage />} />
              <Route path="bygg/:buildingId/avtaler" element={<BuildingContractsPage />} />
              <Route path="bygg/:buildingId/leietakere" element={<BuildingTabPlaceholder tabName="Leietakere" />} />
              <Route path="bygg/:buildingId/eiere" element={<BuildingTabPlaceholder tabName="Eiere" />} />
              <Route path="bygg/:buildingId/forvalter" element={<BuildingTabPlaceholder tabName="Forvalter" />} />
              <Route path="bygg/:buildingId/energi" element={<BuildingTabPlaceholder tabName="Energi" />} />
              <Route path="bygg/:buildingId/okonomi" element={<BuildingFinancialsPage />} />
              <Route path="rapporter" element={<ReportsPage />} />
              <Route path="rapporter/portefoljeoversikt" element={<PortfolioOverviewReport />} />
              <Route path="rapporter/kontraktsanalyse" element={<ContractAnalysisReport />} />
              <Route path="rapporter/leietakeranalyse" element={<TenantAnalysisReport />} />
              <Route path="rapporter/ledighetsoversikt" element={<VacancyReport />} />
              <Route path="rapporter/diversifisering" element={<DiversificationReport />} />
              <Route path="rapporter/styrerapport" element={<BoardReportPage />} />
              <Route path="rapporter/benchmark" element={<BenchmarkReport />} />
              <Route path="rapporter/covenant" element={<CovenantReport />} />
              <Route path="avtaler" element={<PlaceholderPage title="Avtaler" />} />
              <Route path="produkter" element={<PlaceholderPage title="Produkter" />} />
              <Route path="aktoerer" element={<PlaceholderPage title="Aktører" />} />
              <Route path="sammenlign" element={<ComparisonPage />} />
              <Route path="innstillinger" element={<PlaceholderPage title="Innstillinger" />} />
            </Route>
          </Routes>
        </FilterProvider>
        </PersonaProvider>
        </OnboardingProvider>
      </PortfolioProvider>
    </BrowserRouter>
  );
}

export default App;
