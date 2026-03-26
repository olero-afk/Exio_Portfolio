# PORTFOLIO_SPEC.md — Dashboard Update (v2.1)

> This addendum replaces §5.5 (KPI Cards) and adds §5.5a (Three-Level Dashboard Hierarchy) in PORTFOLIO_SPEC.md.
> All other sections remain unchanged. Merge this into the main spec file.

---

## §5.5 REPLACED: Three-Level Dashboard Hierarchy

The dashboard is **portfolio-first, not building-first**. A fund CFO managing multiple funds and billions in assets starts with capital performance, not individual buildings.

### Level 1 — Portfolio Overview (Route: `/`)

This is the landing page. Everything is aggregated across the entire portfolio. No individual building data visible — only portfolio-level metrics.

**Controls (top of page):**
- Module tabs: Portefølje (active) | Økonomi (locked) | Energi
- Fund filter: "FOND" dropdown → "Hele porteføljen" default, or select a specific fund/sub-portfolio
- Time period pills: same 8 options as current app (Denne måneden through Egendefinert)

**Widget Grid (10 widgets, responsive 2–3 column layout):**

#### Widget 1: Porteføljeverdier (Portfolio Value)
```
PORTEFØLJEVERDIER
┌─────────────────────────────────┐
│ Total verdi                     │
│ 2 450 000 000 kr                │
│ ↑ 3,2% vs. forrige periode     │
│                                 │
│ Fond I (Core):    1 800 000 000 │
│ Fond II (VA):       650 000 000 │
└─────────────────────────────────┘
```
- Sum of estimatedMarketValue across all buildings
- Breakdown per fund/sub-portfolio
- Trend vs. previous period

#### Widget 2: Total NOI & NOI-yield
```
TOTAL NOI
┌─────────────────────────────────┐
│ 142 500 000 kr                  │
│ NOI-yield: 5,8%                 │
│ ┌─────────────────────────┐     │
│ │ ▓▓▓ Monthly bar chart   │     │
│ │ (cyan=income, red=cost) │     │
│ └─────────────────────────┘     │
│ Margin: 68,4%                   │
└─────────────────────────────────┘
```
- NOI = total rental income − total operating costs (portfolio-wide)
- NOI-yield = NOI / total portfolio value × 100%
- Monthly trend bar chart (Leieinntekter, Driftskostnader, Netto)
- NOI margin = NOI / rental income × 100%

#### Widget 3: Kontantstrømoversikt (Cash Flow)
```
KONTANTSTRØM
┌─────────────────────────────────┐
│ Leieinntekter:   208 000 000 kr │
│ Driftskostnader: −65 500 000 kr │
│ Netto:           142 500 000 kr │
│ ┌─────────────────────────┐     │
│ │ Monthly stacked bar     │     │
│ │ In vs Out vs Net        │     │
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```
- Monthly cash flow: income in, costs out, net
- Stacked/grouped bar chart showing cash predictability
- Forward-looking: include contracted future income

#### Widget 4: WAULT Portefølje
```
WAULT
┌─────────────────────────────────┐
│ 6,97 år                        │
│ Effektiv WAULT: 5,24 år        │
│                                 │
│ Inntekt i risiko (12 mnd):     │
│ 18 400 000 kr  (8,8% av total) │
└─────────────────────────────────┘
```
- Single portfolio-level WAULT number
- Effective WAULT (using break clauses)
- Income at risk: sum of rent from contracts expiring within 12 months
- Risk shown as both NOK and % of total portfolio rent

#### Widget 5: Utleiegrad Portefølje (Occupancy)
```
UTLEIEGRAD
┌─────────────────────────────────┐
│ 87,3%                           │
│ av totalt ekslusivt areal       │
│ ↑ 1,2% vs. forrige periode     │
│                                 │
│ ████████████░░░  87,3%          │
│ (progress bar, cyan fill)       │
└─────────────────────────────────┘
```
- Single aggregated percentage: total committed m² / total rentable m²
- Trend arrow vs. previous period
- Visual progress bar

#### Widget 6: Ledighetskostnad Portefølje (Vacancy Cost)
```
LEDIGHETSKOSTNAD
┌─────────────────────────────────┐
│ 12 800 000 kr                   │
│ ↓ Redusert 4,1% vs. forrige    │
│                                 │
│ Antall bygg >10% ledig: 3      │
│ Total ledig m²: 4 200           │
└─────────────────────────────────┘
```
- Total vacancy cost across portfolio (vacant m² × market rent)
- Trend vs. previous period
- Count of buildings with >10% vacancy
- Total vacant m²

#### Widget 7: Diversifisering (Portfolio Composition)
```
DIVERSIFISERING
┌─────────────────────────────────┐
│ Geografi      Segment     Bransje│
│ ┌──────┐    ┌──────┐    ┌──────┐│
│ │Donut │    │Donut │    │Donut ││
│ │Oslo  │    │Kontor│    │Tech  ││
│ │Bergen│    │Lager │    │Helse ││
│ │Stav. │    │Handel│    │Finans││
│ └──────┘    └──────┘    └──────┘│
└─────────────────────────────────┘
```
- Three donut/pie charts side by side:
  - By geography (city/region) — based on building addresses
  - By asset type (kontor, lager, handel, etc.) — based on building types
  - By tenant industry — based on tenant NACE codes from BRREG
- Weighted by annual rent (not count)
- Answers "am I too concentrated?"

#### Widget 8: Top 10 Leietakere (Tenant Concentration)
```
TOP 10 LEIETAKERE
┌─────────────────────────────────┐
│ 1. Nordisk Kontor AS   22,4%   │
│    ████████████████████░  12,2M │
│ 2. Bergen Logistikk AS 14,1%   │
│    ████████████░░░░░░░░   7,6M │
│ 3. Fjord Tech AS       11,8%   │
│    ██████████░░░░░░░░░░   6,4M │
│ ...                             │
│ Topp 10 dekker: 78,3% av total │
└─────────────────────────────────┘
```
- Ranked by annual rent
- Shows % of total portfolio rent per tenant
- Horizontal bar for visual weight
- Summary: "Top 10 covers X% of total" — highlights concentration risk
- Bankruptcy flag (red badge) on affected tenants

#### Widget 9: Kontraktsutløpsprofil (Contract Expiry Profile)
```
KONTRAKTSUTLØPSPROFIL
┌─────────────────────────────────┐
│ Stacked bar chart               │
│                                 │
│   Y+1    Y+2    Y+3    Y+4  Y+5│
│  ┌───┐  ┌───┐  ┌───┐  ┌──┐ ┌─┐│
│  │RED│  │   │  │   │  │  │ │ ││
│  │18%│  │12%│  │22%│  │9%│ │7││
│  └───┘  └───┘  └───┘  └──┘ └─┘│
│                                 │
│ Y+1 = 18,4M kr (8,8% av total) │
└─────────────────────────────────┘
```
- Stacked bar chart Y+1 through Y+5
- Y+1 colored RED (warning — immediate risk)
- Each bar shows: NOK amount + % of total portfolio rent
- Portfolio level (not per building)

#### Widget 10: Covenant-status (Roadmap)
```
COVENANT-STATUS
┌─────────────────────────────────┐
│  ┌──────────┐  ┌──────────────┐ │
│  │ LTV      │  │ DSCR         │ │
│  │ Kommer   │  │ Kommer       │ │
│  │ [Roadmap]│  │ [Roadmap]    │ │
│  └──────────┘  └──────────────┘ │
│                                 │
│ Planlagt Q4 2026                │
└─────────────────────────────────┘
```
- Placeholder cards for LTV and DSCR
- "Roadmap" badge in champagne
- Shows where the product is heading
- Not functional in prototype — signals future value

---

### Level 2 — Fund / Sub-portfolio View (Route: `/fond/:fondId`)

Same 10 widgets, but scoped to the selected fund. Accessed by:
- Clicking a fund name in Widget 1 (Porteføljeverdier)
- Selecting a fund in the Fund filter dropdown
- Clicking a fund in the sidebar tree

**Additional at this level:**
- Building list table at the bottom: all buildings in this fund with key KPIs per row
- Click building row → navigates to Level 3

### Level 3 — Building Detail (Route: `/bygg/:buildingId`)

Same as currently specified:
- 8 tabs: Sammendrag, Arealer, Avtaler, Leietakere, Eiere, Forvalter, Energi, Økonomi
- Building-specific KPIs, area cards, contract table, cost entry
- This is the asset manager's view

---

## §3 Additions: New TypeScript Interfaces

Add these to the existing types:

```typescript
interface Fund {
  id: string;
  portfolioId: string;
  name: string;                  // e.g., "Fond I — Core" or "Fond II — Value-Add"
  strategy: 'core' | 'core_plus' | 'value_add' | 'opportunistic';
  buildingIds: string[];
  targetReturn?: number;         // Target IRR %
  vintage?: number;              // Fund vintage year
}

interface TenantConcentration {
  tenantName: string;
  tenantOrgNr?: string;
  totalAnnualRent: number;
  percentOfPortfolio: number;    // tenant rent / total portfolio rent × 100
  buildingCount: number;         // how many buildings this tenant is in
  isBankrupt: boolean;
}

interface CashFlowPeriod {
  year: number;
  month: number;
  rentalIncome: number;
  operatingCosts: number;
  netCashFlow: number;           // rentalIncome - operatingCosts
}

interface ExpiryProfileYear {
  year: number;                  // Y+1, Y+2, etc.
  expiringRent: number;          // NOK
  percentOfTotal: number;        // % of total portfolio rent
  contractCount: number;
}

interface DiversificationSlice {
  label: string;                 // "Oslo", "Kontor", "Teknologi"
  value: number;                 // Annual rent in this slice
  percent: number;               // % of total
}

interface PortfolioDiversification {
  byGeography: DiversificationSlice[];
  byAssetType: DiversificationSlice[];
  byTenantIndustry: DiversificationSlice[];
}
```

---

## §4 Additions: New Calculations

```
Portfolio Value        = SUM(building.estimatedMarketValue) for all buildings
NOI-yield              = Portfolio NOI / Portfolio Value × 100%
NOI margin             = Portfolio NOI / Total Rental Income × 100%

Cash Flow (monthly)    = SUM(contract.annualRent / 12) for active contracts in month
                       − SUM(cost_entries) for that month

Tenant Concentration   = tenant_total_annual_rent / portfolio_total_annual_rent × 100%

Diversification (geo)  = SUM(annual_rent) per building.address.municipality
                       / total_annual_rent × 100%

Diversification (type) = SUM(annual_rent) per building.buildingType
                       / total_annual_rent × 100%

Expiry Profile (Y+N)   = SUM(annual_rent) where contract.endDate falls in year N
                       / total_annual_rent × 100%

Income at Risk         = SUM(annual_rent) for contracts expiring within 365 days
```

---

## §8 Additions: New Norwegian Labels

| English | Norwegian |
|---------|-----------|
| Portfolio value | Porteføljeverdier |
| Total value | Total verdi |
| Cash flow | Kontantstrøm |
| Cash flow overview | Kontantstrømoversikt |
| Rental income | Leieinntekter |
| Operating costs | Driftskostnader |
| Net | Netto |
| NOI-yield | NOI-yield |
| Margin | Margin |
| Income at risk | Inntekt i risiko |
| Diversification | Diversifisering |
| Geography | Geografi |
| Segment | Segment |
| Industry | Bransje |
| Top 10 tenants | Top 10 leietakere |
| covers X% of total | dekker X% av total |
| Contract expiry profile | Kontraktsutløpsprofil |
| Covenant status | Covenant-status |
| Roadmap | Kommer |
| Entire portfolio | Hele porteføljen |
| Fund | Fond |
| Core | Core |
| Value-add | Value-add |
| Concentration risk | Konsentrasjonsrisiko |
| Reduced | Redusert |
| vs. previous period | vs. forrige periode |
| Buildings with >10% vacancy | Bygg med >10% ledighet |

---

## §9 Updated: Routes

```typescript
const routes = {
  '/':                          'Portfolio Overview (Level 1 — all funds)',
  '/fond/:fondId':              'Fund View (Level 2 — single fund)',
  '/bygg':                      'Building list (all buildings, table view)',
  '/bygg/:buildingId':          'Building detail (Level 3)',
  '/bygg/:buildingId/arealer':  'Building areas tab',
  '/bygg/:buildingId/avtaler':  'Building contracts tab',
  '/bygg/:buildingId/okonomi':  'Building financials tab',
  '/rapporter':                 'Reports overview',
  '/rapporter/styrerapport':    'Board report view',
  '/sammenlign':                'Building comparison view',
};
```

---

## §10 Updated: Implementation Priority

Rebuild the dashboard in this order:
1. **Add Fund type + mock data** — 2 funds (Core + Value-Add), split buildings between them
2. **Portfolio Overview page** — 10 widgets, all aggregated at portfolio level
3. **Fund filter** — dropdown that scopes all widgets to selected fund
4. **Fund View page** — same widgets scoped + building list table
5. **Wire drill-down** — Portfolio → Fund → Building navigation
6. **Diversification charts** — 3 donut charts (geography, type, industry)
7. **Tenant concentration** — Top 10 ranked list with bars
8. **Expiry profile** — Stacked bar Y+1–Y+5 at portfolio level
9. **Cash flow chart** — Monthly income/cost/net bar chart
10. **Covenant placeholder** — Roadmap badge cards

---

## Demo Data Updates

Add to mock data:
```json
// funds.json
[
  {
    "id": "f-001",
    "portfolioId": "p-001",
    "name": "Fond I — Core",
    "strategy": "core",
    "buildingIds": ["b-001", "b-002", "b-003", "b-005", "b-008"],
    "targetReturn": 7.5,
    "vintage": 2022
  },
  {
    "id": "f-002",
    "portfolioId": "p-001",
    "name": "Fond II — Value-Add",
    "strategy": "value_add",
    "buildingIds": ["b-004", "b-006", "b-007"],
    "targetReturn": 12.0,
    "vintage": 2024
  }
]
```

Update contracts to create one dominant tenant ("Nordisk Kontor AS") with ~20% of total rent for concentration risk visibility.
