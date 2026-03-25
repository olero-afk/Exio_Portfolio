import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav.tsx';
import { Sidebar } from './Sidebar.tsx';
import { Breadcrumb } from './Breadcrumb.tsx';
import './MainLayout.css';

export function MainLayout() {
  return (
    <div className="layout">
      <TopNav />
      <div className="layout__body">
        <Sidebar />
        <main className="layout__content">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
