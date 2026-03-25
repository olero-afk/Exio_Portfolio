interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--app-text)' }}>
        {title}
      </h1>
      <p style={{ color: 'var(--app-text-muted)', marginTop: 8 }}>
        Kommer snart
      </p>
    </div>
  );
}
