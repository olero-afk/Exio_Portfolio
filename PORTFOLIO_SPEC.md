# Exio Portfolio — Full Prototype Specification

> Version 2.0 — March 2026 — Internal / Confidential
> This document is the single source of truth for building the Exio Portfolio prototype.

---

## §1 Product Overview

### 1.1 What is Exio Portfolio?
A new module for the Exio Næring platform — a Norwegian B2B SaaS for commercial real estate management. Portfolio provides CFOs, investors, and asset managers with live portfolio analytics: NOI, WAULT, vacancy cost, yield, and contract risk — replacing manual Excel workflows.

### 1.2 Prototype Scope
- **Phase 1** from the KPI roadmap: NOI, utleiegrad, ledighetskostnad, kostnadsstruktur per m², kontraktsutløpsprofil, WAULT, leieinntekter vs. period.
- Standalone React app — no dependency on existing Exio codebase.
- Mock API responses with realistic sample data (switchable to real APIs in dev).
- 8–12 demo buildings with mixed portfolio scenario.
- Desktop only, Norwegian (Bokmål) only.

### 1.3 Three Personas (Same UI, Data Access Controls Differ)

| Dimension | Owner (CFO/CEO) | Investor (CFO/CEO) | Manager (CFO/CEO) |
|-----------|----------------|--------------------|--------------------|
| Org type | Owns buildings directly | Investment company / fund / SPVs | Third-party management firm |
| Portfolio | 5–15 buildings | 5–50+ across entities | 10–30 across clients |
| NOI view | Per building | Per portfolio / entity | Per client |
| Key KPI | NOI, occupancy, cost/m² | Yield, WAULT, IRR | NOI per client, report efficiency |
| Reports to | Own board, bank | Investors/LPs, bank | Multiple owners/clients |
| Multi-portfolio | No | Yes (by geography, type, fund) | Yes (by client) |
| Client access | N/A | N/A | Owners see own portfolio (read-only) |
| White-label | No | No | PDF exports only |

---

## §2 Design System

### 2.1 Color Tokens
```css
/* App (Dark UI) */
--app-bg: #1a1a1a;
--app-surface: #1e1e1e;
--app-surface-mid: #222222;
--app-surface-raised: #2a2a2a;
--app-tab-bar: #1e1a14;
--app-text: #e8e8e8;
--app-text-secondary: #c8c8c8;
--app-text-muted: #9a9a9a;
--app-text-dim: #7a7a7a;
--app-text-faint: #5a5a5a;
--app-border: rgba(255, 255, 255, 0.06);
--app-border-mid: rgba(255, 255, 255, 0.08);

/* Accents */
--color-champagne: #FED092;    /* Active tabs, selections, pill active */
--color-cyan: #22d4e8;         /* Data viz, progress bars, inner tabs */
--color-green: #4ade80;        /* Positive, utleid status */
--color-red: #f87171;          /* Negative, ledig, warnings, bankruptcy */

/* Semantic */
--color-green-bg: #dcfce7;
--color-yellow-bg: #fef9c3;
--color-red-bg: #fee2e2;
--color-blue-bg: #eef2ff;

/* Footer */
--app-footer-bg: #0e0c0a;
```

### 2.2 Typography
- **Font**: Inter (400–900 weights)
- **KPI values**: 2rem, weight 800
- **Labels**: 0.75rem, weight 700, uppercase, letter-spacing 0.12em
- **Body**: 0.8125rem (13px), weight 400
- **Table cells**: 0.8125rem, color: --app-text-secondary

### 2.3 Spacing & Layout
- Border radius: 8px (cards), 4px (badges, pills)
- Section padding: 16–20px inside cards
- Grid gap: 12px (metric cards), 16–20px (sections)
- Transition: 0.25s ease

### 2.4 Number Formatting
```typescript
// Norwegian locale — space as thousand separator, comma as decimal
const formatNOK = (n: number): string =>
  new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(n) + ' kr';

const formatPercent = (n: number): string =>
  new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + '%';

const formatM2 = (n: number): string =>
  new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 }).format(n) + ' m²';

// Negative values: red text with minus prefix
// Use CSS class: .negative { color: var(--color-red); }
```

---

## §3 Data Model (TypeScript Interfaces)

### 3.1 Company
```typescript
interface Company {
  id: string;                    // UUID
  orgNr: string;                 // 9-digit Norwegian org number
  name: string;                  // From BRREG
  address: Address;              // From BRREG forretningsadresse
  orgForm: string;               // AS, ANS, ENK, etc.
  naceCode: string;              // Industry code (68.x = CRE)
  incorporationDate: string;     // ISO date
  employeeCount: number | null;
  isBankrupt: boolean;           // konkurs flag from BRREG
  isWindingUp: boolean;          // underAvvikling flag
  isPartOfGroup: boolean;        // erIKonsern
  shareCapital: number | null;
  source: 'brreg';
}

interface Address {
  street: string;
  postalCode: string;
  municipality: string;
  country: string;
}
```

### 3.2 Portfolio
```typescript
interface Portfolio {
  id: string;
  companyId: string;             // References Company.id
  name: string;
  description?: string;
  subPortfolios?: SubPortfolio[];
  createdAt: string;
}

interface SubPortfolio {
  id: string;
  portfolioId: string;
  name: string;
  groupBy: 'geography' | 'type' | 'fund' | 'custom';
  buildingIds: string[];
}
```

### 3.3 Building
```typescript
type AssetClass =
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

type EnergyLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
type BuildingStandard = 'Høy' | 'Medium' | 'Lav';

interface Building {
  id: string;
  portfolioId: string;
  subPortfolioId?: string;

  // Identity
  name: string;                  // Custom name (user-entered)
  address: Address;
  coordinates: { lat: number; lng: number };
  matrikkelNr?: string;          // KNR-GNR/BNR/FNR/SNR

  // From PlacePoint
  buildingType: AssetClass;
  yearBuilt: number | null;
  numberOfFloors: number | null;
  energyLabel: EnergyLabel | null;
  plotAreaM2: number | null;
  ownerName: string | null;      // Hjemmelshaver from PlacePoint
  ownershipMismatch: boolean;    // true if PlacePoint owner ≠ BRREG company
  priceStatsPerM2: number | null; // PlacePoint market reference

  // Financials (manual)
  marketRentPerM2: number | null;  // User-entered, PlacePoint as reference
  purchasePrice: number | null;
  estimatedMarketValue: number | null;
  acquisitionDate: string | null;

  // Computed (from area units)
  totalAreaM2: number;
  totalRentableM2: number;       // Sum of ekslusivt areal only
  totalCommonAreaM2: number;     // Sum of fellesareal
  committedM2: number;           // Sum of m² from active contracts
  occupancyRate: number;         // committedM2 / totalRentableM2
  vacancyRate: number;           // 1 - occupancyRate

  standard: BuildingStandard | null;
  isArchived: boolean;
  source: 'placepoint' | 'manual' | 'csv';
}
```

### 3.4 Area Unit
```typescript
type AreaClassification = 'ekslusivt' | 'fellesareal' | 'parkering';

interface AreaUnit {
  id: string;
  buildingId: string;
  name: string;                  // e.g., "U2 - Lager"
  description?: string;
  areaType: AssetClass;          // Kontor, Lager, etc.
  classification: AreaClassification;
  areaM2: number;
  floor?: number;                // Floor number if known
  groupName?: string;            // e.g., "U2" or "1. Etg"
  isLeased: boolean;
  source: 'placepoint' | 'manual';
}
```

### 3.5 Contract
```typescript
type ContractStatus = 'active' | 'expiring_soon' | 'expired' | 'future';

interface Contract {
  id: string;
  buildingId: string;
  areaType: AssetClass;          // What type of space (kontor, lager, etc.)
  areaM2: number;                // How many m² this contract covers

  // Tenant (property of contract)
  tenantName: string;
  tenantOrgNr?: string;          // For BRREG lookup
  tenantIsBankrupt: boolean;

  // Terms
  annualRent: number;            // NOK per year
  startDate: string;             // ISO date
  endDate: string;               // ISO date
  breakClauseDate?: string;      // Optional — for effective WAULT
  renewalOption?: string;        // Optional — description

  // KPI adjustment
  kpiAdjustmentPercent: number;  // Annual %, sourced from SSB CPI
  kpiSource: 'ssb' | 'manual';

  // Computed
  status: ContractStatus;        // Auto-calculated from dates
  remainingTermYears: number;    // endDate - today in decimal years
  effectiveRemainingYears: number; // Using breakClauseDate if present
}

// Status calculation:
// if today < startDate → 'future'
// if today > endDate → 'expired'
// if endDate - today < 365 days → 'expiring_soon'
// else → 'active'
```

### 3.6 Operating Costs
```typescript
type StandardCostCategory =
  | 'drift'
  | 'vedlikehold'
  | 'forsikring'
  | 'administrasjon'
  | 'eiendomsskatt';

interface CostEntry {
  id: string;
  buildingId: string;
  category: StandardCostCategory | string; // string for custom categories
  year: number;
  month: number;                 // 1–12
  amount: number;                // NOK
  source: 'manual' | 'csv' | 'erp_mock';
}

interface BudgetEntry {
  id: string;
  buildingId: string;
  category: StandardCostCategory | string;
  year: number;
  month: number;
  amount: number;
}
```

### 3.7 Market Data (PlacePoint Reference)
```typescript
interface MarketData {
  buildingId: string;
  placePointPricePerM2: number | null;
  municipality: string;
  area: string;                  // Grunnkrets or bydel
  lastUpdated: string;
  disclaimer: 'Markedsreferanse basert på offentlige data (PlacePoint/SSB). Ikke finansiell rådgivning.';
}
```

---

## §4 Business Logic & Calculations

### 4.1 NOI (Net Operating Income)
```
Gross Rental Income = SUM(annual_rent) for all active contracts per building
Operating Expenses  = SUM(cost_entries) per building per period
NOI per building    = Gross Rental Income − Operating Expenses
Portfolio NOI       = SUM(all building NOIs)
NOI per m²          = Building NOI / totalRentableM2
NOI margin          = (NOI / Gross Rental Income) × 100%
Cost per m²         = Operating Expenses / totalRentableM2
Cost per m² by cat  = Category cost / totalRentableM2
```

### 4.2 WAULT (Weighted Average Unexpired Lease Term)
```
Remaining term (years)  = (endDate − today) / 365.25
WAULT                   = Σ(remaining_term × annual_rent) / Σ(annual_rent)
Effective WAULT         = Same formula using break_clause_date instead of end_date
WAULT per building      = Same formula, scoped to building contracts

Expiry Profile (Y+1 to Y+5):
  Per year: SUM(annual_rent expiring that year) / total_annual_rent × 100%

Income at Risk (12mo):
  SUM(annual_rent) for contracts where endDate < today + 365 days
```

### 4.3 Vacancy Cost
```
Vacant area per building  = totalRentableM2 − committedM2
Vacancy cost per building = vacant_area × marketRentPerM2
Portfolio vacancy cost    = SUM(all building vacancy costs)
Vacancy rate              = vacant_area / totalRentableM2
```

### 4.4 Yield / Cap Rate
```
NIY (Net Initial Yield) = NOI / estimatedMarketValue × 100%
Gross Yield             = Gross Rental Income / estimatedMarketValue × 100%
```

### 4.5 Occupancy
```
Utleiegrad (occupancy)  = committedM2 / totalRentableM2 × 100%
  where committedM2     = SUM(contract.areaM2) for active contracts
  and totalRentableM2   = SUM(areaUnit.areaM2) where classification = 'ekslusivt'
```

### 4.6 Contract Status Logic
```typescript
function getContractStatus(contract: Contract): ContractStatus {
  const today = new Date();
  const end = new Date(contract.endDate);
  const start = new Date(contract.startDate);
  const daysToExpiry = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (today < start) return 'future';
  if (today > end) return 'expired';
  if (daysToExpiry < 365) return 'expiring_soon';
  return 'active';
}
```

### 4.7 NOI Aggregation by Persona
The UI is identical for all personas. Aggregation level differs:
- **Owner**: default drill-down is per building
- **Investor**: default drill-down is per portfolio / entity (group of buildings)
- **Manager**: default drill-down is per client company

This is controlled by a `viewMode` context: `'building' | 'portfolio' | 'client'`.

---

## §5 UI Components Specification

### 5.1 Top Navigation
```
[Exio Logo] [Dashboard] [Rapporter] [Bygg] [Avtaler] [Produkter] [Aktører]    [Kundebase: VAXA GROUP AS ▾] [User]
```
- Sticky, 68px height, blur backdrop
- Active link: champagne underline
- Entity switcher (Kundebase) at top-right: switches between portfolios/entities

### 5.2 Module Tabs (Below Nav)
```
OVERSIKT
[Portefølje]  [Økonomi 🔒]  [Energi]
```
- Active tab: filled with slight champagne tint
- Locked tabs show padlock icon
- Horizontal pill-style below the OVERSIKT label

### 5.3 Building Filter
```
BYGNINGER
[Alle bygninger ▾]
```
- Dropdown that filters all dashboard content
- Default: "Alle bygninger"
- Options: each building by name

### 5.4 Time Period Selector
```
TIDSPERIODE
[Denne måneden] [Forrige måned] [Siste 6 måneder] [Neste 6 måneder] [Dette året] [Forrige år] [Neste år] [Egendefinert]
```
- Pill/chip buttons, single-select
- Active: champagne border (1px solid #FED092)
- Drives startDate/endDate for all calculations
- "Egendefinert" opens date range picker

### 5.5 KPI Cards (Dashboard)
6 cards in a 3-column grid:

| Card | Value | Supporting Detail |
|------|-------|-------------------|
| Total NOI | `XX XXX XXX kr` | Monthly bar chart (leieinntekter, felleskostnader, fremtidige inntekter) |
| Utleiegrad | `XX,XX%` | "av totalt ekslusivt areal/m²" + Top 3 høyeste / Top 3 laveste |
| WAULT | `X,XX år` | Lengst / Kortest kontraktslengde per building |
| Ledighetskostnad | `XX XXX XXX kr` | Ranked building list by cost |
| Antall bygg | `XX` | Simple count |
| Total m² | `XX XXX m²` | Sum all buildings |

Each card has:
- Info icon (ⓘ) → hover tooltip: formula + live values + data source + link to drill-down
- Click on building names → navigates to building detail

### 5.6 Building Detail Page Tabs
```
Sammendrag | Arealer | Avtaler | Leietakere | Eiere | Forvalter | Energi | Økonomi
```
- Active tab: champagne underline
- **Sammendrag**: area KPI cards (TOTALT, LEDIG, UTLEID, FELLESAREAL) + building info (type, energy, standard, year)
- **Arealer**: area unit tree/table
- **Avtaler**: contract table with status badges
- **Leietakere**: tenant list (from contracts)
- **Eiere**: ownership info (PlacePoint + BRREG)
- **Forvalter**: property manager info
- **Energi**: energy label, future EOS integration placeholder
- **Økonomi** (NEW): NOI, cost structure, budget vs. actual, yield per building

### 5.7 Edit Modal Pattern
```
┌─ Rediger bygning ──────────── ✕ ─┐
│ BYGNINGSADRESSE        [Rediger] │
│ Address with map pin             │
│                                  │
│ EIENDOMSINFORMASJON              │
│ Navn: [___________________]      │
│ Type: [Kontor            ▾]      │
│ Energimerking: [B        ▾]      │
│ Standard: [Medium        ▾]      │
│                                  │
│              [Lagre]  [Lukk]     │
└──────────────────────────────────┘
```
- Dark background modal
- Form fields: slightly lighter bg (#2a2a2a)
- All PlacePoint/BRREG fields editable
- Lagre (save) + Lukk (close) buttons

### 5.8 Building Comparison Views
**View 1 — Deep graphical** (2–4 buildings):
- Side-by-side KPI cards: NOI, Vacancy, WAULT, Cost/m²
- Charts per building for visual comparison

**View 2 — Table** (many buildings):
- Rows = buildings, Columns = KPIs
- Sortable by any column
- Quick overview for large portfolios

### 5.9 Cost Entry (Spreadsheet-like)
```
                 Jan     Feb     Mar     Apr  ...  Des     Total
Drift          [____]  [____]  [____]  [____] ... [____]  =SUM
Vedlikehold    [____]  [____]  [____]  [____] ... [____]  =SUM
Forsikring     [____]  [____]  [____]  [____] ... [____]  =SUM
Administrasjon [____]  [____]  [____]  [____] ... [____]  =SUM
Eiendomsskatt  [____]  [____]  [____]  [____] ... [____]  =SUM
[+ Legg til]
──────────────────────────────────────────────────────────
TOTAL          =SUM    =SUM    =SUM    =SUM   ... =SUM    =SUM
```
- Inline editing (click cell to edit)
- Paste from Excel supported
- Auto-annualization
- `[+ Legg til]` adds custom cost category

### 5.10 Alerts & Notifications
- **Dashboard**: contracts expiring <12mo highlighted in red/warning in expiry section
- **In-app notification**: badge on bell icon
- **Email option**: toggle in settings (UI only in prototype — no actual email)

### 5.11 Empty State (First-time User)
Welcome wizard flow:
1. "Velkommen til Exio Portfolio" → Legg til selskap (enter org.nr.)
2. BRREG enrichment → confirm company
3. Legg til første bygg (enter address) → PlacePoint enrichment
4. Legg til kontrakter
5. Dashboard populated

Alternative: "Utforsk med eksempeldata" button loads demo portfolio.

### 5.12 Calculation Transparency (Hover Tooltips)
Every KPI value has an info icon. On hover:
```
┌───────────────────────────────────────────────┐
│ NOI per bygg                                  │
│ Formel: Leieinntekter − Driftskostnader       │
│ Verdier: 4 200 000 − 1 350 000 = 2 850 000   │
│ Kilde: 12 aktive kontrakter + manuell kost    │
│ [→ Se detaljer]                               │
└───────────────────────────────────────────────┘
```

---

## §6 External Data Sources (Mock in Prototype)

### 6.1 BRREG Enhetsregisteret
- **Real endpoint**: `GET https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr}`
- **In prototype**: mock JSON response in `/src/data/brreg/`
- **Fields used**: organisasjonsnummer, navn, organisasjonsform.kode, forretningsadresse, naeringskode1.kode, konkurs, underAvvikling, erIKonsern, stiftelsesdato, antallAnsatte, kapital.belop
- **Triggered**: on company registration + tenant org.nr. lookup
- **Bankruptcy flag**: maximum visibility — red warning banner on tenant card + red badge next to name everywhere + highlighted contracts in WAULT/expiry views

### 6.2 PlacePoint Customer API
- **Real endpoint**: `https://customer-api-docs.placepoint.no/` (API key required)
- **In prototype**: mock JSON response in `/src/data/placepoint/`
- **Fields used**: building type, year built, floors, area structure (bruksenheter), energy label (A–G), ownership (hjemmelshaver), plot area, coordinates, price statistics per m²
- **Triggered**: on building address/matrikkel entry
- **Ownership mismatch**: warning banner if PlacePoint owner ≠ BRREG company
- **Price stats**: shown as reference input below market rent field: grey italic "PlacePoint referanse: X kr/m²"
- **Disclaimer**: "Markedsreferanse basert på offentlige data (PlacePoint/SSB). Ikke finansiell rådgivning."

### 6.3 SSB (Statistics Norway)
- KPI (consumer price index) used for rent adjustment
- **In prototype**: mock — hardcoded recent CPI values
- Pattern: system suggests SSB value, user confirms/overrides

### 6.4 ERP (Mock)
- Generic format (not brand-specific)
- Simulates financial data import to demonstrate future capability
- `/src/data/erp-mock/` with sample cost/revenue data

---

## §7 Demo Data Specification

### 7.1 Company
```json
{
  "id": "c-001",
  "orgNr": "987654321",
  "name": "Fjordvest Eiendom AS",
  "address": { "street": "Strandgaten 45", "postalCode": "5013", "municipality": "Bergen", "country": "Norway" },
  "orgForm": "AS",
  "naceCode": "68.209",
  "isBankrupt": false,
  "isWindingUp": false,
  "isPartOfGroup": false
}
```

### 7.2 Buildings (8–12, mixed types)
Include at minimum:
- 2 high-performing office buildings (Oslo) — high occupancy, long WAULT
- 1 retail building (Bergen) — medium performance
- 1 warehouse/logistics (Stavanger) — average
- 1 mixed-use (Oslo) — average
- 2 underperforming buildings — high vacancy (>15%), short WAULT
- 1 building with contract expiring in 3 months — triggers warning

Real Norwegian addresses. Mix of energy labels (A–G). Different sizes (500 m² to 15 000 m²).

### 7.3 Contracts
- 20–40 contracts across all buildings
- Fictional but realistic tenant names: "Nordisk Kontor AS", "Bergen Logistikk AS", "Fjord Tech AS", etc.
- Mix of statuses: active, expiring_soon (2–3), future (1), expired (1–2)
- Annual rents: range from 200 000 to 5 000 000 NOK
- Contract lengths: 1–10 years
- 1–2 tenants with bankruptcy flag = true

### 7.4 Costs
- 12 months of data per building
- 5 standard categories + 1 custom
- Realistic Norwegian CRE cost levels:
  - Drift: 150–400 kr/m²/year
  - Vedlikehold: 50–200 kr/m²/year
  - Forsikring: 20–50 kr/m²/year
  - Administrasjon: 50–150 kr/m²/year
  - Eiendomsskatt: 30–80 kr/m²/year

---

## §8 Norwegian UI Labels

### 8.1 Navigation & Structure
| English | Norwegian |
|---------|-----------|
| Dashboard | Dashboard |
| Reports | Rapporter |
| Buildings | Bygg |
| Contracts | Avtaler |
| Products | Produkter |
| Actors / Entities | Aktører |
| Portfolio | Portefølje |
| Overview | Oversikt |
| All buildings | Alle bygninger |
| Time period | Tidsperiode |

### 8.2 KPIs & Metrics
| English | Norwegian |
|---------|-----------|
| Net Operating Income | NOI (Netto driftsinntekt) |
| Occupancy rate | Utleiegrad |
| Vacancy rate | Ledighetsgrad |
| Vacancy cost | Ledighetskostnad |
| WAULT | WAULT (Vektet gj.snittlig kontraktslengde) |
| Yield / Cap Rate | Yield / Avkastning |
| Cost per m² | Kostnad per m² |
| Rental income | Leieinntekter |
| Operating expenses | Driftskostnader |
| Common costs | Felleskostnader |
| Future income | Fremtidige inntekter |
| Budget vs. actual | Budsjett vs. faktisk |
| Income at risk | Inntekt i risiko |
| Contract expiry | Kontraktsutløp |
| Building count | Antall bygg |

### 8.3 Building & Area
| English | Norwegian |
|---------|-----------|
| Building | Bygning / Bygg |
| Area unit | Areal / Arealenhet |
| Exclusive area (rentable) | Ekslusivt areal |
| Common area | Fellesareal |
| Parking | Parkering |
| Total area | Totalt areal |
| Leased | Utleid |
| Vacant | Ledig |
| Building type | Bygningstype |
| Energy label | Energimerking |
| Year built | Konstruksjonsår |
| Standard | Standard |
| Market rent | Markedsleie |

### 8.4 Actions & UI
| English | Norwegian |
|---------|-----------|
| Edit | Rediger |
| Save | Lagre |
| Close | Lukk |
| Delete | Slett |
| Back | Tilbake |
| View | Visning |
| Add | Legg til |
| Search | Søk |
| Export | Eksporter |
| This month | Denne måneden |
| Previous month | Forrige måned |
| Last 6 months | Siste 6 måneder |
| Next 6 months | Neste 6 måneder |
| This year | Dette året |
| Previous year | Forrige år |
| Next year | Neste år |
| Custom | Egendefinert |

### 8.5 Contract & Tenant
| English | Norwegian |
|---------|-----------|
| Tenant | Leietaker |
| Contract / Agreement | Avtale |
| Annual rent | Årlig leie |
| Start date | Startdato |
| End date | Sluttdato |
| Break clause | Oppsigelsesklausul |
| Renewal option | Fornyelsesopsjon |
| Active | Aktiv |
| Expiring soon | Utløper snart |
| Expired | Utløpt |
| Bankruptcy | Konkurs |
| Contract length | Kontraktslengde |
| Remaining term | Gjenstående tid |

### 8.6 Reports & Alerts
| English | Norwegian |
|---------|-----------|
| Board report | Styrerapport |
| Bank report | Bankrapport |
| PDF export | PDF-eksport |
| Share dashboard | Del dashboard |
| Notification | Varsel |
| Warning | Advarsel |
| Contracts expiring | Kontrakter som utløper |
| Total in period | Totalt i perioden |
| First period | Første periode |

---

## §9 Routing (Suggested)

```typescript
const routes = {
  '/':                          'Dashboard (portfolio overview)',
  '/bygg':                      'Building list',
  '/bygg/:buildingId':          'Building detail (Sammendrag tab)',
  '/bygg/:buildingId/arealer':  'Building areas tab',
  '/bygg/:buildingId/avtaler':  'Building contracts tab',
  '/bygg/:buildingId/okonomi':  'Building financials tab (NEW)',
  '/rapporter':                 'Reports overview',
  '/rapporter/styrerapport':    'Board report view',
  '/sammenlign':                'Building comparison view',
  '/innstillinger':             'Settings (alerts, notifications)',
};
```

---

## §10 Implementation Priorities

Build in this order:
1. **Project scaffolding**: Vite + React + TypeScript + design tokens CSS
2. **Data layer**: JSON files + TypeScript types + context providers
3. **Layout shell**: TopNav, Sidebar tree, Breadcrumb, EntitySwitcher
4. **Dashboard**: Module tabs + Building filter + Period selector + 6 KPI cards
5. **Building detail**: Tabs + Sammendrag with area cards + building info
6. **Contracts & WAULT**: Contract table + WAULT widget + expiry chart
7. **NOI & Costs**: Cost spreadsheet entry + NOI calculation + cost per m² ranking
8. **Vacancy**: Vacancy cost dashboard + ranking chart
9. **Comparison views**: Deep graphical (2–4) + table (many buildings)
10. **Reports**: Board report template + PDF export
11. **Polish**: Empty states, tooltips, alerts, welcome wizard
