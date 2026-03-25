# Exio Portfolio — Claude Code Session Context

> Load this file at the start of every session. For detailed specs, see `PORTFOLIO_SPEC.md`.

## What This Is
Exio Portfolio is a new module for the Exio Næring platform (Norwegian commercial real estate SaaS).
This prototype is a **standalone React app** that visually matches the existing Exio dark UI but has no dependency on the production codebase. All data is local JSON/mock.

## Tech Stack
- **React 18** with Vite
- **TypeScript** (strict)
- **State**: React Context + useState (no Redux)
- **Charts**: ApexCharts or Nivo
- **Styling**: CSS custom properties from Exio design system (see `PORTFOLIO_SPEC.md` §2)
- **No backend** — all data in `/src/data/*.json`
- **No auth** — open access demo
- **Desktop only** — no mobile responsiveness

## Design System (Quick Reference)
Dark UI everywhere. Key tokens:
- App bg: `#1a1a1a` | Surface: `#1e1e1e` / `#222` | Raised: `#2a2a2a`
- Text: `#e8e8e8` | Muted: `#9a9a9a` | Dim: `#7a7a7a`
- **Champagne accent**: `#FED092` (active tabs, selections)
- **Cyan accent**: `#22d4e8` (data viz, progress bars)
- Green: `#4ade80` (positive/utleid) | Red: `#f87171` (negative/ledig/warnings)
- Font: Inter 400–900 | Border radius: 8px | Transitions: 0.25s ease
- Negative values: red text with minus prefix (−1 234 567)
- Number format: Norwegian (1 234 567,89)

## Data Hierarchy
```
Company (org.nr.) → Portfolio → Building → AreaUnit (ekslusivt/felles/parkering)
                                              ↑
                                    Contract (links to building + area type + m²)
                                              ↑
                                    Tenant (property of contract, not a tree level)
```

## Navigation Pattern
1. **Top nav**: Dashboard, Rapporter, Bygg, Avtaler, Produkter, Aktører
2. **Left sidebar**: collapsible building tree (Building → Gruppe → AreaUnits by floor)
3. **Breadcrumb**: BYGG / BYGNING
4. **Entity switcher**: top-right dropdown (like "Kundebase: VAXA GROUP AS")

## Dashboard Pattern
1. **Module tabs**: Portefølje (active) | Økonomi | Energi
2. **Building filter**: "BYGNINGER" dropdown → "Alle bygninger" default
3. **Time period pills**: Denne måneden | Forrige måned | Siste 6 måneder | Neste 6 måneder | **Dette året** | Forrige år | Neste år | Egendefinert
4. **KPI cards**: 3-column grid, 6 cards total
5. **Charts**: click = drill-down to building detail page

## 6 Dashboard KPI Cards
1. **Total NOI** — large number + trend bar chart (Leieinntekter, Felleskostnader, Fremtidige inntekter)
2. **Utleiegrad (%)** — percentage + Top 3 høyeste / Top 3 laveste buildings
3. **WAULT** — years + Lengst / Kortest per building
4. **Ledighetskostnad (NOK)** — total + ranked building list
5. **Antall bygg** — count
6. **Total m²** — sum of all building areas

## Building Detail Page
**Tabs**: Sammendrag | Arealer | Avtaler | Leietakere | Eiere | Forvalter | Energi | **Økonomi** (new)
**Modes**: Visning (read) → Rediger (modal overlay with Lagre/Lukk)
**Area cards**: TOTALT m² | LEDIG ekslusivt | UTLEID ekslusivt | FELLESAREAL TOTALT

## Key Business Logic
See `PORTFOLIO_SPEC.md` §4 for all formulas. Quick reference:
- **NOI** = Gross rental income − Operating expenses
- **WAULT** = Σ(remaining_term × annual_rent) / Σ(annual_rent)
- **Effective WAULT** = same formula but using break_clause_date instead of end_date
- **Vacancy cost** = vacant_m2 × market_rent_per_m2
- **Utleiegrad** = committed_m2 / total_rentable_m2
- **Yield** = NOI / market_value

## Demo Data
- 8–12 buildings, mixed types (kontor, lager, handel, bolig)
- Real Norwegian addresses (Oslo, Bergen, Stavanger)
- Fictional but realistic tenant names ("Nordisk Kontor AS")
- Scenario: 2 high-performing, 3 average, 2 high vacancy, 1 contract expiring in 3 months
- Walkthrough time target: 20–30 minutes

## Language
Norwegian (Bokmål) only. All labels, KPIs, and UI text in Norwegian.

## File Structure Target
```
exio-portfolio/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── context/           # PortfolioContext, FilterContext
│   ├── types/             # TypeScript interfaces (see PORTFOLIO_SPEC.md §3)
│   ├── data/              # JSON mock data files
│   │   ├── companies.json
│   │   ├── portfolios.json
│   │   ├── buildings.json
│   │   ├── areaUnits.json
│   │   ├── contracts.json
│   │   ├── costs.json
│   │   └── marketData.json
│   ├── hooks/             # usePortfolio, useKPI, useWAULT, etc.
│   ├── utils/             # formatters, calculators, date helpers
│   ├── components/
│   │   ├── layout/        # TopNav, Sidebar, Breadcrumb, EntitySwitcher
│   │   ├── dashboard/     # KPICard, PeriodSelector, BuildingFilter, ModuleTabs
│   │   ├── building/      # BuildingDetail, BuildingTabs, AreaCards, EditModal
│   │   ├── contracts/     # ContractTable, WAULTWidget, ExpiryChart
│   │   ├── financial/     # NOIChart, CostTable, BudgetVsActual, YieldCard
│   │   ├── vacancy/       # VacancyCostChart, VacancyRanking
│   │   ├── reports/       # BoardReport, PDFExport, ComparisonTable
│   │   └── shared/        # Tooltip, Badge, StatusIndicator, EmptyState
│   └── styles/
│       ├── tokens.css     # Design system variables
│       └── global.css     # Base styles
├── PORTFOLIO_SPEC.md      # Full specification
└── PORTFOLIO_CLAUDE.md    # This file
```

## When Building, Always:
1. Use TypeScript strict mode — all interfaces from `PORTFOLIO_SPEC.md` §3
2. Norwegian labels for all UI text — see §5 for translation table
3. Format numbers with Norwegian locale (space as thousand separator, comma as decimal)
4. Every KPI must have a hover tooltip showing: formula + live values + data source
5. Dark UI everywhere — no light backgrounds
6. Champagne (#FED092) for active states only — never as background fill
7. Charts use cyan (#22d4e8) as primary data color
8. Match the period selector pill pattern from the current app exactly
