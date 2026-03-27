export interface BrregCompany {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: { kode: string; beskrivelse: string };
  forretningsadresse: {
    adresse: string[];
    postnummer: string;
    poststed: string;
    kommunenummer: string;
    kommune: string;
    land: string;
    landkode: string;
  };
  naeringskode1: { kode: string; beskrivelse: string };
  stiftelsesdato: string;
  antallAnsatte: number;
  konkurs: boolean;
  underAvvikling: boolean;
  erIKonsern: boolean;
  konsern?: {
    organisasjonsnummer: string;
    navn: string;
    children: Array<{
      organisasjonsnummer: string;
      navn: string;
      orgform: string;
    }>;
  };
}

const companies: Record<string, BrregCompany> = {
  '923456789': {
    organisasjonsnummer: '923456789',
    navn: 'Nordic Property Group AS',
    organisasjonsform: { kode: 'AS', beskrivelse: 'Aksjeselskap' },
    forretningsadresse: {
      adresse: ['Aker Brygge 12'],
      postnummer: '0250',
      poststed: 'OSLO',
      kommunenummer: '0301',
      kommune: 'OSLO',
      land: 'Norge',
      landkode: 'NO',
    },
    naeringskode1: {
      kode: '68.209',
      beskrivelse: 'Utleie av egen eller leid fast eiendom ellers',
    },
    stiftelsesdato: '2015-03-15',
    antallAnsatte: 12,
    konkurs: false,
    underAvvikling: false,
    erIKonsern: true,
    konsern: {
      organisasjonsnummer: '923456789',
      navn: 'Nordic Property Group AS',
      children: [
        { organisasjonsnummer: '987654321', navn: 'NPG Eiendom Holding AS', orgform: 'AS' },
        { organisasjonsnummer: '987654322', navn: 'NPG Kontor SPV AS', orgform: 'AS' },
        { organisasjonsnummer: '987654323', navn: 'NPG Lager SPV AS', orgform: 'AS' },
        { organisasjonsnummer: '987654324', navn: 'NPG Handel SPV AS', orgform: 'AS' },
      ],
    },
  },
  '912345678': {
    organisasjonsnummer: '912345678',
    navn: 'Bergen Forvaltning AS',
    organisasjonsform: { kode: 'AS', beskrivelse: 'Aksjeselskap' },
    forretningsadresse: {
      adresse: ['Bryggen 5'],
      postnummer: '5003',
      poststed: 'BERGEN',
      kommunenummer: '4601',
      kommune: 'BERGEN',
      land: 'Norge',
      landkode: 'NO',
    },
    naeringskode1: {
      kode: '68.320',
      beskrivelse: 'Forvaltning av fast eiendom på oppdrag',
    },
    stiftelsesdato: '2010-06-01',
    antallAnsatte: 8,
    konkurs: false,
    underAvvikling: false,
    erIKonsern: false,
  },
  '934567890': {
    organisasjonsnummer: '934567890',
    navn: 'Stavanger Eiendomsinvest AS',
    organisasjonsform: { kode: 'AS', beskrivelse: 'Aksjeselskap' },
    forretningsadresse: {
      adresse: ['Klubbgata 2'],
      postnummer: '4013',
      poststed: 'STAVANGER',
      kommunenummer: '1103',
      kommune: 'STAVANGER',
      land: 'Norge',
      landkode: 'NO',
    },
    naeringskode1: {
      kode: '68.209',
      beskrivelse: 'Utleie av egen eller leid fast eiendom ellers',
    },
    stiftelsesdato: '2018-11-20',
    antallAnsatte: 4,
    konkurs: false,
    underAvvikling: false,
    erIKonsern: true,
    konsern: {
      organisasjonsnummer: '934567890',
      navn: 'Stavanger Eiendomsinvest AS',
      children: [
        { organisasjonsnummer: '934567891', navn: 'Stavanger Kontor SPV AS', orgform: 'AS' },
      ],
    },
  },
};

export function lookupCompany(orgNr: string): Promise<BrregCompany | null> {
  const cleaned = orgNr.replace(/\s/g, '');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(companies[cleaned] ?? null);
    }, 1500);
  });
}
