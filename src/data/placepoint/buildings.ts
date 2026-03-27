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
  bygningsstatus: string;
  byggeaar: number | null;
  antallEtasjer: number | null;
  bebygdAreal: number | null;
  bruksareal: number | null;
  bruksenheter: Array<{
    bruksenhetsnummer: string;
    bruksformaal: string;
    bruksareal: number;
    etasje: number;
  }>;
  energimerke: {
    karakter: string | null;
    oppvarmingskarakter: string | null;
  } | null;
  hjemmelshaver: {
    organisasjonsnummer: string;
    navn: string;
    eierandel: string;
  };
  tomteareal: number | null;
  prisstatistikk: {
    prisPerKvm: number | null;
    kilde: string;
    kommune: string;
  } | null;
}

const allBuildings: PlacePointBuilding[] = [
  // ═══════ EIER buildings (hjemmelshaver = user's org 923456789) ═══════
  {
    id: 'pp-001',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 200, bruksnummer: 14, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Bryggegata 6', postnummer: '0250', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9106, lon: 10.7278 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 2005,
    antallEtasjer: 8,
    bebygdAreal: 1560,
    bruksareal: 12500,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Kontor', bruksareal: 1400, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 1600, etasje: 2 },
      { bruksenhetsnummer: 'H0301', bruksformaal: 'Kontor', bruksareal: 1600, etasje: 3 },
      { bruksenhetsnummer: 'H0401', bruksformaal: 'Kontor', bruksareal: 1600, etasje: 4 },
      { bruksenhetsnummer: 'H0501', bruksformaal: 'Kontor', bruksareal: 1600, etasje: 5 },
      { bruksenhetsnummer: 'H0601', bruksformaal: 'Kontor', bruksareal: 1200, etasje: 6 },
      { bruksenhetsnummer: 'H0701', bruksformaal: 'Kontor', bruksareal: 1000, etasje: 7 },
      { bruksenhetsnummer: 'H0801', bruksformaal: 'Servering', bruksareal: 280, etasje: 1 },
      { bruksenhetsnummer: 'H0102', bruksformaal: 'Parkering', bruksareal: 1400, etasje: -1 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 820, etasje: 0 },
    ],
    energimerke: { karakter: 'B', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '923456789', navn: 'Nordic Property Group AS', eierandel: '1/1' },
    tomteareal: 3200,
    prisstatistikk: { prisPerKvm: 3200, kilde: 'PlacePoint / SSB', kommune: 'Oslo' },
  },
  {
    id: 'pp-002',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 215, bruksnummer: 3, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Dronning Eufemias gate 30', postnummer: '0191', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9073, lon: 10.7583 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 2012,
    antallEtasjer: 12,
    bebygdAreal: 1520,
    bruksareal: 18200,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Kontor', bruksareal: 1500, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 1500, etasje: 2 },
      { bruksenhetsnummer: 'H0301', bruksformaal: 'Kontor', bruksareal: 1500, etasje: 3 },
      { bruksenhetsnummer: 'H0401', bruksformaal: 'Kontor', bruksareal: 1500, etasje: 4 },
      { bruksenhetsnummer: 'H0501', bruksformaal: 'Kontor', bruksareal: 1500, etasje: 5 },
      { bruksenhetsnummer: 'H0601', bruksformaal: 'Kontor', bruksareal: 1500, etasje: 6 },
      { bruksenhetsnummer: 'H0701', bruksformaal: 'Kontor', bruksareal: 1500, etasje: 7 },
      { bruksenhetsnummer: 'H0801', bruksformaal: 'Kontor', bruksareal: 1200, etasje: 8 },
      { bruksenhetsnummer: 'H0901', bruksformaal: 'Handel', bruksareal: 650, etasje: 1 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 2200, etasje: 0 },
      { bruksenhetsnummer: 'HP001', bruksformaal: 'Parkering', bruksareal: 1650, etasje: -1 },
    ],
    energimerke: { karakter: 'A', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '923456789', navn: 'Nordic Property Group AS', eierandel: '1/1' },
    tomteareal: 4100,
    prisstatistikk: { prisPerKvm: 3600, kilde: 'PlacePoint / SSB', kommune: 'Oslo' },
  },
  {
    id: 'pp-003',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 310, bruksnummer: 7, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Strandveien 50', postnummer: '1366', poststed: 'LYSAKER', kommunenavn: 'Bærum', koordinater: { lat: 59.9115, lon: 10.6355 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 1988,
    antallEtasjer: 5,
    bebygdAreal: 1360,
    bruksareal: 6800,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Kontor', bruksareal: 1200, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 1200, etasje: 2 },
      { bruksenhetsnummer: 'H0301', bruksformaal: 'Kontor', bruksareal: 1200, etasje: 3 },
      { bruksenhetsnummer: 'H0401', bruksformaal: 'Kontor', bruksareal: 1200, etasje: 4 },
      { bruksenhetsnummer: 'H0501', bruksformaal: 'Kontor', bruksareal: 800, etasje: 5 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 700, etasje: 0 },
      { bruksenhetsnummer: 'HP001', bruksformaal: 'Parkering', bruksareal: 500, etasje: -1 },
    ],
    energimerke: { karakter: 'D', oppvarmingskarakter: 'Gul' },
    hjemmelshaver: { organisasjonsnummer: '923456789', navn: 'Nordic Property Group AS', eierandel: '1/1' },
    tomteareal: 2800,
    prisstatistikk: { prisPerKvm: 2100, kilde: 'PlacePoint / SSB', kommune: 'Bærum' },
  },
  {
    id: 'pp-004',
    matrikkelNummer: { kommunenummer: '4601', gaardsnummer: 166, bruksnummer: 22, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Lars Hilles gate 30', postnummer: '5008', poststed: 'BERGEN', kommunenavn: 'Bergen', koordinater: { lat: 60.3913, lon: 5.3327 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 2015,
    antallEtasjer: 6,
    bebygdAreal: 1400,
    bruksareal: 8400,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Kontor', bruksareal: 1300, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 1300, etasje: 2 },
      { bruksenhetsnummer: 'H0301', bruksformaal: 'Kontor', bruksareal: 1300, etasje: 3 },
      { bruksenhetsnummer: 'H0401', bruksformaal: 'Kontor', bruksareal: 1300, etasje: 4 },
      { bruksenhetsnummer: 'H0501', bruksformaal: 'Kontor', bruksareal: 800, etasje: 5 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 1100, etasje: 0 },
      { bruksenhetsnummer: 'HP001', bruksformaal: 'Parkering', bruksareal: 1300, etasje: -1 },
    ],
    energimerke: { karakter: 'C', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '923456789', navn: 'Nordic Property Group AS', eierandel: '1/1' },
    tomteareal: 2200,
    prisstatistikk: { prisPerKvm: 2400, kilde: 'PlacePoint / SSB', kommune: 'Bergen' },
  },

  // ═══════ INVESTOR buildings (hjemmelshaver = konsern child SPVs) ═══════
  {
    id: 'pp-005',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 180, bruksnummer: 45, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Rosenkrantz gate 7', postnummer: '0159', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9142, lon: 10.7389 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 2018,
    antallEtasjer: 10,
    bebygdAreal: 1460,
    bruksareal: 14600,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Handel', bruksareal: 820, etasje: 1 },
      { bruksenhetsnummer: 'H0102', bruksformaal: 'Servering', bruksareal: 420, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 1400, etasje: 2 },
      { bruksenhetsnummer: 'H0301', bruksformaal: 'Kontor', bruksareal: 1400, etasje: 3 },
      { bruksenhetsnummer: 'H0401', bruksformaal: 'Kontor', bruksareal: 1400, etasje: 4 },
      { bruksenhetsnummer: 'H0501', bruksformaal: 'Kontor', bruksareal: 1400, etasje: 5 },
      { bruksenhetsnummer: 'H0601', bruksformaal: 'Kontor', bruksareal: 1200, etasje: 6 },
      { bruksenhetsnummer: 'H0701', bruksformaal: 'Kontor', bruksareal: 1200, etasje: 7 },
      { bruksenhetsnummer: 'H0801', bruksformaal: 'Kontor', bruksareal: 1000, etasje: 8 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 2100, etasje: 0 },
      { bruksenhetsnummer: 'HP001', bruksformaal: 'Parkering', bruksareal: 1260, etasje: -1 },
    ],
    energimerke: { karakter: 'A', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '987654322', navn: 'NPG Kontor SPV AS', eierandel: '1/1' },
    tomteareal: 3500,
    prisstatistikk: { prisPerKvm: 3400, kilde: 'PlacePoint / SSB', kommune: 'Oslo' },
  },
  {
    id: 'pp-006',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 420, bruksnummer: 8, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Drammensveien 126', postnummer: '0277', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9198, lon: 10.6942 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 1972,
    antallEtasjer: 7,
    bebygdAreal: 1400,
    bruksareal: 9800,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Kontor', bruksareal: 1300, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 1300, etasje: 2 },
      { bruksenhetsnummer: 'H0301', bruksformaal: 'Kontor', bruksareal: 1300, etasje: 3 },
      { bruksenhetsnummer: 'H0401', bruksformaal: 'Kontor', bruksareal: 1300, etasje: 4 },
      { bruksenhetsnummer: 'H0501', bruksformaal: 'Kontor', bruksareal: 1300, etasje: 5 },
      { bruksenhetsnummer: 'H0601', bruksformaal: 'Lager', bruksareal: 800, etasje: -1 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 1500, etasje: 0 },
      { bruksenhetsnummer: 'HP001', bruksformaal: 'Parkering', bruksareal: 1000, etasje: -1 },
    ],
    energimerke: { karakter: 'D', oppvarmingskarakter: 'Gul' },
    hjemmelshaver: { organisasjonsnummer: '987654321', navn: 'NPG Eiendom Holding AS', eierandel: '1/1' },
    tomteareal: 2600,
    prisstatistikk: { prisPerKvm: 2600, kilde: 'PlacePoint / SSB', kommune: 'Oslo' },
  },
  {
    id: 'pp-007',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 505, bruksnummer: 12, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Alfaset 1. Industriveien 8', postnummer: '0668', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9352, lon: 10.8321 } },
    bygningstype: { kode: '231', beskrivelse: 'Lagerbygg' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 1996,
    antallEtasjer: 2,
    bebygdAreal: 2600,
    bruksareal: 5200,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Lager', bruksareal: 2400, etasje: 1 },
      { bruksenhetsnummer: 'H0102', bruksformaal: 'Lager', bruksareal: 1600, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 480, etasje: 2 },
      { bruksenhetsnummer: 'H0202', bruksformaal: 'Kontor', bruksareal: 320, etasje: 2 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 400, etasje: 0 },
    ],
    energimerke: { karakter: 'E', oppvarmingskarakter: 'Rød' },
    hjemmelshaver: { organisasjonsnummer: '987654323', navn: 'NPG Lager SPV AS', eierandel: '1/1' },
    tomteareal: 8500,
    prisstatistikk: { prisPerKvm: 1100, kilde: 'PlacePoint / SSB', kommune: 'Oslo' },
  },
  {
    id: 'pp-008',
    matrikkelNummer: { kommunenummer: '1103', gaardsnummer: 55, bruksnummer: 140, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Hinna Strandveg 2', postnummer: '4020', poststed: 'STAVANGER', kommunenavn: 'Stavanger', koordinater: { lat: 58.9037, lon: 5.7315 } },
    bygningstype: { kode: '330', beskrivelse: 'Kombinert bolig- og næringsbygg' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 2016,
    antallEtasjer: 9,
    bebygdAreal: 1260,
    bruksareal: 11300,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Handel', bruksareal: 680, etasje: 1 },
      { bruksenhetsnummer: 'H0102', bruksformaal: 'Servering', bruksareal: 350, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 1100, etasje: 2 },
      { bruksenhetsnummer: 'H0301', bruksformaal: 'Kontor', bruksareal: 1100, etasje: 3 },
      { bruksenhetsnummer: 'H0401', bruksformaal: 'Bolig', bruksareal: 1100, etasje: 4 },
      { bruksenhetsnummer: 'H0501', bruksformaal: 'Bolig', bruksareal: 1100, etasje: 5 },
      { bruksenhetsnummer: 'H0601', bruksformaal: 'Bolig', bruksareal: 1100, etasje: 6 },
      { bruksenhetsnummer: 'H0701', bruksformaal: 'Bolig', bruksareal: 900, etasje: 7 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 1870, etasje: 0 },
      { bruksenhetsnummer: 'HP001', bruksformaal: 'Parkering', bruksareal: 2000, etasje: -1 },
    ],
    energimerke: { karakter: 'B', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '987654324', navn: 'NPG Handel SPV AS', eierandel: '1/1' },
    tomteareal: 3800,
    prisstatistikk: { prisPerKvm: 2200, kilde: 'PlacePoint / SSB', kommune: 'Stavanger' },
  },

  // ═══════ FORVALTER buildings (hjemmelshaver = external companies) ═══════
  {
    id: 'pp-009',
    matrikkelNummer: { kommunenummer: '4601', gaardsnummer: 200, bruksnummer: 35, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Kanalveien 105', postnummer: '5068', poststed: 'BERGEN', kommunenavn: 'Bergen', koordinater: { lat: 60.3728, lon: 5.3411 } },
    bygningstype: { kode: '322', beskrivelse: 'Butikk-/forretningsbygning' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 2010,
    antallEtasjer: 3,
    bebygdAreal: 1400,
    bruksareal: 4200,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Handel', bruksareal: 1200, etasje: 1 },
      { bruksenhetsnummer: 'H0102', bruksformaal: 'Handel', bruksareal: 800, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Handel', bruksareal: 600, etasje: 2 },
      { bruksenhetsnummer: 'H0202', bruksformaal: 'Kontor', bruksareal: 400, etasje: 2 },
      { bruksenhetsnummer: 'H0301', bruksformaal: 'Lager', bruksareal: 620, etasje: -1 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 580, etasje: 0 },
    ],
    energimerke: { karakter: 'C', oppvarmingskarakter: 'Gul' },
    hjemmelshaver: { organisasjonsnummer: '911223344', navn: 'Havnegården Eiendom AS', eierandel: '1/1' },
    tomteareal: 1800,
    prisstatistikk: { prisPerKvm: 1900, kilde: 'PlacePoint / SSB', kommune: 'Bergen' },
  },
  {
    id: 'pp-010',
    matrikkelNummer: { kommunenummer: '1103', gaardsnummer: 60, bruksnummer: 88, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Forusveien 35', postnummer: '4033', poststed: 'STAVANGER', kommunenavn: 'Stavanger', koordinater: { lat: 58.8825, lon: 5.7198 } },
    bygningstype: { kode: '231', beskrivelse: 'Lagerbygg' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 1994,
    antallEtasjer: 2,
    bebygdAreal: 3800,
    bruksareal: 7600,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Lager', bruksareal: 3200, etasje: 1 },
      { bruksenhetsnummer: 'H0102', bruksformaal: 'Lager', bruksareal: 2300, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 650, etasje: 2 },
      { bruksenhetsnummer: 'H0202', bruksformaal: 'Kontor', bruksareal: 550, etasje: 2 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 900, etasje: 0 },
    ],
    energimerke: null,
    hjemmelshaver: { organisasjonsnummer: '955667788', navn: 'Rogaland Industri AS', eierandel: '1/1' },
    tomteareal: 12000,
    prisstatistikk: { prisPerKvm: 950, kilde: 'PlacePoint / SSB', kommune: 'Stavanger' },
  },
  {
    id: 'pp-011',
    matrikkelNummer: { kommunenummer: '0301', gaardsnummer: 340, bruksnummer: 19, festenummer: 0, seksjonsnummer: 0 },
    adresse: { adressetekst: 'Nydalsveien 28', postnummer: '0484', poststed: 'OSLO', kommunenavn: 'Oslo', koordinater: { lat: 59.9490, lon: 10.7654 } },
    bygningstype: { kode: '159', beskrivelse: 'Kontorbygg' },
    bygningsstatus: 'Tatt i bruk',
    byggeaar: 2019,
    antallEtasjer: 6,
    bebygdAreal: 1520,
    bruksareal: 9100,
    bruksenheter: [
      { bruksenhetsnummer: 'H0101', bruksformaal: 'Kontor', bruksareal: 1400, etasje: 1 },
      { bruksenhetsnummer: 'H0201', bruksformaal: 'Kontor', bruksareal: 1400, etasje: 2 },
      { bruksenhetsnummer: 'H0301', bruksformaal: 'Kontor', bruksareal: 1400, etasje: 3 },
      { bruksenhetsnummer: 'H0401', bruksformaal: 'Kontor', bruksareal: 1400, etasje: 4 },
      { bruksenhetsnummer: 'H0501', bruksformaal: 'Kontor', bruksareal: 800, etasje: 5 },
      { bruksenhetsnummer: 'HF001', bruksformaal: 'Fellesareal', bruksareal: 1300, etasje: 0 },
      { bruksenhetsnummer: 'HP001', bruksformaal: 'Parkering', bruksareal: 1400, etasje: -1 },
    ],
    energimerke: { karakter: 'B', oppvarmingskarakter: 'Grønn' },
    hjemmelshaver: { organisasjonsnummer: '911223344', navn: 'Havnegården Eiendom AS', eierandel: '1/1' },
    tomteareal: 2400,
    prisstatistikk: { prisPerKvm: 2850, kilde: 'PlacePoint / SSB', kommune: 'Oslo' },
  },
];

export function discoverBuildings(_orgNr: string): Promise<PlacePointBuilding[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(allBuildings);
    }, 2000);
  });
}

/** Summarize bruksenheter by type for display */
export function summarizeBruksenheter(units: PlacePointBuilding['bruksenheter']): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const u of units) {
    if (u.bruksformaal === 'Fellesareal' || u.bruksformaal === 'Parkering') continue;
    map.set(u.bruksformaal, (map.get(u.bruksformaal) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
