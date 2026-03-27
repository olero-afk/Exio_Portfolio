export interface PlacePointBuilding {
  id: string;
  matrikkelNummer: {
    kommunenummer: string;
    gaardsnummer: number;
    bruksnummer: number;
    festenummer: number;
    seksjonsnummer: number;
  };
  adresse: {
    adressetekst: string;
    postnummer: string;
    poststed: string;
    kommunenavn: string;
    koordinater: { lat: number; lon: number };
  };
  bygningstype: {
    kode: string;
    beskrivelse: string;
  };
  byggeaar: number | null;
  antallEtasjer: number | null;
  bruksareal: number | null;
  bruksenheter: Array<{
    bruksenhetsnummer: string;
    bruksformaal: string;
    bruksareal: number;
  }>;
  energimerke: {
    karakter: string | null;
    oppvarmingskarakter: string | null;
  } | null;
  hjemmelshaver: {
    organisasjonsnummer: string;
    navn: string;
  };
  tomteareal: number | null;
  prisstatistikk: {
    prisPerKvm: number | null;
    kommune: string;
  } | null;
}

const allBuildings: PlacePointBuilding[] = [
  // --- Eier buildings (hjemmelshaver = user's org 923456789) ---
  {
    id: 'pp-001',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 200, bruksnummer: 14, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Aker Brygge 12', postnummer: '0250', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9106, lon: 10.7278 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    byggeaar: 2005,
    antallEtasjer: 8,
    bruksareal: 12500,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Kontor', bruksareal: 4200 },
      { bruksenhetsnummer: 'H0102', bruksformaal: 'Kontor', bruksareal: 3800 },
      { bruksenhetsnummer: 'H0103', bruksformaal: 'Kontor', bruksareal: 2500 },
      { bruksenhetsnummer: 'H0104', bruksformaal: 'Fellesareal', bruksareal: 2000 },
    ],
    energimerke: { karakter: 'B', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '923456789', navn: 'Nordic Property Group AS' },
    tomteareal: 3200,
    prisstatistikk: { prisPerKvm: 72000, kommune: 'Oslo' },
  },
  {
    id: 'pp-002',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 215, bruksnummer: 3, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Dronning Eufemias gate 30', postnummer: '0191', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9073, lon: 10.7583 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    byggeaar: 2012,
    antallEtasjer: 12,
    bruksareal: 18200,
    bruksenheter: [
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 6500 },
      { bruksenhetsnummer: 'H0202', bruksformaal: 'Kontor', bruksareal: 5200 },
      { bruksenhetsnummer: 'H0203', bruksformaal: 'Kontor', bruksareal: 3500 },
      { bruksenhetsnummer: 'H0204', bruksformaal: 'Fellesareal', bruksareal: 3000 },
    ],
    energimerke: { karakter: 'A', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '923456789', navn: 'Nordic Property Group AS' },
    tomteareal: 4100,
    prisstatistikk: { prisPerKvm: 85000, kommune: 'Oslo' },
  },
  {
    id: 'pp-003',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 310, bruksnummer: 7, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Strandveien 50', postnummer: '1366', poststed: 'LYSAKER', kommunenavn: 'Bærum', koordinater: { lat: 59.9115, lon: 10.6355 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    byggeaar: 1998,
    antallEtasjer: 5,
    bruksareal: 6800,
    bruksenheter: [
      { bruksenhetsnummer: 'H0301', bruksformaal: 'Kontor', bruksareal: 3400 },
      { bruksenhetsnummer: 'H0302', bruksformaal: 'Kontor', bruksareal: 2200 },
      { bruksenhetsnummer: 'H0303', bruksformaal: 'Fellesareal', bruksareal: 1200 },
    ],
    energimerke: { karakter: 'D', oppvarmingskarakter: 'Gul' },
    hjemmelshaver: { organisasjonsnummer: '923456789', navn: 'Nordic Property Group AS' },
    tomteareal: 2800,
    prisstatistikk: { prisPerKvm: 45000, kommune: 'Bærum' },
  },
  {
    id: 'pp-004',
    matrikkelNummer: { kommunenummer: '4601', gaardsnummer: 166, bruksnummer: 22, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Lars Hilles gate 30', postnummer: '5008', poststed: 'BERGEN', kommunenavn: 'Bergen', koordinater: { lat: 60.3913, lon: 5.3327 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    byggeaar: 2015,
    antallEtasjer: 6,
    bruksareal: 8400,
    bruksenheter: [
      { bruksenhetsnummer: 'H0401', bruksformaal: 'Kontor', bruksareal: 4000 },
      { bruksenhetsnummer: 'H0402', bruksformaal: 'Kontor', bruksareal: 2800 },
      { bruksenhetsnummer: 'H0403', bruksformaal: 'Fellesareal', bruksareal: 1600 },
    ],
    energimerke: { karakter: 'B', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '923456789', navn: 'Nordic Property Group AS' },
    tomteareal: 2200,
    prisstatistikk: { prisPerKvm: 52000, kommune: 'Bergen' },
  },

  // --- Investor buildings (hjemmelshaver = konsern child SPVs) ---
  {
    id: 'pp-005',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 180, bruksnummer: 45, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Rosenkrantz gate 7', postnummer: '0159', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9142, lon: 10.7389 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    byggeaar: 2018,
    antallEtasjer: 10,
    bruksareal: 14600,
    bruksenheter: [
      { bruksenhetsnummer: 'H0501', bruksformaal: 'Kontor', bruksareal: 5500 },
      { bruksenhetsnummer: 'H0502', bruksformaal: 'Kontor', bruksareal: 4200 },
      { bruksenhetsnummer: 'H0503', bruksformaal: 'Butikk', bruksareal: 1800 },
      { bruksenhetsnummer: 'H0504', bruksformaal: 'Fellesareal', bruksareal: 3100 },
    ],
    energimerke: { karakter: 'A', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '987654322', navn: 'NPG Kontor SPV AS' },
    tomteareal: 3500,
    prisstatistikk: { prisPerKvm: 78000, kommune: 'Oslo' },
  },
  {
    id: 'pp-006',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 420, bruksnummer: 8, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Drammensveien 126', postnummer: '0277', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9198, lon: 10.6942 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    byggeaar: 2008,
    antallEtasjer: 7,
    bruksareal: 9800,
    bruksenheter: [
      { bruksenhetsnummer: 'H0601', bruksformaal: 'Kontor', bruksareal: 4500 },
      { bruksenhetsnummer: 'H0602', bruksformaal: 'Kontor', bruksareal: 3300 },
      { bruksenhetsnummer: 'H0603', bruksformaal: 'Fellesareal', bruksareal: 2000 },
    ],
    energimerke: { karakter: 'C', oppvarmingskarakter: 'Gul' },
    hjemmelshaver: { organisasjonsnummer: '987654321', navn: 'NPG Eiendom Holding AS' },
    tomteareal: 2600,
    prisstatistikk: { prisPerKvm: 62000, kommune: 'Oslo' },
  },
  {
    id: 'pp-007',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 505, bruksnummer: 12, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Alfaset 1. Industriveien 8', postnummer: '0668', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9352, lon: 10.8321 } },
    bygningstype: { kode: '231', beskrivelse: 'Lagerbygg' },
    byggeaar: 2001,
    antallEtasjer: 2,
    bruksareal: 5200,
    bruksenheter: [
      { bruksenhetsnummer: 'H0701', bruksformaal: 'Lager', bruksareal: 4000 },
      { bruksenhetsnummer: 'H0702', bruksformaal: 'Kontor', bruksareal: 800 },
      { bruksenhetsnummer: 'H0703', bruksformaal: 'Fellesareal', bruksareal: 400 },
    ],
    energimerke: { karakter: 'E', oppvarmingskarakter: 'Rød' },
    hjemmelshaver: { organisasjonsnummer: '987654323', navn: 'NPG Lager SPV AS' },
    tomteareal: 8500,
    prisstatistikk: { prisPerKvm: 22000, kommune: 'Oslo' },
  },
  {
    id: 'pp-008',
    matrikkelNummer: { kommunenummer: '1103', gaardsnummer: 55, bruksnummer: 140, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Hinna Strandveg 2', postnummer: '4020', poststed: 'STAVANGER', kommunenavn: 'Stavanger', koordinater: { lat: 58.9037, lon: 5.7315 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    byggeaar: 2016,
    antallEtasjer: 9,
    bruksareal: 11300,
    bruksenheter: [
      { bruksenhetsnummer: 'H0801', bruksformaal: 'Kontor', bruksareal: 5000 },
      { bruksenhetsnummer: 'H0802', bruksformaal: 'Kontor', bruksareal: 3500 },
      { bruksenhetsnummer: 'H0803', bruksformaal: 'Fellesareal', bruksareal: 2800 },
    ],
    energimerke: { karakter: 'B', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '987654324', navn: 'NPG Handel SPV AS' },
    tomteareal: 3800,
    prisstatistikk: { prisPerKvm: 48000, kommune: 'Stavanger' },
  },

  // --- Forvalter buildings (hjemmelshaver = external companies) ---
  {
    id: 'pp-009',
    matrikkelNummer: { kommunenummer: '4601', gaardsnummer: 200, bruksnummer: 35, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Kanalveien 105', postnummer: '5068', poststed: 'BERGEN', kommunenavn: 'Bergen', koordinater: { lat: 60.3728, lon: 5.3411 } },
    bygningstype: { kode: '322', beskrivelse: 'Butikkbygning' },
    byggeaar: 2010,
    antallEtasjer: 3,
    bruksareal: 4200,
    bruksenheter: [
      { bruksenhetsnummer: 'H0901', bruksformaal: 'Butikk', bruksareal: 2400 },
      { bruksenhetsnummer: 'H0902', bruksformaal: 'Butikk', bruksareal: 1200 },
      { bruksenhetsnummer: 'H0903', bruksformaal: 'Fellesareal', bruksareal: 600 },
    ],
    energimerke: { karakter: 'C', oppvarmingskarakter: 'Gul' },
    hjemmelshaver: { organisasjonsnummer: '911223344', navn: 'Havnegården Eiendom AS' },
    tomteareal: 1800,
    prisstatistikk: { prisPerKvm: 38000, kommune: 'Bergen' },
  },
  {
    id: 'pp-010',
    matrikkelNummer: { kommunenummer: '1103', gaardsnummer: 60, bruksnummer: 88, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Forusveien 35', postnummer: '4033', poststed: 'STAVANGER', kommunenavn: 'Stavanger', koordinater: { lat: 58.8825, lon: 5.7198 } },
    bygningstype: { kode: '231', beskrivelse: 'Lagerbygg' },
    byggeaar: 1995,
    antallEtasjer: 2,
    bruksareal: 7600,
    bruksenheter: [
      { bruksenhetsnummer: 'H1001', bruksformaal: 'Lager', bruksareal: 5500 },
      { bruksenhetsnummer: 'H1002', bruksformaal: 'Kontor', bruksareal: 1200 },
      { bruksenhetsnummer: 'H1003', bruksformaal: 'Fellesareal', bruksareal: 900 },
    ],
    energimerke: null,
    hjemmelshaver: { organisasjonsnummer: '955667788', navn: 'Rogaland Industri AS' },
    tomteareal: 12000,
    prisstatistikk: { prisPerKvm: 18000, kommune: 'Stavanger' },
  },
  {
    id: 'pp-011',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 340, bruksnummer: 19, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Nydalsveien 28', postnummer: '0484', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9490, lon: 10.7654 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    byggeaar: 2019,
    antallEtasjer: 6,
    bruksareal: 9100,
    bruksenheter: [
      { bruksenhetsnummer: 'H1101', bruksformaal: 'Kontor', bruksareal: 4200 },
      { bruksenhetsnummer: 'H1102', bruksformaal: 'Kontor', bruksareal: 3000 },
      { bruksenhetsnummer: 'H1103', bruksformaal: 'Fellesareal', bruksareal: 1900 },
    ],
    energimerke: { karakter: 'A', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '911223344', navn: 'Havnegården Eiendom AS' },
    tomteareal: 2400,
    prisstatistikk: { prisPerKvm: 68000, kommune: 'Oslo' },
  },
];

export function discoverBuildings(_orgNr: string): Promise<PlacePointBuilding[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(allBuildings);
    }, 2000);
  });
}
