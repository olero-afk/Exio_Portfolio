// Mock data for blurred locked sections — shown behind blur to demonstrate value

// ── Report 1: Porteføljeoversikt ──

export const mockYieldData = [
  { building: 'Aker Brygge Kontorbygg', marketValue: 340000000, noi: 18200000, niy: 5.35, yoyChange: 0.4 },
  { building: 'Vika Terrasse', marketValue: 250000000, noi: 12800000, niy: 5.12, yoyChange: -0.2 },
  { building: 'Bergen Storsenter', marketValue: 145000000, noi: 6400000, niy: 4.41, yoyChange: 0.1 },
  { building: 'Forus Logistikksenter', marketValue: 88000000, noi: 4900000, niy: 5.57, yoyChange: 0.8 },
  { building: 'Majorstuen Bygg', marketValue: 82000000, noi: 3100000, niy: 3.78, yoyChange: -0.5 },
  { building: 'Lysaker Kontorpark', marketValue: 130000000, noi: 5200000, niy: 4.00, yoyChange: -1.2 },
  { building: 'Sandvika Helsehus', marketValue: 115000000, noi: 7600000, niy: 6.61, yoyChange: 0.3 },
];

export const mockPaymentData = [
  { tenant: 'Nordisk Kontor AS', building: 'Aker Brygge Kontorbygg', annualRent: 4800000, status: 'Betalt' as const, lastPayment: '2026-03-01' },
  { tenant: 'Fjord Logistikk AS', building: 'Forus Logistikksenter', annualRent: 2400000, status: 'Forfalt 14 dager' as const, lastPayment: '2026-02-15' },
  { tenant: 'Sentrum Retail AS', building: 'Bergen Storsenter', annualRent: 1800000, status: 'Betalt' as const, lastPayment: '2026-03-01' },
  { tenant: 'DataFlow Technologies AS', building: 'Vika Terrasse', annualRent: 3200000, status: 'Betalt' as const, lastPayment: '2026-03-01' },
  { tenant: 'Kystfrakt AS', building: 'Forus Logistikksenter', annualRent: 1920000, status: 'Forfalt 30+ dager' as const, lastPayment: '2026-01-28' },
  { tenant: 'Helsegruppen Vest', building: 'Sandvika Helsehus', annualRent: 5400000, status: 'Betalt' as const, lastPayment: '2026-03-01' },
];

// ── Report 2: NOI-analyse ──

export const mockBudgetData = [
  { building: 'Aker Brygge Kontorbygg', budget: 4200000, actual: 3850000, variance: -350000, pct: -8.3 },
  { building: 'Vika Terrasse', budget: 3100000, actual: 3400000, variance: 300000, pct: 9.7 },
  { building: 'Bergen Storsenter', budget: 2600000, actual: 2580000, variance: -20000, pct: -0.8 },
  { building: 'Forus Logistikksenter', budget: 2200000, actual: 2650000, variance: 450000, pct: 20.5 },
  { building: 'Majorstuen Bygg', budget: 1400000, actual: 1266000, variance: -134000, pct: -9.6 },
  { building: 'Lysaker Kontorpark', budget: 2800000, actual: 3100000, variance: 300000, pct: 10.7 },
  { building: 'Sandvika Helsehus', budget: 1900000, actual: 1780000, variance: -120000, pct: -6.3 },
];

export const mockCostTrendMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des',
];

export const mockCostTrendData = {
  drift: [450, 430, 480, 460, 440, 470, 490, 460, 450, 480, 470, 460],
  vedlikehold: [180, 160, 220, 190, 170, 200, 380, 190, 180, 170, 160, 175],
  forsikring: [120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120],
  administrasjon: [165, 165, 170, 168, 165, 172, 165, 168, 165, 170, 165, 168],
};

// ── Report 3: Kontraktsanalyse ──

export const mockLifecycleData = [
  { contract: 'Nordisk Kontor AS', building: 'Aker Brygge', status: 'Aktiv' as const, renewal: '2028-12-31', nextAction: 'Fornyelse om 2,8 år' },
  { contract: 'Bergen Handel AS', building: 'Bergen Storsenter', status: 'Til fornyelse' as const, renewal: '2026-09-30', nextAction: 'Forhandling pågår' },
  { contract: 'DataFlow Technologies', building: 'Vika Terrasse', status: 'Aktiv' as const, renewal: '2030-06-01', nextAction: 'Ingen handling' },
  { contract: 'Kystfrakt AS', building: 'Forus Logistikk.', status: 'Oppsagt' as const, renewal: '2026-06-30', nextAction: 'Fraflytting Q2 2026' },
  { contract: 'Helsegruppen Vest', building: 'Sandvika Helsehus', status: 'Under forhandling' as const, renewal: '2027-03-31', nextAction: 'Fornyelse tilbudt' },
];

export const mockKPIRegData = [
  { contract: 'Nordisk Kontor AS', originalRent: 4200000, currentRent: 4800000, kpiPct: 3.5, lastAdjusted: '2026-01-01' },
  { contract: 'DataFlow Technologies', originalRent: 2800000, currentRent: 3200000, kpiPct: 3.8, lastAdjusted: '2026-01-01' },
  { contract: 'Sentrum Retail AS', originalRent: 1600000, currentRent: 1800000, kpiPct: 3.2, lastAdjusted: '2025-07-01' },
  { contract: 'Helsegruppen Vest', originalRent: 4800000, currentRent: 5400000, kpiPct: 4.0, lastAdjusted: '2026-01-01' },
  { contract: 'Bergen Handel AS', originalRent: 1200000, currentRent: 1350000, kpiPct: 3.5, lastAdjusted: '2025-01-01' },
];

// ── Report 4: Ledighetsoversikt ──

export const mockVacancyTrendQuarters = ['Q1-25', 'Q2-25', 'Q3-25', 'Q4-25', 'Q1-26', 'Q2-26', 'Q3-26', 'Q4-26'];
export const mockVacancyTrendPct = [22.1, 23.5, 24.8, 25.2, 25.8, 24.9, 23.1, 21.5];

export const mockPipelineData = [
  { prospect: 'TechHub Oslo AS', building: 'Lysaker Kontorpark', areaM2: 800, stage: 'Tilbud sendt' as const, expectedSign: '2026-05-15' },
  { prospect: 'Grønn Finans AS', building: 'Vika Terrasse', areaM2: 350, stage: 'Visning' as const, expectedSign: '2026-06-01' },
  { prospect: 'Nordic Warehouse', building: 'Forus Logistikksenter', areaM2: 1200, stage: 'Forhandling' as const, expectedSign: '2026-04-20' },
  { prospect: 'Retail Vest AS', building: 'Drammen Handelshus', areaM2: 600, stage: 'Henvendelse' as const, expectedSign: null },
  { prospect: 'Helsepartner AS', building: 'Majorstuen Bygg', areaM2: 280, stage: 'Signert' as const, expectedSign: '2026-03-25' },
];

// ── Styrerapport ──

export const mockFinancialSummary = [
  { metric: 'Brutto leieinntekt', budget: 28450000, actual: 27800000, variance: -650000 },
  { metric: 'Driftskostnader', budget: 12380000, actual: 12900000, variance: 520000 },
  { metric: 'NOI', budget: 16070000, actual: 14900000, variance: -1170000 },
  { metric: 'NOI-yield', budget: 5.2, actual: 4.8, variance: -0.4 },
  { metric: 'Kostnad per m²', budget: 1032, actual: 1075, variance: 43 },
];

export const mockComplianceData = [
  { loan: 'DNB — Aker Brygge', covenant: 'LTV ≤ 75%', current: '60,0%', status: 'ok' as const },
  { loan: 'DNB — Aker Brygge', covenant: 'DSCR ≥ 1,20', current: '1,85', status: 'ok' as const },
  { loan: 'DNB — Lysaker', covenant: 'LTV ≤ 75%', current: '73,1%', status: 'advarsel' as const },
  { loan: 'Nordea — Vika', covenant: 'LTV ≤ 70%', current: '56,8%', status: 'ok' as const },
  { loan: 'Handelsbanken — Forus', covenant: 'DSCR ≥ 1,15', current: '1,42', status: 'ok' as const },
];
