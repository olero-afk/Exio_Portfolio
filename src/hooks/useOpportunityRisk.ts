import { useMemo } from 'react';
import { usePersona } from '../context/PersonaContext.tsx';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import type { PortfolioKPIs } from './usePortfolioKPI.ts';
import type { Building, Contract, CostEntry, Fund, ClientCompany } from '../types/index.ts';
import { formatNOK, formatPercent, formatYears, formatM2 } from '../utils/formatters.ts';

export interface SummaryCard {
  type: 'muligheter' | 'risiko';
  bullets: string[];
  bottomLine: string;
  link: string;
}

export function useOpportunityRisk(kpis: PortfolioKPIs): { muligheter: SummaryCard; risiko: SummaryCard } {
  const { persona, clients } = usePersona();
  const { buildings, contracts, costs, funds } = usePortfolioContext();

  return useMemo(() => {
    if (persona === 'eier') return buildEier(kpis, buildings, contracts, costs);
    if (persona === 'investor') return buildInvestor(kpis, buildings, contracts, costs, funds);
    return buildForvalter(kpis, buildings, contracts, costs, clients);
  }, [persona, kpis, buildings, contracts, costs, funds, clients]);
}

function buildEier(
  kpis: PortfolioKPIs,
  buildings: Building[],
  contracts: Contract[],
  costs: CostEntry[],
) {
  // Worst vacancy building
  const vacancyRanked = kpis.filteredBuildings
    .map((b) => ({ b, vacant: b.totalRentableM2 - b.committedM2, cost: (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0) }))
    .filter((x) => x.vacant > 0)
    .sort((a, b) => b.cost - a.cost);
  const worstVacancy = vacancyRanked[0];

  // Largest expiring tenant
  const expiring = contracts.filter((c) => c.status === 'expiring_soon' && kpis.filteredBuildings.some((b) => b.id === c.buildingId));
  const largestExpiring = expiring.sort((a, b) => b.annualRent - a.annualRent)[0];

  // Highest cost building
  const buildingCostMap = new Map<string, number>();
  for (const c of costs) {
    if (kpis.filteredBuildings.some((b) => b.id === c.buildingId)) {
      buildingCostMap.set(c.buildingId, (buildingCostMap.get(c.buildingId) ?? 0) + c.amount);
    }
  }
  const avgCost = buildingCostMap.size > 0 ? Array.from(buildingCostMap.values()).reduce((s, v) => s + v, 0) / buildingCostMap.size : 0;
  let highestCostBuilding = { name: '—', cost: 0, overAvg: 0 };
  for (const [id, cost] of buildingCostMap) {
    if (cost > highestCostBuilding.cost) {
      const b = buildings.find((x) => x.id === id);
      highestCostBuilding = { name: b?.name ?? id, cost, overAvg: avgCost > 0 ? ((cost - avgCost) / avgCost) * 100 : 0 };
    }
  }

  const totalPotential = worstVacancy ? worstVacancy.cost : 0;
  const reforhandlingPotential = largestExpiring ? Math.round(largestExpiring.annualRent * 0.12) : 0;

  const muligheter: SummaryCard = {
    type: 'muligheter',
    bullets: [
      worstVacancy ? `Utleie ${worstVacancy.b.name} (${formatM2(worstVacancy.vacant)}) = +${formatNOK(worstVacancy.cost)}/år` : 'Ingen ledige arealer',
      largestExpiring ? `Reforhandling ${largestExpiring.tenantName} = potensial +10-15% leieøkning` : 'Ingen kontrakter utløper snart',
      highestCostBuilding.overAvg > 10 ? `Reduser vedlikeholdskost ${highestCostBuilding.name} — ${formatPercent(highestCostBuilding.overAvg)} over snitt` : 'Driftskostnader innenfor normalt nivå',
    ],
    bottomLine: `Estimert verdipotensial: +${formatNOK(totalPotential + reforhandlingPotential)}/år`,
    link: '/rapporter/ledighetsoversikt',
  };

  const expiringNOK = expiring.reduce((s, c) => s + c.annualRent, 0);
  const occupancyBenchmark = 90;

  const risiko: SummaryCard = {
    type: 'risiko',
    bullets: [
      `${expiring.length} kontrakter (${formatNOK(expiringNOK)}) utløper innen 12 mnd`,
      highestCostBuilding.overAvg > 10 ? `${highestCostBuilding.name} driftskostnad ${formatPercent(highestCostBuilding.overAvg)} over porteføljesnitt` : `Driftskostnader jevnt fordelt — ingen utliggere`,
      `Utleiegrad ${formatPercent(kpis.portfolioOccupancyRate * 100)} — ${kpis.portfolioOccupancyRate * 100 < occupancyBenchmark ? 'under' : 'over'} markedssnitt (${occupancyBenchmark}%)`,
    ],
    bottomLine: `Total risikoeksponering: ${formatNOK(expiringNOK + kpis.totalVacancyCost)}`,
    link: '/rapporter/kontraktsanalyse',
  };

  return { muligheter, risiko };
}

function buildInvestor(
  kpis: PortfolioKPIs,
  buildings: ReturnType<typeof usePortfolioContext>['buildings'],
  contracts: ReturnType<typeof usePortfolioContext>['contracts'],
  costs: ReturnType<typeof usePortfolioContext>['costs'],
  funds: Fund[],
) {
  // Per-fund NOI and vacancy
  const fundStats = funds.map((fund) => {
    const fb = buildings.filter((b) => fund.buildingIds.includes(b.id) && !b.isArchived);
    const fids = fb.map((b) => b.id);
    const active = contracts.filter((c) => fids.includes(c.buildingId) && (c.status === 'active' || c.status === 'expiring_soon'));
    const income = active.reduce((s, c) => s + c.annualRent, 0);
    const fc = costs.filter((c) => fids.includes(c.buildingId));
    const ms = new Set(fc.map((c) => `${c.year}-${c.month}`)).size;
    const total = fc.reduce((s, c) => s + c.amount, 0);
    const annualized = ms > 0 ? (total / ms) * 12 : 0;
    const noi = income - annualized;
    const value = fb.reduce((s, b) => s + (b.estimatedMarketValue ?? 0), 0);
    const vacancyCost = fb.reduce((s, b) => s + (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0), 0);
    const totalRent = active.reduce((s, c) => s + c.annualRent, 0);
    const wault = totalRent > 0 ? active.reduce((sum, c) => sum + Math.max(0, c.remainingTermYears) * c.annualRent, 0) / totalRent : 0;
    return { fund, noi, value, vacancyCost, wault, yield_: value > 0 ? (noi / value) * 100 : 0 };
  });

  const worstFund = [...fundStats].sort((a, b) => b.vacancyCost - a.vacancyCost)[0];
  const noiUplift = worstFund?.vacancyCost ?? 0;
  const yieldCompress = kpis.totalPortfolioValue * 0.0025; // 25bps

  const topType = kpis.diversification.byAssetType;
  const underweight = topType.length > 2 ? topType[topType.length - 1] : null;

  const muligheter: SummaryCard = {
    type: 'muligheter',
    bullets: [
      worstFund ? `Full utleie ${worstFund.fund.name} = +${formatNOK(noiUplift)} NOI = ~${formatNOK(noiUplift * 15)} verdiøkning` : 'Alle fond fullt utleid',
      `Yield compress 25bps = +${formatNOK(yieldCompress)} porteføljeverdi`,
      underweight ? `${underweight.label} underallokert (${formatPercent(underweight.percent)}) — diversifiseringsmulighet` : 'God segmentdiversifisering',
    ],
    bottomLine: `Estimert verdipotensial: +${formatNOK(noiUplift * 15 + yieldCompress)}/år`,
    link: '/rapporter/ledighetsoversikt',
  };

  const topTenant = kpis.topTenants[0];
  const topGeo = kpis.diversification.byGeography[0];
  const lowWaultFund = [...fundStats].sort((a, b) => a.wault - b.wault)[0];

  const risiko: SummaryCard = {
    type: 'risiko',
    bullets: [
      topTenant ? `${topTenant.tenantName} = ${formatPercent(topTenant.percentOfPortfolio)} konsentrasjon — ${formatNOK(topTenant.totalAnnualRent)} NOI-tap ved konkurs` : 'Ingen dominerende leietaker',
      lowWaultFund ? `${lowWaultFund.fund.name} WAULT ${formatYears(lowWaultFund.wault)} — ${lowWaultFund.wault < 3 ? 'under target (5 år)' : 'akseptabelt'}` : 'WAULT data mangler',
      topGeo ? `${formatPercent(topGeo.percent)} ${topGeo.label}-eksponering — ${topGeo.percent > 50 ? 'geografisk konsentrert' : 'akseptabel'}` : 'Geografisk data mangler',
    ],
    bottomLine: `Total risikoeksponering: ${formatNOK(kpis.incomeAtRisk + kpis.totalVacancyCost)}`,
    link: '/rapporter/kontraktsanalyse',
  };

  return { muligheter, risiko };
}

function buildForvalter(
  kpis: PortfolioKPIs,
  buildings: ReturnType<typeof usePortfolioContext>['buildings'],
  contracts: ReturnType<typeof usePortfolioContext>['contracts'],
  _costs: CostEntry[],
  clients: ClientCompany[],
) {
  // Client with worst vacancy
  const clientStats = clients.map((cl) => {
    const cb = buildings.filter((b) => cl.buildingIds.includes(b.id) && !b.isArchived);
    const occ = cb.length > 0 ? cb.reduce((s, b) => s + b.committedM2, 0) / cb.reduce((s, b) => s + b.totalRentableM2, 0) : 1;
    const vacancy = cb.reduce((s, b) => s + (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0), 0);
    const expiring = contracts.filter((c) => cb.some((b) => b.id === c.buildingId) && c.status === 'expiring_soon');
    return { client: cl, occupancy: occ, vacancyCost: vacancy, expiringCount: expiring.length };
  });

  const worstClient = [...clientStats].sort((a, b) => a.occupancy - b.occupancy)[0];
  const bestVacancy = [...clientStats].sort((a, b) => b.vacancyCost - a.vacancyCost)[0];
  const savings = Math.round(kpis.totalOperatingExpenses * 0.08);

  const muligheter: SummaryCard = {
    type: 'muligheter',
    bullets: [
      `Felles vedlikeholdsavtale = ~${formatNOK(savings)} besparelse (8%)`,
      bestVacancy ? `Utleie ledige arealer ${bestVacancy.client.name} = +${formatNOK(bestVacancy.vacancyCost)}/år` : 'Ingen vesentlig ledighet',
      'Nytt mandat-potensial basert på porteføljeytelse',
    ],
    bottomLine: `Estimert verdipotensial: +${formatNOK(savings + (bestVacancy?.vacancyCost ?? 0))}/år`,
    link: '/rapporter/ledighetsoversikt',
  };

  const expiringClients = clientStats.filter((c) => c.expiringCount > 0);
  const totalExpiring = expiringClients.reduce((s, c) => s + c.expiringCount, 0);

  const risiko: SummaryCard = {
    type: 'risiko',
    bullets: [
      worstClient ? `${worstClient.client.name} under ${formatPercent(worstClient.occupancy * 100)} utleie — mandatreforhandling mulig` : 'Alle kunder over target',
      totalExpiring > 0 ? `${totalExpiring} kontrakter utløper samtidig hos ${expiringClients.map((c) => c.client.name).join(', ')}` : 'Ingen kritiske utløp',
      'Følg opp kostnadsdata for alle kunder — sikre komplett rapportering',
    ],
    bottomLine: `Total risikoeksponering: ${formatNOK(kpis.incomeAtRisk + kpis.totalVacancyCost)}`,
    link: '/rapporter/kontraktsanalyse',
  };

  return { muligheter, risiko };
}
