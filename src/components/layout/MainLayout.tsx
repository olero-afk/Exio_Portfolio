import { Outlet, useLocation } from 'react-router-dom';
import { TopNav } from './TopNav.tsx';
import { Sidebar } from './Sidebar.tsx';
import { ReportSidebar } from './ReportSidebar.tsx';
import { Breadcrumb } from './Breadcrumb.tsx';
import './MainLayout.css';

export function MainLayout() {
  const { pathname } = useLocation();

  const showFullSidebar = ['/bygg', '/fond', '/portefolje'].some((r) => pathname.startsWith(r));
  const showReportSidebar = pathname.startsWith('/rapporter');
  const showBreadcrumb = pathname !== '/';
  const hasSidebar = showFullSidebar || showReportSidebar;

  return (
    <div className="layout">
      <TopNav />
      <div className="layout__body">
        {showFullSidebar && <Sidebar />}
        {showReportSidebar && <ReportSidebar />}
        <main className={`layout__content ${!hasSidebar ? 'layout__content--full' : ''}`}>
          {showBreadcrumb && <Breadcrumb />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
