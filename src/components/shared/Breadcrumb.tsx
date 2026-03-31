import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav style={{ fontSize: '0.8125rem', marginBottom: 8 }}>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span style={{ color: '#7a7a7a', margin: '0 6px' }}>›</span>}
          {item.path ? (
            <Link to={item.path} style={{ color: '#9a9a9a', textDecoration: 'none' }}>{item.label}</Link>
          ) : (
            <span style={{ color: '#e8e8e8' }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
