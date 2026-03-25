const nbNO = 'nb-NO';

export function formatNOK(n: number): string {
  return new Intl.NumberFormat(nbNO, { maximumFractionDigits: 0 }).format(n) + ' kr';
}

export function formatPercent(n: number): string {
  return new Intl.NumberFormat(nbNO, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + '%';
}

export function formatM2(n: number): string {
  return new Intl.NumberFormat(nbNO, { maximumFractionDigits: 1 }).format(n) + ' m²';
}

export function formatYears(n: number): string {
  return new Intl.NumberFormat(nbNO, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' år';
}

export function formatNumber(n: number, decimals = 0): string {
  return new Intl.NumberFormat(nbNO, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

export function isNegative(n: number): boolean {
  return n < 0;
}
