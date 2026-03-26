import { useMemo } from 'react';
import { usePersona } from '../context/PersonaContext.tsx';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import type { PortfolioKPIs } from './usePortfolioKPI.ts';
import { formatNOK, formatPercent, formatYears, formatM2 } from '../utils/formatters.ts';

export interface InsightBreakdownLine {
  label: string;
  value: string;
}

export interface Insight {
  id: string;
  title: string;
  value: string;
  trend?: string;
  breakdown: InsightBreakdownLine[];
  detail: string;
  severity: 'info' | 'warning' | 'positive' | 'negative';
  link?: string;
}

function buildEierInsights(kpis: PortfolioKPIs): Insight[] {
  const actual = kpis.monthlyNOIData.filter((m) => !m.isFuture);
  const last3 = actual.slice(-3);
  const noiLast = last3.length > 0 ? last3[last3.length - 1].income - last3[last3.length - 1].costs : 0;
  const noiPrev = last3.length > 1 ? last3[last3.length - 2].income - last3[last3.length - 2].costs : 0;
  const change = noiPrev > 0 ? ((noiLast - noiPrev) / noiPrev) * 100 : 0;

  const topVacancy = [...kpis.filteredBuildings].sort((a, b) => ((b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0)) - ((a.totalRentableM2 - a.committedM2) * (a.marketRentPerM2 ?? 0))).slice(0, 3);

  return [
    {
      id: 'noi-trend', title: 'NOI-trend', value: formatNOK(noiLast) + '/mnd',
      trend: `${change >= 0 ? '↑' : '↓'} ${formatPercent(Math.abs(change))} vs. forrige`,
      breakdown: last3.map((m) => ({ label: m.month.split(' ')[0], value: formatNOK(m.income - m.costs) })),
      detail: `Margin: ${formatPercent(kpis.noiMargin)}. Yield: ${formatPercent(kpis.noiYield)}`,
      severity: change >= 0 ? 'positive' : 'negative', link: '/rapporter/portefoljeoversikt',
    },
    {
      id: 'contract-risk', title: 'Kontraktsrisiko', value: formatNOK(kpis.incomeAtRisk),
      trend: `${formatPercent(kpis.incomeAtRiskPercent)} av total`,
      breakdown: kpis.expiryProfile.slice(0, 3).map((e) => ({ label: e.label, value: `${formatNOK(e.expiringRent)} (${e.contractCount})` })),
      detail: `Y+1 utløp krever reforhandling. Effektiv WAULT: ${formatYears(kpis.effectiveWAULT)}`,
      severity: kpis.incomeAtRiskPercent > 10 ? 'warning' : 'info', link: '/rapporter/kontraktsanalyse',
    },
    {
      id: 'vacancy-cost', title: 'Ledighetskostnad', value: formatNOK(kpis.totalVacancyCost),
      trend: `${kpis.buildingsHighVacancy} bygg >10%`,
      breakdown: topVacancy.map((b) => ({ label: b.name, value: formatNOK((b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0)) })),
      detail: `${formatM2(kpis.totalVacantM2)} ledig av ${formatM2(kpis.totalRentableM2)} ekslusivt`,
      severity: kpis.totalVacancyCost > 5000000 ? 'warning' : 'info', link: '/rapporter/ledighetsoversikt',
    },
    {
      id: 'occupancy', title: 'Utleiegrad', value: formatPercent(kpis.portfolioOccupancyRate * 100),
      trend: kpis.portfolioOccupancyRate >= 0.92 ? '↑ Over 92% benchmark' : '↓ Under 92% benchmark',
      breakdown: [
        { label: 'Over 92%', value: `${kpis.filteredBuildings.filter((b) => b.occupancyRate >= 0.92).length} bygg` },
        { label: 'Under 92%', value: `${kpis.filteredBuildings.filter((b) => b.occupancyRate < 0.92).length} bygg` },
        { label: 'Kostnad/m²', value: formatNOK(kpis.totalRentableM2 > 0 ? kpis.totalOperatingExpenses / kpis.totalRentableM2 : 0) },
      ],
      detail: `${formatM2(kpis.totalCommittedM2)} utleid av ${formatM2(kpis.totalRentableM2)}`,
      severity: kpis.portfolioOccupancyRate >= 0.9 ? 'positive' : kpis.portfolioOccupancyRate < 0.8 ? 'negative' : 'info', link: '/rapporter/portefoljeoversikt',
    },
  ];
}

function buildInvestorInsights(kpis: PortfolioKPIs, fundData: { name: string; yield_: number; value: number }[]): Insight[] {
  const sortedFunds = [...fundData].sort((a, b) => b.yield_ - a.yield_);
  const spread = sortedFunds.length >= 2 ? sortedFunds[0].yield_ - sortedFunds[sortedFunds.length - 1].yield_ : 0;
  const top3 = kpis.topTenants.slice(0, 3);
  const benchmark = 5;
  const vacancyUplift = kpis.totalVacancyCost;
  const impliedValueUplift = kpis.noiYield > 0 ? (vacancyUplift / (kpis.noiYield / 100)) : 0;

  return [
    {
      id: 'yield-spread', title: 'Yield-spread mellom fond',
      value: formatPercent(spread) + ' spread',
      trend: sortedFunds[0] ? `Høyest: ${formatPercent(sortedFunds[0].yield_)}` : undefined,
      breakdown: sortedFunds.map((f) => ({ label: f.name, value: formatPercent(f.yield_) })),
      detail: `Target-sammenligning: ${sortedFunds.map((f) => f.name.split('—')[0].trim()).join(' vs. ')}`,
      severity: spread > 3 ? 'warning' : 'info', link: '/rapporter/portefoljeoversikt',
    },
    {
      id: 'concentration', title: 'Konsentrasjonsrisiko',
      value: top3[0] ? formatPercent(top3[0].percentOfPortfolio) : '—',
      trend: `Topp 10: ${formatPercent(kpis.topTenCoverage)}`,
      breakdown: top3.map((t) => ({ label: t.tenantName, value: formatPercent(t.percentOfPortfolio) })),
      detail: top3[0]?.isBankrupt ? `⚠ ${top3[0].tenantName} er konkurs` : `${top3[0]?.buildingCount ?? 0} bygg, ${formatNOK(top3[0]?.totalAnnualRent ?? 0)}/år`,
      severity: top3[0] && top3[0].percentOfPortfolio > 15 ? 'warning' : 'info', link: '/rapporter/leietakeranalyse',
    },
    {
      id: 'wault-benchmark', title: 'WAULT vs. benchmark', value: formatYears(kpis.portfolioWAULT),
      trend: `${kpis.portfolioWAULT >= benchmark ? '↑ Over' : '↓ Under'} ${benchmark} år`,
      breakdown: [
        ...sortedFunds.map((f) => ({ label: f.name, value: formatYears(kpis.portfolioWAULT) })), // simplified; ideally per-fund WAULT
        { label: 'Effektiv WAULT', value: formatYears(kpis.effectiveWAULT) },
        { label: 'Utløp 12 mnd', value: `${kpis.expiryProfile[0]?.contractCount ?? 0} kontr.` },
      ],
      detail: `Benchmark ${formatYears(benchmark)}. Avvik: ${formatYears(Math.abs(kpis.portfolioWAULT - benchmark))}`,
      severity: kpis.portfolioWAULT >= benchmark ? 'positive' : 'warning', link: '/rapporter/kontraktsanalyse',
    },
    {
      id: 'value-dev', title: 'Verdiutvikling', value: `${formatPercent(kpis.noiYield)} yield`,
      trend: kpis.noiYield > 5 ? '↑ Attraktiv' : '↓ Under marked',
      breakdown: [
        { label: 'Porteføljeverdi', value: formatNOK(kpis.totalPortfolioValue) },
        ...sortedFunds.map((f) => ({ label: f.name, value: formatNOK(f.value) })),
        { label: 'Verdipotensial', value: `+${formatNOK(impliedValueUplift)}` },
      ],
      detail: `NOI-margin: ${formatPercent(kpis.noiMargin)}. Full utleie = +${formatNOK(impliedValueUplift)}`,
      severity: kpis.noiYield > 5 ? 'positive' : 'warning', link: '/rapporter/portefoljeoversikt',
    },
  ];
}

function buildForvalterInsights(
  kpis: PortfolioKPIs,
  clientData: { name: string; value: number; noi: number; buildings: number }[],
): Insight[] {
  const sorted = [...clientData].sort((a, b) => b.value - a.value);
  const costPerM2 = kpis.totalRentableM2 > 0 ? kpis.totalOperatingExpenses / kpis.totalRentableM2 : 0;
  const totalForvaltet = clientData.reduce((s, c) => s + c.value, 0);

  return [
    {
      id: 'client-ranking', title: 'Kunderanking', value: `${sorted.length} kunder`,
      trend: `Forvaltet: ${formatNOK(totalForvaltet)}`,
      breakdown: sorted.map((c) => ({ label: c.name, value: `${formatNOK(c.value)} (${c.buildings} bygg)` })),
      detail: `Prioriter kunder med utløpende kontrakter og høy ledighet`,
      severity: 'info', link: '/rapporter/portefoljeoversikt',
    },
    {
      id: 'expiring-cross', title: 'Utløpende kontrakter', value: formatNOK(kpis.incomeAtRisk),
      trend: `${formatPercent(kpis.incomeAtRiskPercent)} av total`,
      breakdown: kpis.expiryProfile.slice(0, 3).map((e) => ({ label: e.label, value: `${formatNOK(e.expiringRent)} (${e.contractCount})` })),
      detail: `Cross-client utløp krever koordinert oppfølging`,
      severity: kpis.incomeAtRiskPercent > 10 ? 'warning' : 'info', link: '/rapporter/kontraktsanalyse',
    },
    {
      id: 'cost-comparison', title: 'Driftskostnader', value: `${formatNOK(costPerM2)}/m²`,
      trend: `Totalt: ${formatNOK(kpis.totalOperatingExpenses)}`,
      breakdown: sorted.map((c) => {
        const margin = c.value > 0 ? (c.noi / c.value) * 100 : 0;
        return { label: c.name, value: `NOI-margin ${formatPercent(margin)}` };
      }),
      detail: `Snitt per bygg: ${formatNOK(kpis.totalOperatingExpenses / Math.max(kpis.buildingCount, 1))}`,
      severity: 'info', link: '/rapporter/portefoljeoversikt',
    },
    {
      id: 'aum', title: 'Forvaltet kapital', value: formatNOK(totalForvaltet),
      trend: `${kpis.buildingCount} bygg`,
      breakdown: sorted.map((c) => ({ label: c.name, value: formatNOK(c.value) })),
      detail: `Honorarpotensial basert på AUM og porteføljeytelse`,
      severity: 'positive', link: '/rapporter/portefoljeoversikt',
    },
  ];
}

export function usePersonaInsights(kpis: PortfolioKPIs): Insight[] {
  const { persona, clients } = usePersona();
  const { buildings, contracts, costs, funds } = usePortfolioContext();

  return useMemo(() => {
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
        return { name: fund.name, yield_: value > 0 ? (noi / value) * 100 : 0, value };
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
      return { name: client.name, value, noi: income - ann, buildings: cb.length };
    });
    return buildForvalterInsights(kpis, clientData);
  }, [persona, kpis, funds, buildings, contracts, costs, clients]);
}
