import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type {
  Company,
  Portfolio,
  Building,
  AreaUnit,
  Contract,
  CostEntry,
  BudgetEntry,
  MarketData,
  Fund,
  ViewMode,
  ClientCompany,
} from '../types/index.ts';

import companiesData from '../data/companies.json';
import portfoliosData from '../data/portfolios.json';
import buildingsData from '../data/buildings.json';
import areaUnitsData from '../data/areaUnits.json';
import contractsData from '../data/contracts.json';
import costsData from '../data/costs.json';
import budgetsData from '../data/budgets.json';
import marketDataData from '../data/marketData.json';
import fundsData from '../data/funds.json';
import clientsData from '../data/clients.json';

export interface Kundebase {
  id: string;
  name: string;
  orgNr: string;
  isOnboarded: boolean;
  companies: Company[];
  portfolios: Portfolio[];
  buildings: Building[];
  areaUnits: AreaUnit[];
  contracts: Contract[];
  costs: CostEntry[];
  budgets: BudgetEntry[];
  marketData: MarketData[];
  funds: Fund[];
  clients: ClientCompany[];
}

const DEFAULT_KUNDEBASE: Kundebase = {
  id: 'kb-default',
  name: (companiesData as Company[])[0]?.name ?? 'Demo Kundebase',
  orgNr: (companiesData as Company[])[0]?.orgNr ?? '',
  isOnboarded: false,
  companies: companiesData as Company[],
  portfolios: portfoliosData as Portfolio[],
  buildings: buildingsData as Building[],
  areaUnits: areaUnitsData as AreaUnit[],
  contracts: contractsData as Contract[],
  costs: costsData as CostEntry[],
  budgets: budgetsData as BudgetEntry[],
  marketData: marketDataData as MarketData[],
  funds: fundsData as Fund[],
  clients: clientsData as ClientCompany[],
};

interface PortfolioContextValue {
  // Active kundebase data (what all consumers read)
  companies: Company[];
  portfolios: Portfolio[];
  buildings: Building[];
  areaUnits: AreaUnit[];
  contracts: Contract[];
  costs: CostEntry[];
  budgets: BudgetEntry[];
  marketData: MarketData[];
  funds: Fund[];
  clients: ClientCompany[];

  // Active state
  activeCompanyId: string;
  setActiveCompanyId: (id: string) => void;
  activePortfolioId: string;
  setActivePortfolioId: (id: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Kundebase management
  kundebaser: Kundebase[];
  activeKundebaseId: string;
  setActiveKundebaseId: (id: string) => void;
  addKundebase: (kb: Kundebase) => void;
  addBuildingsToActiveKundebase: (buildings: Building[], areaUnits: AreaUnit[]) => void;
  addContractToActiveKundebase: (contract: Contract) => void;
  addCostToActiveKundebase: (cost: CostEntry) => void;
  activeKundebase: Kundebase;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [kundebaser, setKundebaser] = useState<Kundebase[]>([DEFAULT_KUNDEBASE]);
  const [activeKundebaseId, setActiveKundebaseIdState] = useState('kb-default');
  const [activeCompanyId, setActiveCompanyId] = useState('c-001');
  const [activePortfolioId, setActivePortfolioId] = useState('p-001');
  const [viewMode, setViewMode] = useState<ViewMode>('building');

  const activeKundebase = useMemo(
    () => kundebaser.find((kb) => kb.id === activeKundebaseId) ?? DEFAULT_KUNDEBASE,
    [kundebaser, activeKundebaseId],
  );

  const setActiveKundebaseId = useCallback((id: string) => {
    setActiveKundebaseIdState(id);
    const kb = kundebaser.find((k) => k.id === id);
    if (kb) {
      if (kb.companies.length > 0) setActiveCompanyId(kb.companies[0].id);
      if (kb.portfolios.length > 0) setActivePortfolioId(kb.portfolios[0].id);
    }
  }, [kundebaser]);

  const addKundebase = useCallback((kb: Kundebase) => {
    setKundebaser((prev) => {
      const existing = prev.findIndex((k) => k.id === kb.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = kb;
        return updated;
      }
      return [...prev, kb];
    });
    setActiveKundebaseIdState(kb.id);
    if (kb.companies.length > 0) setActiveCompanyId(kb.companies[0].id);
    if (kb.portfolios.length > 0) setActivePortfolioId(kb.portfolios[0].id);
  }, []);

  const addBuildingsToActiveKundebase = useCallback((newBuildings: Building[], newAreaUnits: AreaUnit[]) => {
    setKundebaser((prev) =>
      prev.map((kb) => {
        if (kb.id !== activeKundebaseId) return kb;
        const existingIds = new Set(kb.buildings.map((b) => b.id));
        const uniqueBuildings = newBuildings.filter((b) => !existingIds.has(b.id));
        const existingAuIds = new Set(kb.areaUnits.map((au) => au.id));
        const uniqueAU = newAreaUnits.filter((au) => !existingAuIds.has(au.id));
        return {
          ...kb,
          buildings: [...kb.buildings, ...uniqueBuildings],
          areaUnits: [...kb.areaUnits, ...uniqueAU],
        };
      }),
    );
  }, [activeKundebaseId]);

  const addContractToActiveKundebase = useCallback((contract: Contract) => {
    setKundebaser((prev) =>
      prev.map((kb) => {
        if (kb.id !== activeKundebaseId) return kb;
        // Also update building's committedM2 and occupancy
        const updatedBuildings = kb.buildings.map((b) => {
          if (b.id !== contract.buildingId) return b;
          const buildingContracts = [...kb.contracts.filter((c) => c.buildingId === b.id && (c.status === 'active' || c.status === 'expiring_soon')), contract];
          const committedM2 = buildingContracts.reduce((s, c) => s + c.areaM2, 0);
          const occupancyRate = b.totalRentableM2 > 0 ? Math.min(committedM2 / b.totalRentableM2, 1) : 0;
          return { ...b, committedM2, occupancyRate, vacancyRate: 1 - occupancyRate };
        });
        return { ...kb, contracts: [...kb.contracts, contract], buildings: updatedBuildings };
      }),
    );
  }, [activeKundebaseId]);

  const addCostToActiveKundebase = useCallback((cost: CostEntry) => {
    setKundebaser((prev) =>
      prev.map((kb) => {
        if (kb.id !== activeKundebaseId) return kb;
        return { ...kb, costs: [...kb.costs, cost] };
      }),
    );
  }, [activeKundebaseId]);

  const value: PortfolioContextValue = {
    companies: activeKundebase.companies,
    portfolios: activeKundebase.portfolios,
    buildings: activeKundebase.buildings,
    areaUnits: activeKundebase.areaUnits,
    contracts: activeKundebase.contracts,
    costs: activeKundebase.costs,
    budgets: activeKundebase.budgets,
    marketData: activeKundebase.marketData,
    funds: activeKundebase.funds,
    clients: activeKundebase.clients,
    activeCompanyId,
    setActiveCompanyId,
    activePortfolioId,
    setActivePortfolioId,
    viewMode,
    setViewMode,
    kundebaser,
    activeKundebaseId,
    setActiveKundebaseId,
    addKundebase,
    addBuildingsToActiveKundebase,
    addContractToActiveKundebase,
    addCostToActiveKundebase,
    activeKundebase,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioContext(): PortfolioContextValue {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  }
  return context;
}
