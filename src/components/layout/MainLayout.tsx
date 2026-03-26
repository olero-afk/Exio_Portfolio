import { Outlet, useLocation } from 'react-router-dom';
import { TopNav } from './TopNav.tsx';
import { Sidebar } from './Sidebar.tsx';
import { Breadcrumb } from './Breadcrumb.tsx';
import './MainLayout.css';

const SIDEBAR_ROUTES = ['/bygg', '/fond', '/portefolje'];

export function MainLayout() {
  const { pathname } = useLocation();

  // Sidebar only on building/fund/portfolio routes
  const showSidebar = SIDEBAR_ROUTES.some((r) => pathname.startsWith(r));
  // No breadcrumb on dashboard
  const showBreadcrumb = pathname !== '/';

  return (
    <div className="layout">
      <TopNav />
      <div className="layout__body">
        {showSidebar && <Sidebar />}
        <main className={`layout__content ${!showSidebar ? 'layout__content--full' : ''}`}>
          {showBreadcrumb && <Breadcrumb />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
