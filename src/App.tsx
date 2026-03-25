import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext.tsx';
import { FilterProvider } from './context/FilterContext.tsx';
import { MainLayout } from './components/layout/MainLayout.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { BuildingListPage } from './pages/BuildingListPage.tsx';
import { BuildingDetailPage } from './pages/BuildingDetailPage.tsx';
import { BuildingAreasPage } from './pages/BuildingAreasPage.tsx';
import { BuildingContractsPage } from './pages/BuildingContractsPage.tsx';
import { BuildingFinancialsPage } from './pages/BuildingFinancialsPage.tsx';
import { BuildingTabPlaceholder } from './pages/BuildingTabPlaceholder.tsx';
import { PlaceholderPage } from './pages/PlaceholderPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <PortfolioProvider>
        <FilterProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="bygg" element={<BuildingListPage />} />
              <Route path="bygg/:buildingId" element={<BuildingDetailPage />} />
              <Route path="bygg/:buildingId/arealer" element={<BuildingAreasPage />} />
              <Route path="bygg/:buildingId/avtaler" element={<BuildingContractsPage />} />
              <Route path="bygg/:buildingId/leietakere" element={<BuildingTabPlaceholder tabName="Leietakere" />} />
              <Route path="bygg/:buildingId/eiere" element={<BuildingTabPlaceholder tabName="Eiere" />} />
              <Route path="bygg/:buildingId/forvalter" element={<BuildingTabPlaceholder tabName="Forvalter" />} />
              <Route path="bygg/:buildingId/energi" element={<BuildingTabPlaceholder tabName="Energi" />} />
              <Route path="bygg/:buildingId/okonomi" element={<BuildingFinancialsPage />} />
              <Route path="rapporter" element={<PlaceholderPage title="Rapporter" />} />
              <Route path="rapporter/styrerapport" element={<PlaceholderPage title="Styrerapport" />} />
              <Route path="avtaler" element={<PlaceholderPage title="Avtaler" />} />
              <Route path="produkter" element={<PlaceholderPage title="Produkter" />} />
              <Route path="aktoerer" element={<PlaceholderPage title="Aktører" />} />
              <Route path="sammenlign" element={<PlaceholderPage title="Sammenlign bygninger" />} />
              <Route path="innstillinger" element={<PlaceholderPage title="Innstillinger" />} />
            </Route>
          </Routes>
        </FilterProvider>
      </PortfolioProvider>
    </BrowserRouter>
  );
}

export default App;
