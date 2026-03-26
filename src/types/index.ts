// §3.1 Company
export interface Address {
  street: string;
  postalCode: string;
  municipality: string;
  country: string;
}

export interface Company {
  id: string;
  orgNr: string;
  name: string;
  address: Address;
  orgForm: string;
  naceCode: string;
  incorporationDate: string;
  employeeCount: number | null;
  isBankrupt: boolean;
  isWindingUp: boolean;
  isPartOfGroup: boolean;
  shareCapital: number | null;
  source: 'brreg';
}

// §3.2 Portfolio
export interface SubPortfolio {
  id: string;
  portfolioId: string;
  name: string;
  groupBy: 'geography' | 'type' | 'fund' | 'custom';
  buildingIds: string[];
}

export interface Portfolio {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  subPortfolios?: SubPortfolio[];
  createdAt: string;
}

// §3.3 Building
export type AssetClass =
  | 'Kontor'
  | 'HandelHighStreet'
  | 'Handel'
  | 'LogistikkLager'
  | 'Industri'
  | 'Hotell'
  | 'Helse'
  | 'Undervisning'
  | 'Kombinasjon'
  | 'Parkering';

export type EnergyLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type BuildingStandard = 'Høy' | 'Medium' | 'Lav';

export interface Building {
  id: string;
  portfolioId: string;
  subPortfolioId?: string;

  name: string;
  address: Address;
  coordinates: { lat: number; lng: number };
  matrikkelNr?: string;

  buildingType: AssetClass;
  yearBuilt: number | null;
  numberOfFloors: number | null;
  energyLabel: EnergyLabel | null;
  plotAreaM2: number | null;
  ownerName: string | null;
  ownershipMismatch: boolean;
  priceStatsPerM2: number | null;

  marketRentPerM2: number | null;
  purchasePrice: number | null;
  estimatedMarketValue: number | null;
  acquisitionDate: string | null;

  totalAreaM2: number;
  totalRentableM2: number;
  totalCommonAreaM2: number;
  committedM2: number;
  occupancyRate: number;
  vacancyRate: number;

  standard: BuildingStandard | null;
  isArchived: boolean;
  source: 'placepoint' | 'manual' | 'csv';
}

// §3.4 Area Unit
export type AreaClassification = 'ekslusivt' | 'fellesareal' | 'parkering';

export interface AreaUnit {
  id: string;
  buildingId: string;
  name: string;
  description?: string;
  areaType: AssetClass;
  classification: AreaClassification;
  areaM2: number;
  floor?: number;
  groupName?: string;
  isLeased: boolean;
  source: 'placepoint' | 'manual';
}

// §3.5 Contract
export type ContractStatus = 'active' | 'expiring_soon' | 'expired' | 'future';

export interface Contract {
  id: string;
  buildingId: string;
  areaType: AssetClass;
  areaM2: number;

  tenantName: string;
  tenantOrgNr?: string;
  tenantIsBankrupt: boolean;
  tenantIndustry?: string;

  annualRent: number;
  startDate: string;
  endDate: string;
  breakClauseDate?: string;
  renewalOption?: string;

  kpiAdjustmentPercent: number;
  kpiSource: 'ssb' | 'manual';

  status: ContractStatus;
  remainingTermYears: number;
  effectiveRemainingYears: number;
}

// §3.6 Operating Costs
export type StandardCostCategory =
  | 'drift'
  | 'vedlikehold'
  | 'forsikring'
  | 'administrasjon'
  | 'eiendomsskatt';

export interface CostEntry {
  id: string;
  buildingId: string;
  category: StandardCostCategory | string;
  year: number;
  month: number;
  amount: number;
  source: 'manual' | 'csv' | 'erp_mock';
}

export interface BudgetEntry {
  id: string;
  buildingId: string;
  category: StandardCostCategory | string;
  year: number;
  month: number;
  amount: number;
}

// §3.7 Market Data
export interface MarketData {
  buildingId: string;
  placePointPricePerM2: number | null;
  municipality: string;
  area: string;
  lastUpdated: string;
  disclaimer: 'Markedsreferanse basert på offentlige data (PlacePoint/SSB). Ikke finansiell rådgivning.';
}

// Fund
export interface Fund {
  id: string;
  portfolioId: string;
  name: string;
  strategy: 'core' | 'core_plus' | 'value_add' | 'opportunistic';
  buildingIds: string[];
  targetReturn?: number;
  vintage?: number;
}

// Portfolio-level analytics
export interface TenantConcentration {
  tenantName: string;
  tenantOrgNr?: string;
  totalAnnualRent: number;
  percentOfPortfolio: number;
  buildingCount: number;
  isBankrupt: boolean;
}

export interface CashFlowPeriod {
  year: number;
  month: number;
  label: string;
  isFuture: boolean;
  rentalIncome: number;
  operatingCosts: number;
  netCashFlow: number;
}

export interface ExpiryProfileYear {
  year: number;
  label: string;
  expiringRent: number;
  percentOfTotal: number;
  contractCount: number;
}

export interface DiversificationSlice {
  label: string;
  value: number;
  percent: number;
}

export interface PortfolioDiversification {
  byGeography: DiversificationSlice[];
  byAssetType: DiversificationSlice[];
  byTenantIndustry: DiversificationSlice[];
}

// §4.7 View Mode
export type ViewMode = 'building' | 'portfolio' | 'client';

// Time period filter
export type TimePeriod =
  | 'denne_maaneden'
  | 'forrige_maaned'
  | 'siste_6_maaneder'
  | 'neste_6_maaneder'
  | 'dette_aaret'
  | 'forrige_aar'
  | 'neste_aar'
  | 'egendefinert';

export interface DateRange {
  startDate: string;
  endDate: string;
}
