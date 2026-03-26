import { useMemo } from 'react';
import { usePersona } from '../context/PersonaContext.tsx';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import type { PortfolioKPIs } from './usePortfolioKPI.ts';
import type { } from '../types/index.ts';
import { formatNOK, formatPercent, formatYears, formatM2 } from '../utils/formatters.ts';

export interface Insight {
  id: string;
  title: string;
  value: string;
  detail: string;
  severity: 'info' | 'warning' | 'positive' | 'negative';
}

function buildEierInsights(kpis: PortfolioKPIs): Insight[] {
  const insights: Insight[] = [];

  // 1. NOI-trend
  const actual = kpis.monthlyNOIData.filter((m) => !m.isFuture);
  if (actual.length >= 2) {
    const last = actual[actual.length - 1];
    const prev = actual[actual.length - 2];
    const noiLast = last.income - last.costs;
    const noiPrev = prev.income - prev.costs;
    const change = noiPrev > 0 ? ((noiLast - noiPrev) / noiPrev) * 100 : 0;
    insights.push({
      id: 'noi-trend',
      title: 'NOI-trend',
      value: formatNOK(noiLast) + '/mnd',
      detail: `${change >= 0 ? '↑' : '↓'} ${formatPercent(Math.abs(change))} vs. forrige måned (${formatNOK(noiPrev)})`,
      severity: change >= 0 ? 'positive' : 'negative',
    });
  }

  // 2. Kontraktsrisiko
  const expiringY1 = kpis.expiryProfile[0];
  if (expiringY1) {
    insights.push({
      id: 'contract-risk',
      title: 'Kontraktsrisiko',
      value: formatNOK(kpis.incomeAtRisk),
      detail: `${formatPercent(kpis.incomeAtRiskPercent)} av porteføljeleie utløper innen 12 mnd. Y+1: ${formatNOK(expiringY1.expiringRent)} (${expiringY1.contractCount} kontrakter)`,
      severity: kpis.incomeAtRiskPercent > 10 ? 'warning' : 'info',
    });
  }

  // 3. Ledighetskostnad
  insights.push({
    id: 'vacancy-cost',
    title: 'Ledighetskostnad',
    value: formatNOK(kpis.totalVacancyCost),
    detail: `${formatM2(kpis.totalVacantM2)} ledig areal fordelt på ${kpis.buildingsHighVacancy} bygg med >10% ledighet`,
    severity: kpis.totalVacancyCost > 5000000 ? 'warning' : 'info',
  });

  // 4. Utleiegrad-trend
  insights.push({
    id: 'occupancy',
    title: 'Utleiegrad',
    value: formatPercent(kpis.portfolioOccupancyRate * 100),
    detail: `${formatM2(kpis.totalCommittedM2)} utleid av ${formatM2(kpis.totalRentableM2)} ekslusivt areal`,
    severity: kpis.portfolioOccupancyRate >= 0.9 ? 'positive' : kpis.portfolioOccupancyRate < 0.8 ? 'negative' : 'info',
  });

  // 5. Kostnad/m²
  const costPerM2 = kpis.totalRentableM2 > 0 ? kpis.totalOperatingExpenses / kpis.totalRentableM2 : 0;
  insights.push({
    id: 'cost-per-m2',
    title: 'Kostnad per m²',
    value: formatNOK(costPerM2),
    detail: `Totale driftskostnader ${formatNOK(kpis.totalOperatingExpenses)} / ${formatM2(kpis.totalRentableM2)} ekslusivt areal`,
    severity: 'info',
  });

  return insights;
}

function buildInvestorInsights(kpis: PortfolioKPIs, fundData: { name: string; yield_: number }[]): Insight[] {
  const insights: Insight[] = [];

  // 1. Yield-spread mellom fond
  if (fundData.length >= 2) {
    const sorted = [...fundData].sort((a, b) => b.yield_ - a.yield_);
    const spread = sorted[0].yield_ - sorted[sorted.length - 1].yield_;
    insights.push({
      id: 'yield-spread',
      title: 'Yield-spread mellom fond',
      value: formatPercent(spread) + ' spread',
      detail: `Høyest: ${sorted[0].name} (${formatPercent(sorted[0].yield_)}). Lavest: ${sorted[sorted.length - 1].name} (${formatPercent(sorted[sorted.length - 1].yield_)})`,
      severity: spread > 3 ? 'warning' : 'info',
    });
  }

  // 2. Konsentrasjonsrisiko
  const topTenant = kpis.topTenants[0];
  if (topTenant) {
    insights.push({
      id: 'concentration',
      title: 'Konsentrasjonsrisiko',
      value: formatPercent(topTenant.percentOfPortfolio),
      detail: `Største leietaker: ${topTenant.tenantName} (${formatNOK(topTenant.totalAnnualRent)}, ${topTenant.buildingCount} bygg). Topp 10 dekker ${formatPercent(kpis.topTenCoverage)}`,
      severity: topTenant.percentOfPortfolio > 15 ? 'warning' : 'info',
    });
  }

  // 3. WAULT vs. benchmark (5 år som benchmark)
  const benchmark = 5;
  insights.push({
    id: 'wault-benchmark',
    title: 'WAULT vs. benchmark',
    value: formatYears(kpis.portfolioWAULT),
    detail: `Benchmark: ${formatYears(benchmark)}. ${kpis.portfolioWAULT >= benchmark ? 'Over' : 'Under'} benchmark med ${formatYears(Math.abs(kpis.portfolioWAULT - benchmark))}. Effektiv WAULT: ${formatYears(kpis.effectiveWAULT)}`,
    severity: kpis.portfolioWAULT >= benchmark ? 'positive' : 'warning',
  });

  // 4. Verdiutvikling
  insights.push({
    id: 'value-dev',
    title: 'Verdiutvikling',
    value: formatNOK(kpis.totalPortfolioValue),
    detail: `NOI-yield: ${formatPercent(kpis.noiYield)}. NOI-margin: ${formatPercent(kpis.noiMargin)}. ${kpis.buildingCount} bygninger i porteføljen`,
    severity: kpis.noiYield > 5 ? 'positive' : 'info',
  });

  // 5. Geografisk eksponering
  const topGeo = kpis.diversification.byGeography[0];
  if (topGeo) {
    insights.push({
      id: 'geo-exposure',
      title: 'Geografisk eksponering',
      value: `${topGeo.label}: ${formatPercent(topGeo.percent)}`,
      detail: kpis.diversification.byGeography.map((g) => `${g.label} ${formatPercent(g.percent)}`).join(', '),
      severity: topGeo.percent > 60 ? 'warning' : 'info',
    });
  }

  return insights;
}

function buildForvalterInsights(
  kpis: PortfolioKPIs,
  clientData: { name: string; value: number; noi: number; buildings: number }[],
): Insight[] {
  const insights: Insight[] = [];

  // 1. Kunderanking
  const sorted = [...clientData].sort((a, b) => b.value - a.value);
  if (sorted.length > 0) {
    insights.push({
      id: 'client-ranking',
      title: 'Kunderanking',
      value: `${sorted.length} kunder`,
      detail: sorted.map((c, i) => `${i + 1}. ${c.name}: ${formatNOK(c.value)} (${c.buildings} bygg)`).join('. '),
      severity: 'info',
    });
  }

  // 2. Utløpende kontrakter (cross-client)
  insights.push({
    id: 'expiring-cross',
    title: 'Utløpende kontrakter',
    value: formatNOK(kpis.incomeAtRisk),
    detail: `${formatPercent(kpis.incomeAtRiskPercent)} av total porteføljeleie. ${kpis.expiryProfile[0]?.contractCount ?? 0} kontrakter utløper Y+1`,
    severity: kpis.incomeAtRiskPercent > 10 ? 'warning' : 'info',
  });

  // 3. Driftskostnader sammenligning
  const costPerM2 = kpis.totalRentableM2 > 0 ? kpis.totalOperatingExpenses / kpis.totalRentableM2 : 0;
  insights.push({
    id: 'cost-comparison',
    title: 'Driftskostnader',
    value: `${formatNOK(costPerM2)}/m²`,
    detail: `Totale kostnader: ${formatNOK(kpis.totalOperatingExpenses)}. Snitt per bygg: ${formatNOK(kpis.totalOperatingExpenses / Math.max(kpis.buildingCount, 1))}`,
    severity: 'info',
  });

  // 4. Kundeverdi / total forvaltet
  const totalForvaltet = clientData.reduce((s, c) => s + c.value, 0);
  insights.push({
    id: 'aum',
    title: 'Forvaltet kapital',
    value: formatNOK(totalForvaltet),
    detail: sorted.map((c) => `${c.name}: ${formatNOK(c.value)}`).join('. '),
    severity: 'positive',
  });

  // 5. Rapportstatus (simulated)
  insights.push({
    id: 'report-status',
    title: 'Rapportstatus',
    value: `${sorted.length} rapporter klare`,
    detail: `Alle ${sorted.length} kunderapporter kan genereres med oppdaterte data for gjeldende periode`,
    severity: 'positive',
  });

  return insights;
}

export function usePersonaInsights(kpis: PortfolioKPIs): Insight[] {
  const { persona, clients } = usePersona();
  const { buildings, contracts, costs, funds } = usePortfolioContext();

  return useMemo(() => {
    if (persona === 'eier') {
      return buildEierInsights(kpis);
    }

    if (persona === 'investor') {
      // Calculate per-fund yield
      const fundData = funds.map((fund) => {
        const fundBuildings = buildings.filter((b) => fund.buildingIds.includes(b.id) && !b.isArchived);
        const fundBuildingIds = fundBuildings.map((b) => b.id);
        const activeContracts = contracts.filter(
          (c) => fundBuildingIds.includes(c.buildingId) && (c.status === 'active' || c.status === 'expiring_soon'),
        );
        const income = activeContracts.reduce((s, c) => s + c.annualRent, 0);
        const fundCosts = costs.filter((c) => fundBuildingIds.includes(c.buildingId));
        const ms = new Set(fundCosts.map((c) => `${c.year}-${c.month}`)).size;
        const totalCost = fundCosts.reduce((s, c) => s + c.amount, 0);
        const annualized = ms > 0 ? (totalCost / ms) * 12 : 0;
        const noi = income - annualized;
        const value = fundBuildings.reduce((s, b) => s + (b.estimatedMarketValue ?? 0), 0);
        return { name: fund.name, yield_: value > 0 ? (noi / value) * 100 : 0 };
      });
      return buildInvestorInsights(kpis, fundData);
    }

    // Forvalter
    const clientData = clients.map((client) => {
      const clientBuildings = buildings.filter((b) => client.buildingIds.includes(b.id) && !b.isArchived);
      const value = clientBuildings.reduce((s, b) => s + (b.estimatedMarketValue ?? 0), 0);
      const clientBuildingIds = clientBuildings.map((b) => b.id);
      const activeContracts = contracts.filter(
        (c) => clientBuildingIds.includes(c.buildingId) && (c.status === 'active' || c.status === 'expiring_soon'),
      );
      const income = activeContracts.reduce((s, c) => s + c.annualRent, 0);
      const clientCosts = costs.filter((c) => clientBuildingIds.includes(c.buildingId));
      const ms = new Set(clientCosts.map((c) => `${c.year}-${c.month}`)).size;
      const totalCost = clientCosts.reduce((s, c) => s + c.amount, 0);
      const annualized = ms > 0 ? (totalCost / ms) * 12 : 0;
      return { name: client.name, value, noi: income - annualized, buildings: clientBuildings.length };
    });
    return buildForvalterInsights(kpis, clientData);
  }, [persona, kpis, funds, buildings, contracts, costs, clients]);
}
