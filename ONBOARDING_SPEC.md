# Exio Portfolio — Onboarding Specification

> Use this document to brief a new Claude chat session on the onboarding feature.
> The prototype is live at exio-portfolio-v2.vercel.app
> Code repo: github.com/olero-afk/Exio_Portfolio

---

## Context

Exio Portfolio is a Norwegian B2B SaaS for commercial real estate portfolio management. The prototype is built with React + Vite + TypeScript, dark UI, deployed on Vercel. It has a working dashboard with AI-powered insight cards, report pages, building detail with cost spreadsheet, and a persona switcher (Eier/Investor/Forvalter).

The existing "welcome wizard" is a placeholder. We need to replace it with a proper onboarding flow that uses real API enrichment from BRREG and PlacePoint to auto-populate 70-80% of portfolio data.

---

## Core Principle: Roles Are Detected, Not Selected

The user does NOT choose "I am an owner / investor / manager." The system figures it out per building based on data:

### Detection Logic

**Step 1:** User enters their org.nr. → BRREG returns company data including konsern (group) membership.

**Per building discovered via PlacePoint:**
- **Hjemmelshaver (Owner)** = PlacePoint ownership data for each building
- Compare hjemmelshaver org.nr. against:
  - User's org.nr. directly → **user = Eier** of this building
  - User's konsern structure (parent/child entities in BRREG) → **user = Investor** (holding/fund owns the SPV that owns the building)
  - No match at all → **user = Forvalter** (managing on behalf of someone else)

**Per building, three roles are assigned:**

| Role | Detection Method | Fallback |
|------|-----------------|----------|
| **Eier** (hjemmelshaver) | PlacePoint ownership data — always known | Already the registered owner |
| **Investor** | BRREG konsern: is user's company the parent of hjemmelshaver? | Set manually if konsern data is inconclusive |
| **Forvalter** | User's org.nr. ≠ hjemmelshaver AND not in same konsern | Set manually |

A single user can have ALL THREE roles across different buildings. The persona switcher in the dashboard becomes dynamic based on the actual role distribution.

---

## Onboarding Flow: 6 Steps (Same Process for All Users)

### Step 1: Selskap (Company Registration)
- User enters org.nr.
- BRREG API returns: company name, address, org.form, NACE code, konsern membership, bankruptcy status
- System stores the company and its konsern structure
- User confirms/edits company name, uploads logo (optional)
- Mock in prototype: simulate BRREG response with realistic delay

### Step 2: Team & Tilganger (Team & Permissions)
- Add team members by email
- Assign roles: Admin (full access, can edit) or Bruker (view only)
- Can be skipped for single-user setup (show "Hopp over" link)

### Step 3: Bygg (Building Discovery)
- User searches by address, matrikkel number, or org.nr.
- PlacePoint returns building list with: address, type, m², floors, year built, energy label, hjemmelshaver
- Buildings presented as a checklist — user ticks which buildings to import
- Alternative: CSV/Excel import → BRREG + PlacePoint enrichment per row
- "[+ Legg til manuelt]" for buildings not found in PlacePoint

For each discovered building, system auto-detects the user's role:
- Shows tag: "Eier" (green) / "Investor" (cyan) / "Forvalter" (champagne) based on detection logic
- User can override the auto-detected role

### Step 4: Roller per Bygg (Role Assignment Review)
- Table view: all imported buildings × role columns
- Columns: Bygg, Adresse, Type, m², Hjemmelshaver, Din rolle, Investor, Forvalter
- "Din rolle" pre-filled by detection logic, editable dropdown per row
- Investor column: if detected via konsern, shows SPV/fund name. If not detected, shows dropdown to set manually.
- Forvalter column: if user is forvalter, shows "Du". If building has a different forvalter, user can set the management company.
- Fund/portfolio assignment: if user has investor role on any buildings, show fund grouping options

### Step 5: Gjennomgang (Review & Approve)
- Summary card: company name, building count, role distribution
- Buildings grouped by role: "Eid av deg (X bygg)" / "Investert i (Y bygg)" / "Forvalter for (Z bygg)"
- Warnings: missing energy labels, ownership mismatches, no contracts yet
- "Godkjenn og start →" button

### Step 6: Ferdig (Transition to App)
- Success screen: "Porteføljen er klar"
- Stats: X buildings registered, Y% data auto-populated
- Checklist of manual enrichment tasks (these happen INSIDE the app, not in the wizard):
  1. Rediger arealstruktur per bygg (area types, m²)
  2. Legg til leietakere og kontrakter
  3. Legg til driftskostnader
  4. Sett markedsleie per bygg
- Each item links to the relevant building detail tab
- "Gå til Dashboard →" button

---

## Technical Implementation

### Route
`/onboarding` — full-screen wizard, no sidebar, no top nav tabs. Just the Exio logo + step indicator.

### State
OnboardingContext that tracks:
```typescript
interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  company: Company | null;
  konsernEntities: Company[];      // Related entities from BRREG konsern
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
  hjemmelshaver: {
    orgNr: string;
    name: string;
  };
  source: 'placepoint' | 'manual' | 'csv';
}

interface BuildingRoleAssignment {
  buildingId: string;
  detectedRole: 'eier' | 'investor' | 'forvalter';
  confirmedRole: 'eier' | 'investor' | 'forvalter';
  investorEntity?: string;         // SPV/fund name if investor
  forvalterEntity?: string;        // Management company if forvalter
  fundAssignment?: string;         // Which fund this building belongs to
}
```

### Mock API Responses
- BRREG: mock JSON in `/src/data/brreg/` — company data + konsern structure
- PlacePoint: mock JSON in `/src/data/placepoint/` — building list per org.nr. lookup
- Simulate 1-2 second delay to feel realistic

### After Onboarding
When wizard completes:
- Buildings are created in PortfolioContext with PlacePoint-enriched data
- Role assignments drive the persona experience: if user is Eier of 5 buildings and Forvalter of 3, the persona switcher shows both roles
- User lands on Dashboard (/) with their portfolio populated
- Manual enrichment tasks (area structure, contracts, costs) happen in the normal app views

---

## UI Design

- Full-screen wizard: dark background (#1a1a1a), centered content card (max-width 800px)
- Step indicator at top: numbered circles with champagne active state, connecting lines
- Progress feel: "Steg X av Y"
- BRREG/PlacePoint results: appear with a subtle loading animation (simulating API call), then slide in
- Building checklist: dark surface cards with tick-boxes, building info inline
- Role tags: colored badges (green=Eier, cyan=Investor, champagne=Forvalter)
- Buttons: "Tilbake" (outline) + "Neste steg →" (primary, champagne accent)
- "Hopp over" link for optional steps (muted, underlined)

---

## Connection to Existing Features

- The persona switcher in TopNav should eventually reflect actual roles from onboarding (for now, keep the demo toggle but note this connection)
- Building detail pages already support all the manual enrichment tasks (area structure, contracts on Avtaler tab, costs on Økonomi tab)
- The existing welcome wizard at / should be replaced — route to /onboarding when no portfolio data exists
- After onboarding, the dashboard loads with the onboarded portfolio data

---

## What Exists in the Prototype Already

- ✅ BRREG mock data structure (companies.json)
- ✅ PlacePoint mock data structure (buildings.json with PlacePoint fields)
- ✅ Building detail pages with all tabs (Sammendrag, Arealer, Avtaler, etc.)
- ✅ Cost spreadsheet on Økonomi tab
- ✅ Persona switcher (currently hardcoded demo toggle — will become data-driven)
- ✅ Welcome wizard (placeholder — to be replaced by this onboarding flow)
- ❌ Onboarding route and wizard components
- ❌ Role detection logic
- ❌ Konsern structure mock data
- ❌ Building discovery search interface
- ❌ Per-building role assignment UI

---

## Files to Upload to the New Chat Project

Upload these files as project knowledge:
1. `PORTFOLIO_CLAUDE.md` (session context — already in project)
2. `PORTFOLIO_SPEC.md` (full spec — already in project)
3. `PORTFOLIO_SPEC_UPDATE.md` (dashboard redesign — already in project)
4. `ONBOARDING_SPEC.md` (this file)
5. `Onboarding_flow.png` (Figma sketch — already in project)

## First Prompt for the New Chat

```
I'm building the onboarding flow for Exio Portfolio. Read ONBOARDING_SPEC.md for the full specification.

The prototype is a React + Vite + TypeScript app. The code is in the exio-portfolio project. Read PORTFOLIO_CLAUDE.md for session context and PORTFOLIO_SPEC.md for the full technical spec.

Build the onboarding in a new feature branch. Start with:
git checkout -b feat/onboarding

Then build the 6-step wizard following ONBOARDING_SPEC.md exactly.
```
