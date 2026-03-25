import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext.tsx';
import { FilterProvider } from './context/FilterContext.tsx';
import { MainLayout } from './components/layout/MainLayout.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { BuildingListPage } from './pages/BuildingListPage.tsx';
import { BuildingDetailPage } from './pages/BuildingDetailPage.tsx';
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
              <Route path="bygg/:buildingId/arealer" element={<BuildingDetailPage />} />
              <Route path="bygg/:buildingId/avtaler" element={<BuildingDetailPage />} />
              <Route path="bygg/:buildingId/okonomi" element={<BuildingDetailPage />} />
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
