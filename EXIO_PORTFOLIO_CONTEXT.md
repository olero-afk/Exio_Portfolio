# Exio Portfolio — Full Project Context for Claude Code

> **Purpose:** Upload this file to your VS Code project root (or Claude Code project knowledge) to give Claude full context on the Exio Portfolio module. This consolidates all specs, data sources, API details, onboarding flow, design system, and business logic into one document.
>
> **Last updated:** March 2026
> **Prototype:** exio-portfolio-v2.vercel.app
> **Repo:** github.com/olero-afk/Exio_Portfolio

---

## 1. Product Overview

**Exio Næring** is a Norwegian B2B SaaS platform for commercial real estate management.
Modules: contracts (kontraktsforvaltning), portfolio (portefølje), energy (energi).
Users: property owners, investors, and managers of commercial real estate (næringseiendom).
Language: Norwegian (Bokmål). Domain: exio.no / app.exio.cloud.

**Exio Portfolio** is a new module targeting CFO/CEO-level personas. It provides a portfolio-first financial and operational cockpit — distinct from the existing building-centric contract management app.

### Scope: MVP
- 4 core reports: Portfolio Overview, NOI Summary, WAULT & Contract Expiry, Vacancy Cost
- NO ERP integration — all financial data is manual or Excel import
- 2 automated external data sources: BRREG + PlacePoint
- Desktop only — no mobile responsiveness

---

## 2. Three Personas

| Dimension | Persona 1: Eier (Building Owner) | Persona 2: Investor | Persona 3: Forvalter (Asset Manager) |
|-----------|----------------------------------|---------------------|--------------------------------------|
| Title | CFO, CEO, Styreleder, Eier | CFO, CEO, CIO, Partner | CFO, CEO, Daglig leder |
| Org type | Single company owns buildings directly | Investment company, fund, or holding with SPVs | Third-party property management firm |
| Portfolio relationship | Owns and often operates own portfolio | Owns through entities; focused on returns | Manages on behalf of clients/owners |
| Typical size | 1–15 buildings | 5–50+ buildings across entities | 10–100+ buildings across multiple clients |
| Primary KPI focus | NOI, occupancy rate, cost per m² | Yield, WAULT, IRR, LTV | NOI per client, vacancy cost, report efficiency |
| Key reporting audience | Own board/styre, bank | Investors/LPs, bank, board | Multiple owners/clients, own board |
| Biggest time waste | Board report prep (4–6 hrs) | Consolidating data across entities | Producing separate reports per client |

### Role Detection Logic (roles are detected, NOT selected)

**Step 1:** User enters org.nr. → BRREG returns company data including konsern (group) membership.

**Per building discovered via PlacePoint:**
- Hjemmelshaver (owner) org.nr. = User's org.nr. directly → **Eier**
- Hjemmelshaver org.nr. is a child entity in user's konsern → **Investor**
- No match → **Forvalter**

A single user can have ALL THREE roles across different buildings. The persona switcher becomes dynamic based on actual role distribution.

---

## 3. Tech Stack

- **React 18** with Vite
- **TypeScript** (strict)
- **State**: React Context + useState (no Redux)
- **Charts**: ApexCharts or Nivo
- **Styling**: CSS custom properties from Exio design system
- **AI**: Anthropic API (claude-sonnet-4-20250514) — in-app AI dialogue + insight cards
- **No backend** — all data in `/src/data/*.json`
- **No auth** — open access demo
- **Deployment**: Vercel (multiple URLs for A/B comparison)

---

## 4. Data Hierarchy

```
Company (org.nr.) → Portfolio → Building → AreaUnit (ekslusivt/felles/parkering)
                                              ↑
                                    Contract (links to building + area type + m²)
                                              ↑
                                    Tenant (property of contract, not a tree level)
```

### Three-Level Navigation
Portfolio Overview → Fund/Sub-portfolio → Building Detail

---

## 5. Data Sources

### 5.1 BRREG Enhetsregisteret API

Free, real-time lookup of Norwegian business entities. No authentication required. NLOD licensed.

**Endpoint:** `GET https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr}`

| API Field | Returns | EXIO Use |
|-----------|---------|----------|
| organisasjonsnummer | 9-digit unique ID | Primary key for property-owning entity |
| navn | Legal company name | Auto-populated on registration |
| organisasjonsform.kode | AS, ANS, ENK, etc. | Identifies entity type |
| forretningsadresse | Street, postal code, municipality | Can default as building address |
| naeringskode1.kode | NACE industry code | Filters for CRE-relevant entities (68.x) |
| stiftelsesdato | Date of incorporation | Company age / context |
| antallAnsatte | Employee count (if >4) | Context for asset managers |
| konkurs / underAvvikling | Bankruptcy / winding-up flag | Risk signal on tenant or owner |
| erIKonsern | Part of a corporate group | Ownership structure context |
| kapital.belop | Share capital amount | Entity financial profile |

**EXIO use:** Owner lookup on building registration + tenant lookup on contract creation.

### 5.2 PlacePoint Customer API

PlacePoint aggregates Norwegian property data from the Matrikkelen (national cadastre), company/shareholder registries, energy labels, price statistics, and demographic data into a single API.

**API docs:** https://customer-api-docs.placepoint.no/ (JS-rendered, requires login for full spec)
**Auth:** API key (commercial license, per-customer agreement)
**Lookup keys:** Matrikkel number (KNR-GNR/BNR/FNR/SNR), address, or building number

| Data Category | Fields Available | EXIO Portfolio Value |
|---------------|-----------------|---------------------|
| **Building data (Matrikkel)** | Building number, building type, building status, year built, number of floors, building footprint area | Auto-populates building register fields |
| **Area / bruksenheter** | Dwelling units (bruksenheter), usage type per unit, area per unit from Matrikkelen | Seeds area structure — reduces manual entry significantly |
| **Energy label (Energimerke)** | Energy rating (A–G) and heating grade from Enova/NVE | Context on building card; future EOS module |
| **Ownership / hjemmelshaver** | Registered owner from grunnbok, linked to org.nr. or person | Auto-links building to owning entity; cross-refs with BRREG |
| **Property boundaries** | Cadastral boundaries (teig), plot area from Matrikkelen-Eiendomskart | Site area for yield-per-m² calculations |
| **Price statistics** | Transaction prices, price per m² by area/municipality, historical trends | Market rent benchmark for vacancy cost |
| **Demographics & area data** | Population, income levels, growth forecasts by grunnkrets/municipality | Future: location scoring for investment decisions |
| **Zoning / regulation** | Zoning plan status, permitted use, municipal case documents | Risk context: regulation/rezoning |
| **Address data** | Full address with coordinates, municipality, postal code | Geocoding for map view and address validation |

**Note:** Exact API field names and response schemas must be confirmed against the live API documentation during integration.

### 5.3 Data Flow Summary

| Data Category | Source | Method | Detail |
|---------------|--------|--------|--------|
| Company master data | BRREG API | Auto on org.nr. | Name, address, org.form, NACE, status, capital |
| Tenant master data | BRREG API | Optional org.nr. | Name, bankruptcy flag, group membership |
| Building type & year | PlacePoint API | Auto on matrikkel/address | Building code, year built, floors, status |
| Area structure | PlacePoint API | Auto on matrikkel/address | Bruksenheter, usage type, area per unit |
| Energy label | PlacePoint API | Auto on matrikkel/address | A–G rating, heating grade |
| Ownership | PlacePoint API | Auto on matrikkel/address | Hjemmelshaver, cross-ref BRREG |
| Plot area & boundaries | PlacePoint API | Auto on matrikkel/address | Cadastral teig, coordinates |
| Price statistics | PlacePoint API | Auto on location | Price/m², trends — market rent suggestion |
| Building name | Manual input | User entry | Custom property name |
| Lease contracts | Manual input | User / Excel import | Rent, dates, tenant, building link |
| Operating costs | Manual input | User / Excel import | Per building, period, category |
| Market rent (final) | Manual input | User confirms/edits | PlacePoint suggests, user decides |

---

## 6. Onboarding Flow: 6 Steps

### Step 1: Selskap (Company Registration)
- User enters org.nr. → BRREG API returns company data + konsern structure
- User confirms/edits company name, uploads logo (optional)
- Mock: simulate BRREG response with 1–2s delay

### Step 2: Team & Tilganger (Team & Permissions)
- Add team members by email → Admin (full access) or Bruker (view only)
- Skippable for single-user setup ("Hopp over" link)

### Step 3: Bygg (Building Discovery)
- Search by address, matrikkel number, or org.nr.
- PlacePoint returns building list: address, type, m², floors, year built, energy label, hjemmelshaver
- Buildings as checklist — user ticks which to import
- Auto-detects role per building: "Eier" (green) / "Investor" (cyan) / "Forvalter" (champagne)
- Alternative: CSV/Excel import → BRREG + PlacePoint enrichment per row
- "[+ Legg til manuelt]" for buildings not found

### Step 4: Roller per Bygg (Role Assignment Review)
- Table: Bygg, Adresse, Type, m², Hjemmelshaver, Din rolle, Investor, Forvalter
- "Din rolle" pre-filled by detection logic, editable dropdown per row
- Fund/portfolio assignment if investor role on any buildings

### Step 5: Gjennomgang (Review & Approve)
- Summary: company name, building count, role distribution
- Buildings grouped by role: "Eid av deg" / "Investert i" / "Forvalter for"
- Warnings: missing energy labels, ownership mismatches, no contracts
- "Godkjenn og start →" button

### Step 6: Ferdig (Transition to App)
- Success screen: "Porteføljen er klar"
- Checklist of manual enrichment tasks (happen inside the app):
  1. Rediger arealstruktur per bygg
  2. Legg til leietakere og kontrakter
  3. Legg til driftskostnader
  4. Sett markedsleie per bygg
- "Gå til Dashboard →" button

### Onboarding State Interface
```typescript
interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  company: Company | null;
  konsernEntities: Company[];
  teamMembers: TeamMember[];
  discoveredBuildings: DiscoveredBuilding[];
  selectedBuildingIds: string[];
  buildingRoles: BuildingRoleAssignment[];
  isComplete: boolean;
}

interface TeamMember {
  email: string;
  role: 'admin' | 'bruker';
  status: 'invited' | 'active';
}

interface DiscoveredBuilding {
  id: string;
  address: Address;
  buildingType: AssetClass;
  yearBuilt: number | null;
  floors: number | null;
  areaM2: number | null;
  energyLabel: EnergyLabel | null;
  hjemmelshaver: { orgNr: string; name: string; };
  source: 'placepoint' | 'manual' | 'csv';
}

interface BuildingRoleAssignment {
  buildingId: string;
  detectedRole: 'eier' | 'investor' | 'forvalter';
  confirmedRole: 'eier' | 'investor' | 'forvalter';
  investorEntity?: string;
  forvalterEntity?: string;
  fundAssignment?: string;
}
```

---

## 7. Four MVP Reports

### Report 1: Portfolio Overview & Building Register
The entry point. Shows complete portfolio with key identifiers, area, and status per building.

**Calculations:**
- Total lettable area = Sum of area units per building (from PlacePoint, editable)
- Occupancy rate = Leased area ÷ Total lettable area
- Vacancy rate = 1 − Occupancy rate
- Portfolio totals = Aggregated sums across all buildings

### Report 2: NOI Summary per Building & Portfolio
Core CFO metric. Rental income from contracts, operating costs entered manually.

**Calculations:**
- Gross rental income = Sum of annual rent from active contracts
- NOI = Gross rental income − Operating expenses
- NOI per m² = Building NOI ÷ Total lettable area
- NOI margin = (NOI ÷ Gross rental income) × 100%
- Cost per m² = Operating expenses ÷ Total lettable area

**Cost categories:** Drift, vedlikehold, forsikring, admin, eiendomsskatt

### Report 3: WAULT & Contract Expiry Profile
The first thing banks ask about. Zero ERP dependency — runs entirely on contract data.

**Calculations:**
- Remaining term = Contract end date − Today (years, decimal)
- WAULT = Σ(remaining_term × annual_rent) / Σ(annual_rent)
- Effective WAULT = Same but using break_clause_date
- Expiry profile Y+1–Y+5 = % of annual rent expiring per year
- Income at risk (12mo) = Sum of rent for contracts expiring within 12 months

### Report 4: Vacancy Cost Dashboard
Transforms vacancy from passive % to active cost in NOK.

**Calculations:**
- Vacant area = Total lettable area − Leased area
- Vacancy cost = Vacant area × Market rent per m² (annualized)
- Portfolio vacancy cost = Sum of all building vacancy costs
- Market rent default suggested by PlacePoint price stats, user overrides

---

## 8. Dashboard Design

### Navigation Pattern
1. **Top nav**: Dashboard, Rapporter, Bygg, Avtaler, Produkter, Aktører
2. **Left sidebar**: collapsible building tree (only on Portefølje/Bygg tab routes)
3. **Persona switcher**: top-right (Eier / Investor / Forvalter)
4. **Breadcrumb**: BYGG / BYGNING

### AI Cockpit Dashboard (No-Scroll)
Three zones:
1. **Spør Exio AI** — chat dialogue box
2. **Filters + Context Bar** — building filter, time period pills
3. **6 AI Insight Cards** — "airport departure board" style

### 6 Dashboard KPI Cards
1. **Total NOI** — large number + trend bar chart
2. **Utleiegrad (%)** — percentage + Top 3 highest/lowest buildings
3. **WAULT** — years + longest/shortest per building
4. **Ledighetskostnad (NOK)** — total + ranked building list
5. **Muligheter** — opportunity summary with NOK badges
6. **Risiko** — risk summary with bullet points

### Time Period Pills
Denne måneden | Forrige måned | Siste 6 måneder | Neste 6 måneder | **Dette året** | Forrige år | Neste år | Egendefinert

### Building Detail Page
**Tabs:** Sammendrag | Arealer | Avtaler | Leietakere | Eiere | Forvalter | Energi | Økonomi
**Modes:** Visning (read) → Rediger (modal overlay with Lagre/Lukk)
**Area cards:** TOTALT m² | LEDIG ekslusivt | UTLEID ekslusivt | FELLESAREAL TOTALT

### Report Pages (under /rapporter)
Porteføljeoversikt, Kontraktsanalyse, Leietakeranalyse, Ledighetsoversikt, Diversifisering, Styrerapport, Covenant-status, Markedsreferanse/PlacePoint

---

## 9. Design System (Quick Reference)

### Dark UI Palette (App)
| Name | Value | Usage |
|------|-------|-------|
| App bg | `#1a1a1a` | Outermost container |
| Surface | `#1e1e1e` / `#222` | Cards, panels, metric cards |
| Raised | `#2a2a2a` | Inputs, selects, toggles |
| Tab bar | `#1e1a14` | Tab strip (warm undertone) |
| Text primary | `#e8e8e8` | Values, headings |
| Text secondary | `#c8c8c8` | Table cells |
| Text muted | `#9a9a9a` | Labels |
| Text dim | `#7a7a7a` | Uppercase labels |
| Border | `rgba(255,255,255,0.06)` | Card borders |
| **Champagne** | `#FED092` | Active tabs, pill active state |
| **Cyan** | `#22d4e8` | Data viz, progress bars, inner tabs |
| Green | `#4ade80` | Positive delta, "Utleid" status |
| Red | `#f87171` | Negative, warnings, "Ledig" status |

### Typography
- **Headlines**: DM Serif Display (400–700)
- **UI/Body**: Inter (400–900)
- Metric values: `2rem`, weight 800
- Eyebrow labels: `0.75rem`, weight 700, uppercase, +0.12em tracking

### Key Rules
- Dark UI everywhere — no light backgrounds in the app
- Champagne (`#FED092`) for active states only — never as background fill
- Cyan (`#22d4e8`) as primary data color in charts
- Norwegian number format: `1 234 567,89` (space as thousands, comma as decimal)
- Negative values: red text with minus prefix (−1 234 567)
- Norwegian (Bokmål) only for all labels and UI text
- Border radius: 8px standard, 16px for large cards
- Transitions: 0.25s ease

### Onboarding UI
- Full-screen wizard: dark bg (#1a1a1a), centered card (max-width 800px)
- Step indicator: numbered circles, champagne active state, connecting lines
- Role tags: green=Eier, cyan=Investor, champagne=Forvalter
- Buttons: "Tilbake" (outline) + "Neste steg →" (primary, champagne accent)

---

## 10. Key Business Decisions (from questionnaires)

### Confirmed Answers
- **Prototype scope**: MVP + basic onboarding flow (BRREG + PlacePoint)
- **API approach**: Switchable: mock for demo, real for dev
- **Primary purpose**: Customer-facing sales demo
- **Deployable**: Yes, to Vercel URL
- **Sample buildings**: 8–12 (realistic small portfolio)
- **Frontend**: React with Vite
- **Design**: Use exact tokens from DESIGN.md and style.css
- **Backend**: No backend — all data in JSON/JS files
- **State**: React Context / useState (simple)

### Open Items / Clarifications
- **Tenant hierarchy**: Tenant is BOTH a standalone entity (with BRREG data) AND linked to contracts on area units
- **Cost entry**: Bulk entry via spreadsheet-like table UI (inline editing, paste from Excel)
- **Contract-to-area linking**: Contracts reference building + area type (e.g. 'kontor') + m². System tracks total m² and total rentable area (eksklusive arealer) to calculate % committed
- **KPI rent adjustment**: System suggests SSB KPI value, user confirms/overrides
- **Building detail tabs**: Copy from current Exio contract management solution
- **Navigation**: Sidebar + top breadcrumb for drill-down
- **Client BRREG enrichment**: Yes — full BRREG enrichment for every client company (Forvalter persona)
- **Ownership mismatch**: Allow registration but flag building with visible discrepancy indicator
- **Area types**: 7 types: Kontor, Lager, Handel/Retail, Bolig, Parkering, Servering, Annet
- **Mock ERP**: Not in MVP scope

---

## 11. Implementation Priority

1. **BRREG integration** — single REST call per org.nr. No auth. Hours to implement.
2. **PlacePoint integration** — API key required. Biggest lever for reducing onboarding friction.
3. **Building register + onboarding flow** — BRREG + PlacePoint enrichment on every registration.
4. **Contract data model + WAULT engine** — zero external dependency, highest bank/investor value.
5. **NOI calculation layer** — requires cost entry UI. Area denominator from PlacePoint.
6. **Vacancy cost** — lightweight addition. Market rent suggestion from PlacePoint.

---

## 12. File Structure

```
exio-portfolio/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── EXIO_PORTFOLIO_CONTEXT.md    ← This file
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── context/                 # PortfolioContext, FilterContext, OnboardingContext
│   ├── types/                   # TypeScript interfaces
│   ├── data/                    # JSON mock data
│   │   ├── companies.json
│   │   ├── portfolios.json
│   │   ├── buildings.json
│   │   ├── areaUnits.json
│   │   ├── contracts.json
│   │   ├── costs.json
│   │   ├── marketData.json
│   │   ├── brreg/               # Mock BRREG responses
│   │   └── placepoint/          # Mock PlacePoint responses
│   ├── hooks/                   # usePortfolio, useKPI, useWAULT, etc.
│   ├── utils/                   # formatters, calculators, date helpers
│   ├── components/
│   │   ├── layout/              # TopNav, Sidebar, Breadcrumb, EntitySwitcher
│   │   ├── dashboard/           # KPICard, PeriodSelector, BuildingFilter, ModuleTabs
│   │   ├── building/            # BuildingDetail, BuildingTabs, AreaCards, EditModal
│   │   ├── contracts/           # ContractTable, WAULTWidget, ExpiryChart
│   │   ├── financial/           # NOIChart, CostTable, BudgetVsActual, YieldCard
│   │   ├── vacancy/             # VacancyCostChart, VacancyRanking
│   │   ├── reports/             # BoardReport, PDFExport, ComparisonTable
│   │   ├── onboarding/          # Wizard steps 1–6
│   │   └── shared/              # Tooltip, Badge, StatusIndicator, EmptyState
│   └── styles/
│       ├── tokens.css           # Design system variables
│       └── global.css           # Base styles
```

---

## 13. When Building, Always:

1. Use TypeScript strict mode — all interfaces properly typed
2. Norwegian labels for all UI text
3. Format numbers with Norwegian locale (space thousands, comma decimal)
4. Every KPI must have a hover tooltip: formula + live values + data source
5. Dark UI everywhere — no light backgrounds
6. Champagne (#FED092) for active states only
7. Charts use cyan (#22d4e8) as primary data color
8. Match the period selector pill pattern exactly
9. Mock API calls with 1–2 second simulated delay
10. Buildings discovered via PlacePoint should auto-detect user role (Eier/Investor/Forvalter)

---

## 14. Existing Exio Production API (Renturio)

The existing Exio platform has a production API (swagger.json in project). Key entities in the current system:
- Activities, Agreement parties, Agreements (contracts), Contacts, Invoices
- Spaces (buildings/areas with hierarchical parent/child structure)
- Space types: CommonArea, ParkingSpot, RentableSpace, Building, Group
- Asset classes, Standard types, Operational cost prices
- Persons, Organizations

The Portfolio module is a NEW standalone prototype — it does not depend on the production API but should align data models where possible for future integration.

---

## 15. Demo Data Requirements

- 8–12 buildings, mixed types (kontor, lager, handel, bolig)
- Real Norwegian addresses (Oslo, Bergen, Stavanger)
- Fictional but realistic tenant names ("Nordisk Kontor AS")
- Scenario: 2 high-performing, 3 average, 2 high vacancy, 1 contract expiring in 3 months
- 2 funds for investor persona grouping
- 33 contracts across buildings
- Walkthrough time target: 20–30 minutes
