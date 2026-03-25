import { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  Company,
  Portfolio,
  Building,
  AreaUnit,
  Contract,
  CostEntry,
  BudgetEntry,
  MarketData,
  ViewMode,
} from '../types/index.ts';

import companiesData from '../data/companies.json';
import portfoliosData from '../data/portfolios.json';
import buildingsData from '../data/buildings.json';
import areaUnitsData from '../data/areaUnits.json';
import contractsData from '../data/contracts.json';
import costsData from '../data/costs.json';
import budgetsData from '../data/budgets.json';
import marketDataData from '../data/marketData.json';

interface PortfolioContextValue {
  companies: Company[];
  portfolios: Portfolio[];
  buildings: Building[];
  areaUnits: AreaUnit[];
  contracts: Contract[];
  costs: CostEntry[];
  budgets: BudgetEntry[];
  marketData: MarketData[];
  activeCompanyId: string;
  setActiveCompanyId: (id: string) => void;
  activePortfolioId: string;
  setActivePortfolioId: (id: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [activeCompanyId, setActiveCompanyId] = useState('c-001');
  const [activePortfolioId, setActivePortfolioId] = useState('p-001');
  const [viewMode, setViewMode] = useState<ViewMode>('building');

  const value: PortfolioContextValue = {
    companies: companiesData as Company[],
    portfolios: portfoliosData as Portfolio[],
    buildings: buildingsData as Building[],
    areaUnits: areaUnitsData as AreaUnit[],
    contracts: contractsData as Contract[],
    costs: costsData as CostEntry[],
    budgets: budgetsData as BudgetEntry[],
    marketData: marketDataData as MarketData[],
    activeCompanyId,
    setActiveCompanyId,
    activePortfolioId,
    setActivePortfolioId,
    viewMode,
    setViewMode,
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
