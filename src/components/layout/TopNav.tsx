import { NavLink } from 'react-router-dom';
import { EntitySwitcher } from './EntitySwitcher.tsx';
import './TopNav.css';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/rapporter', label: 'Rapporter' },
  { to: '/bygg', label: 'Bygg' },
  { to: '/avtaler', label: 'Avtaler' },
  { to: '/produkter', label: 'Produkter' },
  { to: '/aktoerer', label: 'Aktører' },
] as const;

export function TopNav() {
  return (
    <nav className="top-nav">
      <div className="top-nav__logo">
        <span className="top-nav__logo-text">exio</span>
      </div>

      <ul className="top-nav__links">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `top-nav__link ${isActive ? 'top-nav__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="top-nav__right">
        <EntitySwitcher />
        <div className="top-nav__user">
          <div className="top-nav__avatar">OL</div>
        </div>
      </div>
    </nav>
  );
}
