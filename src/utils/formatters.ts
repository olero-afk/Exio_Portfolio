const nbNO = 'nb-NO';

export function formatNOK(n: number): string {
  return new Intl.NumberFormat(nbNO, { maximumFractionDigits: 0 }).format(n) + ' kr';
}

export function formatPercent(n: number, decimals = 1): string {
  return new Intl.NumberFormat(nbNO, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n) + '%';
}

export function formatM2(n: number): string {
  return new Intl.NumberFormat(nbNO, { maximumFractionDigits: 0 }).format(Math.round(n)) + ' m²';
}

export function formatYears(n: number): string {
  return new Intl.NumberFormat(nbNO, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n) + ' år';
}

export function formatNumber(n: number, decimals = 0): string {
  return new Intl.NumberFormat(nbNO, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

export function formatRate(n: number): string {
  return new Intl.NumberFormat(nbNO, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + '%';
}

export function isNegative(n: number): boolean {
  return n < 0;
}
