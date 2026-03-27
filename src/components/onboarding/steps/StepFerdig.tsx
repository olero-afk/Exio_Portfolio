import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../context/OnboardingContext.tsx';
import { usePortfolioContext, type Kundebase } from '../../../context/PortfolioContext.tsx';
import { OnboardingLayout } from '../OnboardingLayout.tsx';
import type { Building, AreaUnit, Fund, Company, Portfolio } from '../../../types/index.ts';
import type { PlacePointBuilding } from '../../../data/placepoint/buildings.ts';
import './Steps.css';

function mapBuildingType(beskrivelse: string): Building['buildingType'] {
  const map: Record<string, Building['buildingType']> = {
    'Kontorbygg': 'Kontor',
    'Lagerbygg': 'LogistikkLager',
    'Butikkbygning': 'Handel',
  };
  return map[beskrivelse] ?? 'Kombinasjon';
}

function mapEnergyLabel(karakter: string | null): Building['energyLabel'] {
  if (!karakter) return null;
  const valid = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  return valid.includes(karakter) ? (karakter as Building['energyLabel']) : null;
}

export function StepFerdig() {
  const navigate = useNavigate();
  const {
    companyDisplayName,
    company,
    discoveredBuildings,
    selectedBuildingIds,
    buildingRoles,
    completeOnboarding,
  } = useOnboarding();
  const { addKundebase } = usePortfolioContext();

  const selectedBuildings = discoveredBuildings.filter((b) =>
    selectedBuildingIds.includes(b.id),
  );

  const totalArea = selectedBuildings.reduce((s, b) => s + (b.bruksareal ?? 0), 0);

  function handleGoToDashboard() {
    const newCompany: Company = {
      id: 'c-onb',
      orgNr: company?.organisasjonsnummer ?? '',
      name: companyDisplayName,
      address: {
        street: company?.forretningsadresse.adresse[0] ?? '',
        postalCode: company?.forretningsadresse.postnummer ?? '',
        municipality: company?.forretningsadresse.kommune ?? '',
        country: 'Norge',
      },
      orgForm: company?.organisasjonsform.kode ?? 'AS',
      naceCode: company?.naeringskode1.kode ?? '',
      incorporationDate: company?.stiftelsesdato ?? '',
      employeeCount: company?.antallAnsatte ?? null,
      isBankrupt: false,
      isWindingUp: false,
      isPartOfGroup: company?.erIKonsern ?? false,
      shareCapital: null,
      source: 'brreg',
    };

    const newPortfolio: Portfolio = {
      id: 'p-onb',
      companyId: 'c-onb',
      name: 'Hovedportefølje',
      description: `Portefølje for ${companyDisplayName}`,
      createdAt: new Date().toISOString(),
    };

    const coreBuildingIds: string[] = [];
    const vaBuildingIds: string[] = [];
    const allBuildings: Building[] = [];
    const allAreaUnits: AreaUnit[] = [];

    selectedBuildings.forEach((ppb: PlacePointBuilding, idx: number) => {
      const buildingId = `b-onb-${idx + 1}`;
      const role = buildingRoles.find((r) => r.buildingId === ppb.id);
      const fundAssignment = role?.fundAssignment;

      if (fundAssignment === 'fund-va') {
        vaBuildingIds.push(buildingId);
      } else {
        coreBuildingIds.push(buildingId);
      }

      const rentableUnits = ppb.bruksenheter.filter((u) => u.bruksformaal !== 'Fellesareal');
      const commonUnits = ppb.bruksenheter.filter((u) => u.bruksformaal === 'Fellesareal');
      const totalRentable = rentableUnits.reduce((s, u) => s + u.bruksareal, 0);
      const totalCommon = commonUnits.reduce((s, u) => s + u.bruksareal, 0);

      const building: Building = {
        id: buildingId,
        portfolioId: 'p-onb',
        name: ppb.adresse.adressetekst,
        address: {
          street: ppb.adresse.adressetekst,
          postalCode: ppb.adresse.postnummer,
          municipality: ppb.adresse.kommunenavn,
          country: 'Norge',
        },
        coordinates: { lat: ppb.adresse.koordinater.lat, lng: ppb.adresse.koordinater.lon },
        matrikkelNr: `${ppb.matrikkelNummer.kommunenummer}-${ppb.matrikkelNummer.gaardsnummer}/${ppb.matrikkelNummer.bruksnummer}`,
        buildingType: mapBuildingType(ppb.bygningstype.beskrivelse),
        yearBuilt: ppb.byggeaar,
        numberOfFloors: ppb.antallEtasjer,
        energyLabel: mapEnergyLabel(ppb.energimerke?.karakter ?? null),
        plotAreaM2: ppb.tomteareal,
        ownerName: ppb.hjemmelshaver.navn,
        ownershipMismatch: false,
        priceStatsPerM2: ppb.prisstatistikk?.prisPerKvm ?? null,
        marketRentPerM2: ppb.prisstatistikk?.prisPerKvm ?? (ppb.bygningstype.beskrivelse === 'Lagerbygg' ? 1100 : 2400),
        purchasePrice: null,
        estimatedMarketValue: (ppb.bruksareal ?? 0) * (ppb.prisstatistikk?.prisPerKvm ?? 40000),
        acquisitionDate: null,
        totalAreaM2: ppb.bruksareal ?? 0,
        totalRentableM2: totalRentable,
        totalCommonAreaM2: totalCommon,
        committedM2: 0,
        occupancyRate: 0,
        vacancyRate: 1,
        standard: null,
        isArchived: false,
        source: 'placepoint',
      };
      allBuildings.push(building);

      ppb.bruksenheter.forEach((unit, ui) => {
        const classification = unit.bruksformaal === 'Fellesareal'
          ? 'fellesareal' as const
          : 'ekslusivt' as const;
        allAreaUnits.push({
          id: `au-onb-${buildingId}-${ui}`,
          buildingId,
          name: `${unit.bruksformaal} — ${unit.bruksenhetsnummer}`,
          areaType: mapBuildingType(unit.bruksformaal === 'Lager' ? 'Lagerbygg' : unit.bruksformaal === 'Butikk' ? 'Butikkbygning' : 'Kontorbygg'),
          classification,
          areaM2: unit.bruksareal,
          floor: ui + 1,
          groupName: `${ui + 1}. Etg`,
          isLeased: false,
          source: 'placepoint',
        });
      });
    });

    const newFunds: Fund[] = [
      {
        id: 'f-onb-core',
        portfolioId: 'p-onb',
        name: 'Nordic Core Fund I',
        strategy: 'core',
        buildingIds: coreBuildingIds,
        targetReturn: 7.5,
        vintage: 2022,
      },
      {
        id: 'f-onb-va',
        portfolioId: 'p-onb',
        name: 'Nordic Value-Add II',
        strategy: 'value_add',
        buildingIds: vaBuildingIds,
        targetReturn: 12,
        vintage: 2024,
      },
    ];

    const kundebase: Kundebase = {
      id: `kb-onb-${Date.now()}`,
      name: companyDisplayName,
      orgNr: company?.organisasjonsnummer ?? '',
      isOnboarded: true,
      companies: [newCompany],
      portfolios: [newPortfolio],
      buildings: allBuildings,
      areaUnits: allAreaUnits,
      contracts: [],
      costs: [],
      budgets: [],
      marketData: [],
      funds: newFunds,
      clients: [],
    };

    addKundebase(kundebase);
    completeOnboarding();
    navigate('/');
  }

  const checklist = [
    'Rediger arealstruktur per bygg',
    'Legg til leietakere og kontrakter',
    'Legg til driftskostnader',
    'Sett markedsleie per bygg',
  ];

  return (
    <OnboardingLayout showFooter={false}>
      <div className="step-ferdig">
        <div className="step-ferdig__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#FED092" strokeWidth="3" />
            <path d="M14 24L21 31L34 17" stroke="#FED092" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="step-ferdig__heading">Porteføljen er klar!</h2>
        <p className="step-ferdig__stats">
          {selectedBuildings.length} bygg registrert · {totalArea > 0 ? `${totalArea.toLocaleString('nb-NO')} m²` : ''} · ~75% data auto-utfylt
        </p>

        <div className="step-ferdig__checklist">
          <div className="step-ferdig__checklist-title">Neste steg i appen:</div>
          {checklist.map((item, i) => (
            <div key={i} className="step-ferdig__checklist-item">
              <div className="step-ferdig__checklist-num">{i + 1}</div>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <button
          className="onboarding__btn onboarding__btn--primary step-ferdig__cta"
          onClick={handleGoToDashboard}
        >
          Gå til Dashboard →
        </button>
      </div>
    </OnboardingLayout>
  );
}
