import { useMemo } from 'react';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { useFilterContext } from '../context/FilterContext.tsx';
import type {
  Building,
  Contract,
  CostEntry,
  BudgetEntry,
  Fund,
  TenantConcentration,
  CashFlowPeriod,
  ExpiryProfileYear,
  PortfolioDiversification,
} from '../types/index.ts';

// Re-export for backward compat with existing building-detail pages
export interface MonthlyNOIEntry {
  month: string;
  isFuture: boolean;
  income: number;
  costs: number;
}

interface FundValue {
  fund: Fund;
  totalValue: number;
}

export interface PortfolioKPIs {
  // Widget 1: Portfolio Value
  totalPortfolioValue: number;
  fundValues: FundValue[];

  // Widget 2: NOI & Yield
  totalNOI: number;
  totalGrossRentalIncome: number;
  totalOperatingExpenses: number;
  noiYield: number;
  noiMargin: number;
  monthlyNOIData: MonthlyNOIEntry[];

  // Widget 3: Cash Flow
  cashFlowPeriods: CashFlowPeriod[];

  // Widget 4: WAULT
  portfolioWAULT: number;
  effectiveWAULT: number;
  incomeAtRisk: number;
  incomeAtRiskPercent: number;

  // Widget 5: Occupancy
  portfolioOccupancyRate: number;
  totalRentableM2: number;
  totalCommittedM2: number;

  // Widget 6: Vacancy Cost
  totalVacancyCost: number;
  totalVacantM2: number;
  buildingsHighVacancy: number;

  // Widget 7: Diversification
  diversification: PortfolioDiversification;

  // Widget 8: Tenant Concentration
  topTenants: TenantConcentration[];
  topTenCoverage: number;

  // Widget 9: Expiry Profile
  expiryProfile: ExpiryProfileYear[];

  // Counts
  buildingCount: number;
  totalM2: number;

  // Data availability flags
  hasContracts: boolean;
  hasCosts: boolean;

  // Filtered buildings (for fund view table)
  filteredBuildings: Building[];
}

function getActiveContracts(contracts: Contract[], buildingIds?: string[]): Contract[] {
  const filtered = buildingIds
    ? contracts.filter((c) => buildingIds.includes(c.buildingId))
    : contracts;
  return filtered.filter((c) => c.status === 'active' || c.status === 'expiring_soon');
}

function calcWAULT(contracts: Contract[], useEffective: boolean): number {
  const active = contracts.filter((c) => c.status === 'active' || c.status === 'expiring_soon');
  const totalRent = active.reduce((sum, c) => sum + c.annualRent, 0);
  if (totalRent === 0) return 0;
  return active.reduce((sum, c) => {
    const term = useEffective ? c.effectiveRemainingYears : c.remainingTermYears;
    return sum + Math.max(0, term) * c.annualRent;
  }, 0) / totalRent;
}

export function usePortfolioKPI(personaBuildingIds?: string[] | null): PortfolioKPIs {
  const { buildings, contracts, costs, budgets, funds } = usePortfolioContext();
  const { selectedFundId, effectiveDateRange } = useFilterContext();

  return useMemo(() => {
    // Start with all non-archived buildings
    let baseBuildings = buildings.filter((b) => !b.isArchived);

    // Persona-level filtering (eier sees subset, forvalter scoped by client)
    if (personaBuildingIds && personaBuildingIds.length > 0) {
      baseBuildings = baseBuildings.filter((b) => personaBuildingIds.includes(b.id));
    }

    // Fund filter narrows further
    const selectedFund = selectedFundId ? funds.find((f) => f.id === selectedFundId) : null;
    const filteredBuildings = selectedFund
      ? baseBuildings.filter((b) => selectedFund.buildingIds.includes(b.id))
      : baseBuildings;
    const buildingIds = filteredBuildings.map((b) => b.id);

    // Active contracts scoped to filtered buildings
    const scopedContracts = contracts.filter((c) => buildingIds.includes(c.buildingId));
    const activeContracts = getActiveContracts(contracts, buildingIds);

    // --- Widget 1: Portfolio Value ---
    const totalPortfolioValue = filteredBuildings.reduce((s, b) => s + (b.estimatedMarketValue ?? 0), 0);
    const fundValues: FundValue[] = funds.map((fund) => {
      const fundBuildings = buildings.filter((b) => fund.buildingIds.includes(b.id));
      return {
        fund,
        totalValue: fundBuildings.reduce((s, b) => s + (b.estimatedMarketValue ?? 0), 0),
      };
    });

    // --- Widget 2: NOI & Yield ---
    const totalGrossRentalIncome = activeContracts.reduce((s, c) => s + c.annualRent, 0);
    const [sY, sM] = effectiveDateRange.startDate.split('-').map(Number);
    const [eY, eM] = effectiveDateRange.endDate.split('-').map(Number);
    const startYM = sY * 12 + sM;
    const endYM = eY * 12 + eM;
    const periodCosts = costs.filter((c) => {
      if (!buildingIds.includes(c.buildingId)) return false;
      const ym = c.year * 12 + c.month;
      return ym >= startYM && ym <= endYM;
    });
    const totalOperatingExpenses = periodCosts.reduce((s, c) => s + c.amount, 0);
    const totalNOI = totalGrossRentalIncome - totalOperatingExpenses;
    const noiYield = totalPortfolioValue > 0 ? (totalNOI / totalPortfolioValue) * 100 : 0;
    const noiMargin = totalGrossRentalIncome > 0 ? (totalNOI / totalGrossRentalIncome) * 100 : 0;

    // Monthly NOI data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const currentYM = now.getFullYear() * 12 + now.getMonth();
    const monthlyNOIData: MonthlyNOIEntry[] = [];
    const cursor = new Date(sY, sM - 1, 1);
    const endDate = new Date(eY, eM - 1, 28);
    while (cursor <= endDate) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const label = `${monthNames[m - 1]} ${y}`;
      const ym = y * 12 + (m - 1);
      const isFuture = ym > currentYM;

      const monthlyRent = filteredBuildings.reduce((sum, building) => {
        const active = getActiveContracts(contracts, [building.id]);
        return sum + active.reduce((s, c) => s + c.annualRent / 12, 0);
      }, 0);

      if (isFuture) {
        const monthBudgets = budgets.filter(
          (b: BudgetEntry) => b.year === y && b.month === m && buildingIds.includes(b.buildingId),
        );
        const budgetCosts = monthBudgets.reduce((sum: number, b: BudgetEntry) => sum + b.amount, 0);
        monthlyNOIData.push({ month: label, isFuture: true, income: monthlyRent, costs: budgetCosts });
      } else {
        const monthCosts = costs.filter(
          (c: CostEntry) => c.year === y && c.month === m && buildingIds.includes(c.buildingId),
        );
        monthlyNOIData.push({ month: label, isFuture: false, income: monthlyRent, costs: monthCosts.reduce((s, c) => s + c.amount, 0) });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // --- Widget 3: Cash Flow ---
    const cashFlowPeriods: CashFlowPeriod[] = monthlyNOIData.map((entry) => {
      const parts = entry.month.split(' ');
      const monthIdx = monthNames.indexOf(parts[0]);
      const year = parseInt(parts[1], 10);
      return {
        year,
        month: monthIdx + 1,
        label: entry.month,
        isFuture: entry.isFuture,
        rentalIncome: entry.income,
        operatingCosts: entry.costs,
        netCashFlow: entry.income - entry.costs,
      };
    });

    // --- Widget 4: WAULT ---
    const portfolioWAULT = calcWAULT(scopedContracts, false);
    const effectiveWAULT = calcWAULT(scopedContracts, true);
    const incomeAtRisk = activeContracts
      .filter((c) => c.remainingTermYears > 0 && c.remainingTermYears < 1)
      .reduce((s, c) => s + c.annualRent, 0);
    const incomeAtRiskPercent = totalGrossRentalIncome > 0 ? (incomeAtRisk / totalGrossRentalIncome) * 100 : 0;

    // --- Widget 5: Occupancy ---
    const totalRentableM2 = filteredBuildings.reduce((s, b) => s + b.totalRentableM2, 0);
    const totalCommittedM2 = filteredBuildings.reduce((s, b) => s + b.committedM2, 0);
    const portfolioOccupancyRate = totalRentableM2 > 0 ? totalCommittedM2 / totalRentableM2 : 0;

    // --- Widget 6: Vacancy Cost ---
    const totalVacantM2 = filteredBuildings.reduce((s, b) => s + (b.totalRentableM2 - b.committedM2), 0);
    const totalVacancyCost = filteredBuildings.reduce(
      (s, b) => s + (b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0), 0,
    );
    const buildingsHighVacancy = filteredBuildings.filter((b) => b.vacancyRate > 0.1).length;

    // --- Widget 7: Diversification ---
    const geoMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    const industryMap = new Map<string, number>();

    for (const c of activeContracts) {
      const building = filteredBuildings.find((b) => b.id === c.buildingId);
      if (!building) continue;

      const geo = building.address.municipality;
      geoMap.set(geo, (geoMap.get(geo) ?? 0) + c.annualRent);

      const btype = building.buildingType;
      typeMap.set(btype, (typeMap.get(btype) ?? 0) + c.annualRent);

      const industry = c.tenantIndustry ?? 'Ukjent';
      industryMap.set(industry, (industryMap.get(industry) ?? 0) + c.annualRent);
    }

    const toSlices = (map: Map<string, number>) => {
      const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
      return Array.from(map.entries())
        .map(([label, value]) => ({ label, value, percent: total > 0 ? (value / total) * 100 : 0 }))
        .sort((a, b) => b.value - a.value);
    };

    const diversification: PortfolioDiversification = {
      byGeography: toSlices(geoMap),
      byAssetType: toSlices(typeMap),
      byTenantIndustry: toSlices(industryMap),
    };

    // --- Widget 8: Tenant Concentration ---
    const tenantMap = new Map<string, { rent: number; orgNr?: string; buildings: Set<string>; bankrupt: boolean }>();
    for (const c of activeContracts) {
      const existing = tenantMap.get(c.tenantName);
      if (existing) {
        existing.rent += c.annualRent;
        existing.buildings.add(c.buildingId);
        if (c.tenantIsBankrupt) existing.bankrupt = true;
      } else {
        tenantMap.set(c.tenantName, {
          rent: c.annualRent,
          orgNr: c.tenantOrgNr,
          buildings: new Set([c.buildingId]),
          bankrupt: c.tenantIsBankrupt,
        });
      }
    }
    const topTenants: TenantConcentration[] = Array.from(tenantMap.entries())
      .map(([name, data]) => ({
        tenantName: name,
        tenantOrgNr: data.orgNr,
        totalAnnualRent: data.rent,
        percentOfPortfolio: totalGrossRentalIncome > 0 ? (data.rent / totalGrossRentalIncome) * 100 : 0,
        buildingCount: data.buildings.size,
        isBankrupt: data.bankrupt,
      }))
      .sort((a, b) => b.totalAnnualRent - a.totalAnnualRent)
      .slice(0, 10);

    const topTenCoverage = topTenants.reduce((s, t) => s + t.percentOfPortfolio, 0);

    // --- Widget 9: Expiry Profile ---
    const currentYear = now.getFullYear();
    const expiryProfile: ExpiryProfileYear[] = [];
    for (let offset = 1; offset <= 5; offset++) {
      const yr = currentYear + offset;
      const expiring = activeContracts.filter((c) => {
        const endYear = new Date(c.endDate).getFullYear();
        return endYear === yr;
      });
      expiryProfile.push({
        year: yr,
        label: `Y+${offset}`,
        expiringRent: expiring.reduce((s, c) => s + c.annualRent, 0),
        percentOfTotal: totalGrossRentalIncome > 0
          ? (expiring.reduce((s, c) => s + c.annualRent, 0) / totalGrossRentalIncome) * 100
          : 0,
        contractCount: expiring.length,
      });
    }

    // --- Counts ---
    const buildingCount = filteredBuildings.length;
    const totalM2 = filteredBuildings.reduce((s, b) => s + b.totalAreaM2, 0);

    // --- Data availability ---
    const hasContracts = scopedContracts.length > 0;
    const hasCosts = periodCosts.length > 0;

    return {
      totalPortfolioValue,
      fundValues,
      totalNOI,
      totalGrossRentalIncome,
      totalOperatingExpenses,
      noiYield,
      noiMargin,
      monthlyNOIData,
      cashFlowPeriods,
      portfolioWAULT,
      effectiveWAULT,
      incomeAtRisk,
      incomeAtRiskPercent,
      portfolioOccupancyRate,
      totalRentableM2,
      totalCommittedM2,
      totalVacancyCost,
      totalVacantM2,
      buildingsHighVacancy,
      diversification,
      topTenants,
      topTenCoverage,
      expiryProfile,
      buildingCount,
      totalM2,
      hasContracts,
      hasCosts,
      filteredBuildings,
    };
  }, [buildings, contracts, costs, budgets, funds, selectedFundId, effectiveDateRange, personaBuildingIds]);
}
