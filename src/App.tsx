import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext.tsx';
import { FilterProvider } from './context/FilterContext.tsx';
import { PersonaProvider } from './context/PersonaContext.tsx';
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
import { PlaceholderPage } from './pages/PlaceholderPage.tsx';
import { FundViewPage } from './pages/FundViewPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <PortfolioProvider>
        <PersonaProvider>
        <FilterProvider>
          <Routes>
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
              <Route path="rapporter/styrerapport" element={<BoardReportPage />} />
              <Route path="avtaler" element={<PlaceholderPage title="Avtaler" />} />
              <Route path="produkter" element={<PlaceholderPage title="Produkter" />} />
              <Route path="aktoerer" element={<PlaceholderPage title="Aktører" />} />
              <Route path="sammenlign" element={<ComparisonPage />} />
              <Route path="innstillinger" element={<PlaceholderPage title="Innstillinger" />} />

            </Route>
          </Routes>
        </FilterProvider>
        </PersonaProvider>
      </PortfolioProvider>
    </BrowserRouter>
  );
}

export default App;
