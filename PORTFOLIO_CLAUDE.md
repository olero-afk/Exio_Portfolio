# Exio Portfolio — Claude Code Session Context (v2)

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
Company (org.nr.) → Portfolio/Fund → Sub-portfolio → Building → AreaUnit
                                                        ↑
                                              Contract (building + area type + m²)
                                                        ↑
                                              Tenant (property of contract)
```

## CRITICAL: Three-Level Dashboard Hierarchy
The dashboard is **portfolio-first, not building-first**. A fund CFO thinks in portfolios and capital, not individual buildings.

### Level 1 — Portfolio Overview (Landing Page `/`)
The first thing the user sees. Aggregated across the entire portfolio. No individual buildings visible.

**10 Portfolio-Level Widgets:**
1. **Porteføljeverdier** — Total portfolio value (sum of market values), change vs. period, value per fund
2. **Total NOI & NOI-yield** — Portfolio-level NOI, yield against portfolio value, trend chart
3. **Kontantstrømoversikt** — Cash flow: rental in, costs out, net. Monthly bar chart
4. **WAULT portefølje** — Single portfolio-level number + income-at-risk (12mo)
5. **Utleiegrad portefølje** — One aggregated % with trend arrow
6. **Ledighetskostnad portefølje** — Total vacancy cost NOK with trend
7. **Diversifisering** — Donut charts: by geography, asset type, tenant industry
8. **Top 10 leietakere** — Ranked by annual rent, shows concentration risk
9. **Kontraktsutløpsprofil** — Stacked bar Y+1 to Y+5 at portfolio level
10. **Covenant-status** — LTV/DSCR placeholder (roadmap badge)

### Level 2 — Fund / Sub-portfolio Drill-down (`/fond/:fondId`)
Clicking a fund/sub-portfolio shows that fund's metrics. Same widgets scoped to fund. Enables cross-fund comparison.

### Level 3 — Building Detail (`/bygg/:buildingId`)
Only reached by clicking a specific building. Asset manager level. Building-specific KPIs, contracts, costs, area structure.

## Navigation Pattern
1. **Top nav**: Dashboard, Rapporter, Bygg, Avtaler, Produkter, Aktører
2. **Left sidebar**: Portfolio tree (Portfolio → Fund/Sub-portfolio → Buildings)
3. **Breadcrumb**: PORTEFØLJE / FOND / BYGNING
4. **Entity switcher**: top-right dropdown (portfolio/fund selector)

## Dashboard Controls (same pattern as current app)
1. **Module tabs**: Portefølje (active) | Økonomi | Energi
2. **Fund filter**: dropdown to select fund/sub-portfolio or "Hele porteføljen"
3. **Time period pills**: Denne måneden | Forrige måned | Siste 6 måneder | Neste 6 måneder | **Dette året** | Forrige år | Neste år | Egendefinert
4. **Charts**: click = drill-down to next level (portfolio → fund → building)

## Building Detail Page
**Tabs**: Sammendrag | Arealer | Avtaler | Leietakere | Eiere | Forvalter | Energi | **Økonomi** (new)
**Modes**: Visning (read) → Rediger (modal overlay with Lagre/Lukk)
**Area cards**: TOTALT m² | LEDIG ekslusivt | UTLEID ekslusivt | FELLESAREAL TOTALT

## Key Business Logic
See `PORTFOLIO_SPEC.md` §4 for all formulas. Quick reference:
- **NOI** = Gross rental income − Operating expenses
- **NOI-yield** = NOI / portfolio_market_value × 100%
- **WAULT** = Σ(remaining_term × annual_rent) / Σ(annual_rent)
- **Effective WAULT** = same formula but using break_clause_date instead of end_date
- **Vacancy cost** = vacant_m2 × market_rent_per_m2
- **Utleiegrad** = committed_m2 / total_rentable_m2
- **Yield per building** = NOI / market_value
- **Income at risk** = SUM(annual_rent) for contracts expiring within 12mo
- **Tenant concentration** = tenant_annual_rent / total_portfolio_rent × 100%

## Demo Data
- 1 company, 1 portfolio, 2 sub-portfolios (Fond I: core, Fond II: value-add)
- 8–12 buildings split across sub-portfolios, mixed types
- Real Norwegian addresses (Oslo, Bergen, Stavanger)
- Fictional but realistic tenant names
- Scenario: 2 high-performing, 3 average, 2 high vacancy, 1 expiring in 3 months
- Top tenant = ~20% concentration risk

## Language
Norwegian (Bokmål) only. All labels, KPIs, and UI text in Norwegian.

## File Structure Target
```
exio-portfolio/
├── src/
│   ├── components/
│   │   ├── layout/        # TopNav, Sidebar, Breadcrumb, EntitySwitcher
│   │   ├── dashboard/     # PortfolioOverview, FundView, KPICard, PeriodSelector
│   │   │   ├── widgets/   # NOIWidget, WAULTWidget, DiversificationChart, TenantRanking,
│   │   │   │              # CashFlowChart, VacancyWidget, ExpiryProfile, CovenantStatus
│   │   │   └── controls/  # ModuleTabs, FundFilter, PeriodSelector
│   │   ├── building/      # BuildingDetail, BuildingTabs, AreaCards, EditModal
│   │   ├── contracts/     # ContractTable, WAULTWidget, ExpiryChart
│   │   ├── financial/     # NOIChart, CostTable, BudgetVsActual, YieldCard
│   │   ├── vacancy/       # VacancyCostChart, VacancyRanking
│   │   ├── reports/       # BoardReport, PDFExport, ComparisonTable
│   │   └── shared/        # Tooltip, Badge, StatusIndicator, EmptyState
│   ├── context/           # PortfolioContext, FilterContext
│   ├── types/             # TypeScript interfaces
│   ├── data/              # JSON mock data (companies, portfolios, funds, buildings, etc.)
│   ├── hooks/             # usePortfolio, useKPI, useWAULT, useCashFlow, etc.
│   ├── utils/             # formatters, calculators, date helpers
│   └── styles/            # tokens.css, global.css
├── PORTFOLIO_SPEC.md
└── PORTFOLIO_CLAUDE.md
```

## When Building, Always:
1. Use TypeScript strict mode — all interfaces from `PORTFOLIO_SPEC.md` §3
2. **Portfolio-first**: dashboard shows portfolio aggregates, NOT building lists
3. Norwegian labels for all UI text — see §8 for translation table
4. Format numbers with Norwegian locale (space as thousand separator, comma as decimal)
5. Every KPI must have a hover tooltip showing: formula + live values + data source
6. Dark UI everywhere — no light backgrounds
7. Champagne (#FED092) for active states only — never as background fill
8. Charts use cyan (#22d4e8) as primary data color
9. Match the period selector pill pattern from the current app exactly
10. Drill-down direction: Portfolio → Fund → Building (never skip levels)
