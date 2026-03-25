import { useMemo } from 'react';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { useFilterContext } from '../context/FilterContext.tsx';
import type { Building, Contract, CostEntry } from '../types/index.ts';

interface BuildingNOI {
  building: Building;
  grossRentalIncome: number;
  operatingExpenses: number;
  noi: number;
}

interface BuildingOccupancy {
  building: Building;
  occupancyRate: number;
}

interface BuildingWAULT {
  building: Building;
  wault: number;
}

interface BuildingVacancyCost {
  building: Building;
  vacantM2: number;
  vacancyCost: number;
}

export interface DashboardKPIs {
  // NOI
  totalNOI: number;
  totalGrossRentalIncome: number;
  totalOperatingExpenses: number;
  buildingNOIs: BuildingNOI[];
  monthlyNOIData: { month: string; leieinntekter: number; driftskostnader: number }[];

  // Occupancy
  portfolioOccupancyRate: number;
  totalRentableM2: number;
  totalCommittedM2: number;
  buildingOccupancies: BuildingOccupancy[];
  top3Highest: BuildingOccupancy[];
  top3Lowest: BuildingOccupancy[];

  // WAULT
  portfolioWAULT: number;
  buildingWAULTs: BuildingWAULT[];
  longestWAULT: BuildingWAULT | null;
  shortestWAULT: BuildingWAULT | null;

  // Vacancy cost
  totalVacancyCost: number;
  buildingVacancyCosts: BuildingVacancyCost[];

  // Simple counts
  buildingCount: number;
  totalM2: number;
}

function getActiveContracts(contracts: Contract[], buildingId?: string): Contract[] {
  const filtered = buildingId
    ? contracts.filter((c) => c.buildingId === buildingId)
    : contracts;
  return filtered.filter((c) => c.status === 'active' || c.status === 'expiring_soon');
}

function calcWAULT(contracts: Contract[]): number {
  const active = contracts.filter((c) => c.status === 'active' || c.status === 'expiring_soon');
  const totalRent = active.reduce((sum, c) => sum + c.annualRent, 0);
  if (totalRent === 0) return 0;
  const weighted = active.reduce((sum, c) => {
    const remaining = Math.max(0, c.remainingTermYears);
    return sum + remaining * c.annualRent;
  }, 0);
  return weighted / totalRent;
}

function getCostsInPeriod(
  costs: CostEntry[],
  buildingId: string | undefined,
  startDate: string,
  endDate: string,
): CostEntry[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return costs.filter((c) => {
    if (buildingId && c.buildingId !== buildingId) return false;
    const costDate = new Date(c.year, c.month - 1, 1);
    return costDate >= start && costDate <= end;
  });
}

export function useKPI(): DashboardKPIs {
  const { buildings, contracts, costs } = usePortfolioContext();
  const { selectedBuildingId, effectiveDateRange } = useFilterContext();

  return useMemo(() => {
    const filteredBuildings = selectedBuildingId
      ? buildings.filter((b) => b.id === selectedBuildingId)
      : buildings.filter((b) => !b.isArchived);

    // --- NOI per building ---
    const buildingNOIs: BuildingNOI[] = filteredBuildings.map((building) => {
      const activeContracts = getActiveContracts(contracts, building.id);
      const grossRentalIncome = activeContracts.reduce((sum, c) => sum + c.annualRent, 0);
      const periodCosts = getCostsInPeriod(costs, building.id, effectiveDateRange.startDate, effectiveDateRange.endDate);
      const operatingExpenses = periodCosts.reduce((sum, c) => sum + c.amount, 0);
      // Annualize: scale costs to full year if period < 12 months
      return {
        building,
        grossRentalIncome,
        operatingExpenses,
        noi: grossRentalIncome - operatingExpenses,
      };
    });
    const totalGrossRentalIncome = buildingNOIs.reduce((s, b) => s + b.grossRentalIncome, 0);
    const totalOperatingExpenses = buildingNOIs.reduce((s, b) => s + b.operatingExpenses, 0);
    const totalNOI = totalGrossRentalIncome - totalOperatingExpenses;

    // --- Monthly NOI chart data ---
    const start = new Date(effectiveDateRange.startDate);
    const end = new Date(effectiveDateRange.endDate);
    const monthlyNOIData: { month: string; leieinntekter: number; driftskostnader: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const label = `${monthNames[m - 1]} ${y}`;

      const buildingIds = filteredBuildings.map((b) => b.id);
      const monthCosts = costs.filter(
        (c) => c.year === y && c.month === m && buildingIds.includes(c.buildingId),
      );
      const driftskostnader = monthCosts.reduce((sum, c) => sum + c.amount, 0);

      // Monthly rental income: annual / 12
      const leieinntekter = filteredBuildings.reduce((sum, building) => {
        const active = getActiveContracts(contracts, building.id);
        return sum + active.reduce((s, c) => s + c.annualRent / 12, 0);
      }, 0);

      monthlyNOIData.push({ month: label, leieinntekter, driftskostnader });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // --- Occupancy ---
    const buildingOccupancies: BuildingOccupancy[] = filteredBuildings.map((building) => ({
      building,
      occupancyRate: building.occupancyRate,
    }));
    const totalRentableM2 = filteredBuildings.reduce((s, b) => s + b.totalRentableM2, 0);
    const totalCommittedM2 = filteredBuildings.reduce((s, b) => s + b.committedM2, 0);
    const portfolioOccupancyRate = totalRentableM2 > 0 ? totalCommittedM2 / totalRentableM2 : 0;

    const sorted = [...buildingOccupancies].sort((a, b) => b.occupancyRate - a.occupancyRate);
    const top3Highest = sorted.slice(0, 3);
    const top3Lowest = [...sorted].reverse().slice(0, 3);

    // --- WAULT ---
    const buildingWAULTs: BuildingWAULT[] = filteredBuildings.map((building) => ({
      building,
      wault: calcWAULT(contracts.filter((c) => c.buildingId === building.id)),
    }));
    const allActive = getActiveContracts(contracts, selectedBuildingId ?? undefined);
    const portfolioWAULT = calcWAULT(allActive);

    const sortedWAULTs = [...buildingWAULTs].filter((w) => w.wault > 0).sort((a, b) => b.wault - a.wault);
    const longestWAULT = sortedWAULTs[0] ?? null;
    const shortestWAULT = sortedWAULTs[sortedWAULTs.length - 1] ?? null;

    // --- Vacancy cost ---
    const buildingVacancyCosts: BuildingVacancyCost[] = filteredBuildings.map((building) => {
      const vacantM2 = building.totalRentableM2 - building.committedM2;
      const vacancyCost = vacantM2 * (building.marketRentPerM2 ?? 0);
      return { building, vacantM2, vacancyCost };
    });
    const totalVacancyCost = buildingVacancyCosts.reduce((s, b) => s + b.vacancyCost, 0);

    // --- Counts ---
    const buildingCount = filteredBuildings.length;
    const totalM2 = filteredBuildings.reduce((s, b) => s + b.totalAreaM2, 0);

    return {
      totalNOI,
      totalGrossRentalIncome,
      totalOperatingExpenses,
      buildingNOIs,
      monthlyNOIData,
      portfolioOccupancyRate,
      totalRentableM2,
      totalCommittedM2,
      buildingOccupancies,
      top3Highest,
      top3Lowest,
      portfolioWAULT,
      buildingWAULTs,
      longestWAULT,
      shortestWAULT,
      totalVacancyCost,
      buildingVacancyCosts,
      buildingCount,
      totalM2,
    };
  }, [buildings, contracts, costs, selectedBuildingId, effectiveDateRange]);
}
