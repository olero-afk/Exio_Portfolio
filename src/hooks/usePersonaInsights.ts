import { useMemo } from 'react';
import { usePersona } from '../context/PersonaContext.tsx';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import type { PortfolioKPIs } from './usePortfolioKPI.ts';
import { formatNOK, formatPercent, formatYears, formatM2 } from '../utils/formatters.ts';

export interface Insight {
  id: string;
  title: string;
  value: string;
  context: string;
  bullets: string[];
  severity: 'info' | 'warning' | 'positive' | 'negative';
  link?: string;
}

function yieldSeverity(y: number): Insight['severity'] {
  if (y > 6) return 'positive';
  if (y >= 4) return 'info';
  return 'negative';
}

function concSeverity(p: number): Insight['severity'] {
  if (p < 15) return 'positive';
  if (p <= 25) return 'warning';
  return 'negative';
}

function waultSeverity(w: number): Insight['severity'] {
  if (w > 5) return 'positive';
  if (w >= 3) return 'warning';
  return 'negative';
}

function occSeverity(o: number): Insight['severity'] {
  if (o > 90) return 'positive';
  if (o >= 75) return 'warning';
  return 'negative';
}

function buildEierInsights(kpis: PortfolioKPIs): Insight[] {
  const actual = kpis.monthlyNOIData.filter((m) => !m.isFuture);
  const noiLast = actual.length > 0 ? actual[actual.length - 1].income - actual[actual.length - 1].costs : kpis.totalNOI;
  const noiPrev = actual.length > 1 ? actual[actual.length - 2].income - actual[actual.length - 2].costs : 0;
  const change = noiPrev > 0 ? ((noiLast - noiPrev) / noiPrev) * 100 : 0;

  const expiring = kpis.expiryProfile[0];
  const topVacancy = [...kpis.filteredBuildings]
    .map((b) => ({ name: b.name, cost: (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0) }))
    .filter((b) => b.cost > 0)
    .sort((a, b) => b.cost - a.cost);
  const topDriver = topVacancy[0];
  const driverPct = kpis.totalVacancyCost > 0 && topDriver ? Math.round((topDriver.cost / kpis.totalVacancyCost) * 100) : 0;
  const under90 = kpis.filteredBuildings.filter((b) => b.occupancyRate < 0.9).length;

  const last3Noi = actual.slice(-3).map((m) => `${m.month.split(' ')[0]}: ${formatNOK(m.income - m.costs)}`);

  return [
    { id: 'noi', title: 'NOI', value: formatNOK(noiLast) + '/mnd', context: `Margin: ${formatPercent(kpis.noiMargin)} — ${change >= 0 ? '↑' : '↓'}${formatPercent(Math.abs(change))} vs. forrige`,
      bullets: last3Noi.length > 0 ? last3Noi : [`Årlig NOI: ${formatNOK(kpis.totalNOI)}`, `Yield: ${formatPercent(kpis.noiYield)}`, `${kpis.buildingCount} bygg i porteføljen`],
      severity: change >= 0 ? 'positive' : 'negative', link: '/rapporter/portefoljeoversikt' },
    { id: 'risk', title: 'KONTRAKTSRISIKO', value: expiring ? `${expiring.contractCount} utløper` : '0', context: `${formatNOK(kpis.incomeAtRisk)} i risiko neste 12 mnd`,
      bullets: kpis.expiryProfile.slice(0, 3).map((e) => `${e.label}: ${formatNOK(e.expiringRent)} (${e.contractCount} kontr.)`),
      severity: kpis.incomeAtRiskPercent > 10 ? 'negative' : kpis.incomeAtRiskPercent > 5 ? 'warning' : 'positive', link: '/rapporter/kontraktsanalyse' },
    { id: 'vacancy', title: 'LEDIGHETSKOSTNAD', value: formatNOK(kpis.totalVacancyCost), context: topDriver ? `${topDriver.name} driver ${driverPct}%` : 'Ingen ledighet',
      bullets: topVacancy.slice(0, 3).map((b) => `${b.name}: ${formatNOK(b.cost)}`),
      severity: kpis.totalVacancyCost > 5000000 ? 'negative' : kpis.totalVacancyCost > 1000000 ? 'warning' : 'positive', link: '/rapporter/ledighetsoversikt' },
    { id: 'occ', title: 'UTLEIEGRAD', value: formatPercent(kpis.portfolioOccupancyRate * 100), context: `${under90} bygg under 90% — snitt 92%`,
      bullets: [`Utleid: ${formatM2(kpis.totalCommittedM2)} av ${formatM2(kpis.totalRentableM2)}`, `Ledig: ${formatM2(kpis.totalVacantM2)}`, `${kpis.buildingsHighVacancy} bygg >10% ledighet`],
      severity: occSeverity(kpis.portfolioOccupancyRate * 100), link: '/rapporter/portefoljeoversikt' },
  ];
}

function buildInvestorInsights(kpis: PortfolioKPIs, fundData: { name: string; yield_: number }[]): Insight[] {
  const sorted = [...fundData].sort((a, b) => b.yield_ - a.yield_);
  const spread = sorted.length >= 2 ? sorted[0].yield_ - sorted[sorted.length - 1].yield_ : kpis.noiYield;
  const top = kpis.topTenants[0];
  const expiringCount = kpis.expiryProfile[0]?.contractCount ?? 0;

  const top3 = kpis.topTenants.slice(0, 3);

  return [
    { id: 'yield', title: 'YIELD-SPREAD', value: formatPercent(spread), context: sorted.length >= 2 ? `${sorted[0].name.split('—')[0].trim()}: ${formatPercent(sorted[0].yield_)} vs. ${sorted[1].name.split('—')[0].trim()}: ${formatPercent(sorted[1].yield_)}` : `NOI-yield: ${formatPercent(kpis.noiYield)}`,
      bullets: sorted.map((f) => `${f.name}: ${formatPercent(f.yield_)}`).concat([`NOI-margin: ${formatPercent(kpis.noiMargin)}`]).slice(0, 3),
      severity: yieldSeverity(sorted[0]?.yield_ ?? kpis.noiYield), link: '/rapporter/portefoljeoversikt' },
    { id: 'conc', title: 'KONSENTRASJONSRISIKO', value: top ? formatPercent(top.percentOfPortfolio) : '—', context: top ? `${top.tenantName} — største leietaker` : 'Ingen data',
      bullets: top3.map((t) => `${t.tenantName}: ${formatPercent(t.percentOfPortfolio)}`),
      severity: top ? concSeverity(top.percentOfPortfolio) : 'info', link: '/rapporter/leietakeranalyse' },
    { id: 'wault', title: 'WAULT', value: formatYears(kpis.portfolioWAULT), context: `${expiringCount} kontrakter utløper innen 12 mnd`,
      bullets: [`Effektiv WAULT: ${formatYears(kpis.effectiveWAULT)}`, `Inntekt i risiko: ${formatNOK(kpis.incomeAtRisk)}`, `Y+1: ${kpis.expiryProfile[0]?.contractCount ?? 0} kontrakter`],
      severity: waultSeverity(kpis.portfolioWAULT), link: '/rapporter/kontraktsanalyse' },
    { id: 'noiyield', title: 'NOI-YIELD', value: formatPercent(kpis.noiYield), context: `Porteføljeverdi: ${formatNOK(kpis.totalPortfolioValue)}`,
      bullets: [`Total NOI: ${formatNOK(kpis.totalNOI)}`, `Verdi: ${formatNOK(kpis.totalPortfolioValue)}`, `${kpis.buildingCount} bygg`],
      severity: yieldSeverity(kpis.noiYield), link: '/rapporter/portefoljeoversikt' },
  ];
}

function buildForvalterInsights(kpis: PortfolioKPIs, clientData: { name: string; value: number; noi: number; buildings: number; occupancy: number }[]): Insight[] {
  const sorted = [...clientData].sort((a, b) => a.occupancy - b.occupancy);
  const worst = sorted[0];
  const totalForvaltet = clientData.reduce((s, c) => s + c.value, 0);
  const costPerM2 = kpis.totalRentableM2 > 0 ? kpis.totalOperatingExpenses / kpis.totalRentableM2 : 0;
  const expiringCount = kpis.expiryProfile[0]?.contractCount ?? 0;
  const highestCostClient = [...clientData].sort((a, b) => {
    const aCost = a.value > 0 ? ((a.value - a.noi) / a.value) * 100 : 0;
    const bCost = b.value > 0 ? ((b.value - b.noi) / b.value) * 100 : 0;
    return bCost - aCost;
  })[0];
  const fee = Math.round(totalForvaltet * 0.005); // 0.5% management fee estimate

  return [
    { id: 'clients', title: 'KUNDESTATUS', value: `${clientData.length} kunder`, context: worst ? `${worst.name} trenger oppmerksomhet` : 'Alle kunder stabile',
      bullets: sorted.slice(0, 3).map((c) => `${c.name}: ${formatPercent(c.occupancy * 100)} utleie`),
      severity: worst && worst.occupancy < 0.8 ? 'warning' : 'positive', link: '/rapporter/portefoljeoversikt' },
    { id: 'contracts', title: 'KONTRAKTER', value: `${expiringCount} utløper`, context: `${formatNOK(kpis.incomeAtRisk)} utløper på tvers av alle kunder`,
      bullets: kpis.expiryProfile.slice(0, 3).map((e) => `${e.label}: ${formatNOK(e.expiringRent)} (${e.contractCount})`),
      severity: kpis.incomeAtRiskPercent > 10 ? 'negative' : kpis.incomeAtRiskPercent > 5 ? 'warning' : 'positive', link: '/rapporter/kontraktsanalyse' },
    { id: 'cost', title: 'DRIFTSKOSTNAD', value: `${formatNOK(costPerM2)}/m²`, context: highestCostClient ? `${highestCostClient.name} høyest kostnadsnivå` : 'Jevnt fordelt',
      bullets: clientData.map((c) => `${c.name}: ${formatNOK(c.value > 0 ? (c.value - c.noi) / c.buildings : 0)}/bygg`).slice(0, 3),
      severity: 'info', link: '/rapporter/portefoljeoversikt' },
    { id: 'aum', title: 'FORVALTET KAPITAL', value: formatNOK(totalForvaltet), context: `${clientData.length} kunder — honorar ~${formatNOK(fee)}/år`,
      bullets: clientData.sort((a, b) => b.value - a.value).slice(0, 3).map((c) => `${c.name}: ${formatNOK(c.value)}`),
      severity: 'positive', link: '/rapporter/portefoljeoversikt' },
  ];
}

function buildEmptyInsights(kpis: PortfolioKPIs): Insight[] {
  return [
    {
      id: 'yield',
      title: 'YIELD-SPREAD',
      value: '—',
      context: 'Mangler kostnadsdata',
      bullets: ['Legg til driftskostnader for å beregne yield', `${kpis.buildingCount} bygg registrert`],
      severity: 'info',
      link: '/bygg',
    },
    {
      id: 'conc',
      title: 'KONSENTRASJONSRISIKO',
      value: '—',
      context: 'Mangler kontraktsdata',
      bullets: ['Legg til leiekontrakter for å se konsentrasjonsrisiko'],
      severity: 'info',
      link: '/avtaler',
    },
    {
      id: 'wault',
      title: 'WAULT',
      value: '—',
      context: 'Mangler kontraktsdata',
      bullets: ['Legg til leiekontrakter for å beregne WAULT'],
      severity: 'info',
      link: '/avtaler',
    },
    {
      id: 'noiyield',
      title: 'NOI-YIELD',
      value: '—',
      context: 'Mangler kostnadsdata',
      bullets: [
        `Porteføljeverdi: ${formatNOK(kpis.totalPortfolioValue)}`,
        'Legg til kostnader og kontrakter for NOI-beregning',
      ],
      severity: 'info',
      link: '/bygg',
    },
  ];
}

export function usePersonaInsights(kpis: PortfolioKPIs): Insight[] {
  const { persona, clients } = usePersona();
  const { buildings, contracts, costs, funds } = usePortfolioContext();

  return useMemo(() => {
    // Return placeholder insights when no contract/cost data exists
    if (!kpis.hasContracts && !kpis.hasCosts) {
      return buildEmptyInsights(kpis);
    }

    if (persona === 'eier') return buildEierInsights(kpis);

    if (persona === 'investor') {
      const fundData = funds.map((fund) => {
        const fb = buildings.filter((b) => fund.buildingIds.includes(b.id) && !b.isArchived);
        const fids = fb.map((b) => b.id);
        const ac = contracts.filter((c) => fids.includes(c.buildingId) && (c.status === 'active' || c.status === 'expiring_soon'));
        const income = ac.reduce((s, c) => s + c.annualRent, 0);
        const fc = costs.filter((c) => fids.includes(c.buildingId));
        const ms = new Set(fc.map((c) => `${c.year}-${c.month}`)).size;
        const tc = fc.reduce((s, c) => s + c.amount, 0);
        const ann = ms > 0 ? (tc / ms) * 12 : 0;
        const noi = income - ann;
        const value = fb.reduce((s, b) => s + (b.estimatedMarketValue ?? 0), 0);
        return { name: fund.name, yield_: value > 0 ? (noi / value) * 100 : 0 };
      });
      return buildInvestorInsights(kpis, fundData);
    }

    const clientData = clients.map((client) => {
      const cb = buildings.filter((b) => client.buildingIds.includes(b.id) && !b.isArchived);
      const value = cb.reduce((s, b) => s + (b.estimatedMarketValue ?? 0), 0);
      const cids = cb.map((b) => b.id);
      const ac = contracts.filter((c) => cids.includes(c.buildingId) && (c.status === 'active' || c.status === 'expiring_soon'));
      const income = ac.reduce((s, c) => s + c.annualRent, 0);
      const cc = costs.filter((c) => cids.includes(c.buildingId));
      const ms = new Set(cc.map((c) => `${c.year}-${c.month}`)).size;
      const tc = cc.reduce((s, c) => s + c.amount, 0);
      const ann = ms > 0 ? (tc / ms) * 12 : 0;
      const occ = cb.length > 0 ? cb.reduce((s, b) => s + b.committedM2, 0) / cb.reduce((s, b) => s + b.totalRentableM2, 0) : 1;
      return { name: client.name, value, noi: income - ann, buildings: cb.length, occupancy: occ };
    });
    return buildForvalterInsights(kpis, clientData);
  }, [persona, kpis, funds, buildings, contracts, costs, clients]);
}
