import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — Exio Portfolio`;
    return () => { document.title = 'Exio Portfolio'; };
  }, [title]);
}
