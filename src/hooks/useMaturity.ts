import { useMemo } from 'react';
import { usePortfolioContext } from '../context/PortfolioContext.tsx';
import { ALL_CAPABILITIES, type MaturityCapability } from '../data/maturity.ts';
import type { Building } from '../types/index.ts';

export type CapabilityStatus = 'aktiv' | 'tilgjengelig' | 'krever_oppgradering';

export interface BuildingCapability {
  capability: MaturityCapability;
  status: CapabilityStatus;
}

export interface BuildingMaturity {
  buildingId: string;
  currentLevel: 1 | 2 | 3;
  percentage: number;
  activeCount: number;
  totalCount: number;
  capabilities: BuildingCapability[];
  levelCounts: { level: 1 | 2 | 3; active: number; total: number }[];
}

function computeBuildingMaturity(
  building: Building,
  hasContracts: boolean,
  hasCosts: boolean,
  hasLoans: boolean,
): BuildingMaturity {
  const hasPlacePoint = building.source === 'placepoint';
  const hasMarketRent = building.marketRentPerM2 != null && building.marketRentPerM2 > 0;
  const hasOccupancy = building.committedM2 > 0;
  const hasEnergyLabel = building.energyLabel != null;
  const hasOwners = building.owners.length > 0;
  const hasMarketValue = building.estimatedMarketValue != null && building.estimatedMarketValue > 0;

  const activeMap: Record<string, boolean> = {
    p01: hasPlacePoint,
    p02: hasPlacePoint,
    p03: hasEnergyLabel,
    p04: hasOwners,
    p05: hasMarketRent,
    p06: hasOccupancy || hasContracts,
    p07: hasMarketRent && (hasOccupancy || hasContracts),
    o01: hasContracts,
    o02: hasCosts,
    o03: hasContracts && hasCosts,
    o04: hasContracts && hasCosts,
    k01: hasContracts,
    k02: hasContracts,
    k03: hasContracts,
    b01: hasLoans,
    b02: hasLoans && hasMarketValue,
    b03: hasLoans && hasContracts && hasCosts,
    b04: hasLoans,
    b05: hasContracts || hasCosts,
  };

  const capabilities: BuildingCapability[] = ALL_CAPABILITIES.map((cap) => {
    if (cap.requiredLevel > 1) {
      return { capability: cap, status: 'krever_oppgradering' as const };
    }
    const isActive = activeMap[cap.id] ?? false;
    return { capability: cap, status: isActive ? 'aktiv' as const : 'tilgjengelig' as const };
  });

  const activeCount = capabilities.filter((c) => c.status === 'aktiv').length;
  const totalCount = ALL_CAPABILITIES.length;
  const percentage = Math.round((activeCount / totalCount) * 100);

  const levelCounts = ([1, 2, 3] as const).map((level) => {
    const levelCaps = capabilities.filter((c) => c.capability.requiredLevel === level);
    return {
      level,
      active: levelCaps.filter((c) => c.status === 'aktiv').length,
      total: levelCaps.length,
    };
  });

  return {
    buildingId: building.id,
    currentLevel: 1,
    percentage,
    activeCount,
    totalCount,
    capabilities,
    levelCounts,
  };
}

export function useBuildingMaturity(buildingId: string): BuildingMaturity | null {
  const { buildings, contracts, costs, loans } = usePortfolioContext();

  return useMemo(() => {
    const building = buildings.find((b) => b.id === buildingId);
    if (!building) return null;

    const hasContracts = contracts.some(
      (c) => c.buildingId === buildingId && (c.status === 'active' || c.status === 'expiring_soon'),
    );
    const hasCosts = costs.some((c) => c.buildingId === buildingId);
    const hasLoans = loans.some((l) => l.buildingId === buildingId);

    return computeBuildingMaturity(building, hasContracts, hasCosts, hasLoans);
  }, [buildingId, buildings, contracts, costs, loans]);
}

export function usePortfolioMaturity(): { buildings: BuildingMaturity[]; averagePercentage: number } {
  const { buildings, contracts, costs, loans } = usePortfolioContext();

  return useMemo(() => {
    const active = buildings.filter((b) => !b.isArchived);
    const maturities = active.map((building) => {
      const hasContracts = contracts.some(
        (c) => c.buildingId === building.id && (c.status === 'active' || c.status === 'expiring_soon'),
      );
      const hasCosts = costs.some((c) => c.buildingId === building.id);
      const hasLoans = loans.some((l) => l.buildingId === building.id);
      return computeBuildingMaturity(building, hasContracts, hasCosts, hasLoans);
    });

    const avg = maturities.length > 0
      ? Math.round(maturities.reduce((s, m) => s + m.percentage, 0) / maturities.length)
      : 0;

    return { buildings: maturities, averagePercentage: avg };
  }, [buildings, contracts, costs, loans]);
}
