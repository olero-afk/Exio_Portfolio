export interface MaturityCapability {
  id: string;
  category: string;
  name: string;
  description: string;
  requiredLevel: 1 | 2 | 3;
  dataSource: string;
}

export const ALL_CAPABILITIES: MaturityCapability[] = [
  // Portefølje (Nivå 1)
  { id: 'p01', category: 'Portefølje', name: 'Bygningsregister', description: 'Type, adresse, byggeår, etasjer, BRA', requiredLevel: 1, dataSource: 'PlacePoint' },
  { id: 'p02', category: 'Portefølje', name: 'Arealstruktur', description: 'Bruksenheter med type og m² per enhet', requiredLevel: 1, dataSource: 'PlacePoint' },
  { id: 'p03', category: 'Portefølje', name: 'Energimerking', description: 'A–G rating fra Enova/NVE', requiredLevel: 1, dataSource: 'PlacePoint' },
  { id: 'p04', category: 'Portefølje', name: 'Eierstruktur', description: 'Hjemmelshaver og eierbrøk per bygg', requiredLevel: 1, dataSource: 'PlacePoint + BRREG' },
  { id: 'p05', category: 'Portefølje', name: 'Markedsleie referanse', description: 'Pris per m² fra PlacePoint prisstatistikk', requiredLevel: 1, dataSource: 'PlacePoint' },
  { id: 'p06', category: 'Portefølje', name: 'Utleiegrad', description: 'Utleid vs. ledig areal', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'p07', category: 'Portefølje', name: 'Ledighetskostnad', description: 'Ledig areal × markedsleie i NOK', requiredLevel: 1, dataSource: 'PlacePoint + Manuell' },

  // Økonomi (Nivå 1 manuell, Nivå 2 live)
  { id: 'o01', category: 'Økonomi', name: 'Leieinntekter (manuell)', description: 'Årlig leie fra manuelt registrerte avtaler', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'o02', category: 'Økonomi', name: 'Driftskostnader (manuell)', description: 'Kostnader per kategori, manuelt registrert', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'o03', category: 'Økonomi', name: 'NOI beregning', description: 'Leieinntekter minus driftskostnader', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'o04', category: 'Økonomi', name: 'Felleskost % av leie', description: 'Driftskostnader som andel av leieinntekt', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'o05', category: 'Økonomi', name: 'Leieinntekter — live fra ERP', description: 'Automatisk fra regnskapssystem', requiredLevel: 2, dataSource: 'ERP' },
  { id: 'o06', category: 'Økonomi', name: 'Driftskostnader — live fra ERP', description: 'Automatisk fra regnskapssystem', requiredLevel: 2, dataSource: 'ERP' },
  { id: 'o07', category: 'Økonomi', name: 'NOI — live', description: 'NOI beregnet fra live ERP-data', requiredLevel: 2, dataSource: 'ERP' },
  { id: 'o08', category: 'Økonomi', name: 'Budsjett vs. faktisk', description: 'Avviksanalyse per bygg og kategori', requiredLevel: 2, dataSource: 'ERP' },
  { id: 'o09', category: 'Økonomi', name: 'Reskontro', description: 'Betalingsstatus per leietaker — live', requiredLevel: 2, dataSource: 'ERP' },
  { id: 'o10', category: 'Økonomi', name: 'NIY / Cap Rate', description: 'NOI ÷ markedsverdi per bygg', requiredLevel: 2, dataSource: 'ERP + Manuell' },
  { id: 'o11', category: 'Økonomi', name: 'Leie per m² vs. markedsnorm', description: 'Benchmark mot PlacePoint prisstatistikk', requiredLevel: 2, dataSource: 'ERP + PlacePoint' },

  // Kontrakter (Nivå 1 manuell, Nivå 3 live)
  { id: 'k01', category: 'Kontrakter', name: 'Leieavtaler (manuell)', description: 'Avtaler registrert manuelt med leie, dato, leietaker', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'k02', category: 'Kontrakter', name: 'WAULT beregning', description: 'Vektet gjennomsnittlig gjenværende kontraktstid', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'k03', category: 'Kontrakter', name: 'Kontraktsutløpsprofil', description: '% av inntekt som utløper per år (Y+1 til Y+5)', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'k04', category: 'Kontrakter', name: 'WAULT — live', description: 'Automatisk fra Exio Kontraktsforvaltning', requiredLevel: 3, dataSource: 'Kontraktsforvaltning' },
  { id: 'k05', category: 'Kontrakter', name: 'Kontraktslivssyklus', description: 'Fornyelse, oppsigelse, KPI-regulering', requiredLevel: 3, dataSource: 'Kontraktsforvaltning' },
  { id: 'k06', category: 'Kontrakter', name: 'Automatisk utleiegrad', description: 'Live fra kontraktsstatus — ingen manuell oppdatering', requiredLevel: 3, dataSource: 'Kontraktsforvaltning' },
  { id: 'k07', category: 'Kontrakter', name: 'Leietakerkommunikasjon', description: 'Meldinger, dokumenter og historikk per leietaker', requiredLevel: 3, dataSource: 'Kontraktsforvaltning' },
  { id: 'k08', category: 'Kontrakter', name: 'Automatisk fakturering', description: 'Fakturaforslag generert og sendt til ERP', requiredLevel: 3, dataSource: 'Kontraktsforvaltning + ERP' },
  { id: 'k09', category: 'Kontrakter', name: 'Varslinger', description: 'Automatiske varsler ved utløp, fornyelse, bruddklausul', requiredLevel: 3, dataSource: 'Kontraktsforvaltning' },
  { id: 'k10', category: 'Kontrakter', name: 'Digital signering', description: 'Kontraktssignering direkte i plattformen', requiredLevel: 3, dataSource: 'Kontraktsforvaltning' },

  // Bank & Rapportering
  { id: 'b01', category: 'Bank & Rapportering', name: 'Finansiering / lån', description: 'Låneoversikt med rente, avdrag og løpetid', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'b02', category: 'Bank & Rapportering', name: 'Belåningsgrad (LTV)', description: 'Gjeld ÷ markedsverdi per bygg', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'b03', category: 'Bank & Rapportering', name: 'DSCR', description: 'NOI ÷ årlig gjeldsbetjening', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'b04', category: 'Bank & Rapportering', name: 'Covenant-tracking', description: 'Automatisk varsling ved brudd på bankvilkår', requiredLevel: 1, dataSource: 'Manuell' },
  { id: 'b05', category: 'Bank & Rapportering', name: 'Styrerapport — live', description: 'Alle nøkkeltall samlet for styremøte', requiredLevel: 1, dataSource: 'Alle kilder' },
  { id: 'b06', category: 'Bank & Rapportering', name: 'DSCR — live fra ERP', description: 'NOI fra ERP ÷ gjeldsbetjening = live DSCR', requiredLevel: 2, dataSource: 'ERP + Manuell' },
  { id: 'b07', category: 'Bank & Rapportering', name: 'Sensitivitetsanalyse', description: 'Scenario: rente ±X%, ledighet ±Y%, KPI ±Z%', requiredLevel: 2, dataSource: 'ERP + Manuell' },
  { id: 'b08', category: 'Bank & Rapportering', name: 'Automatisk bankrapport', description: 'Generert rapport med alle nøkkeltall banken krever', requiredLevel: 3, dataSource: 'Alle kilder' },
];

export const LEVEL_NAMES: Record<1 | 2 | 3, { name: string; description: string; integrations: string[] }> = {
  1: { name: 'Exio Portfolio', description: 'Manuell input + PlacePoint + BRREG', integrations: ['PlacePoint', 'BRREG'] },
  2: { name: '+ ERP-integrasjon', description: 'Live data fra regnskapssystem', integrations: ['Tripletex', 'XLedger', 'PoGo'] },
  3: { name: '+ Exio Kontraktsforvaltning', description: 'Erstatter Fenistra / Fazile / Excel', integrations: ['Exio Kontraktsforvaltning'] },
};
