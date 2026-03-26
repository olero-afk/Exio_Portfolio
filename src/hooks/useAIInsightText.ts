import { useState, useEffect, useRef } from 'react';
import { usePersona } from '../context/PersonaContext.tsx';
import type { PortfolioKPIs } from './usePortfolioKPI.ts';
import type { Insight } from './usePersonaInsights.ts';
import { formatNOK, formatPercent, formatYears } from '../utils/formatters.ts';

/**
 * Generates AI-style insight text for cards 1-4.
 * Calls Anthropic API if VITE_ANTHROPIC_API_KEY is set,
 * otherwise uses intelligent mock responses with real KPI data.
 */
export function useAIInsightText(kpis: PortfolioKPIs, insights: Insight[]): Map<string, string | null> {
  const { persona } = usePersona();
  const [texts, setTexts] = useState<Map<string, string | null>>(new Map());
  const prevKey = useRef('');

  // Create a stable key from persona + top-level KPIs to detect real changes
  const stateKey = `${persona}-${kpis.totalNOI}-${kpis.portfolioOccupancyRate}-${kpis.buildingCount}`;

  useEffect(() => {
    if (stateKey === prevKey.current) return;
    prevKey.current = stateKey;

    const first4 = insights.slice(0, 4);
    if (first4.length === 0) return;

    // Set loading state
    const loading = new Map<string, string | null>();
    for (const ins of first4) loading.set(ins.id, null);
    setTexts(loading);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

    if (apiKey) {
      // Real API call
      callAnthropicAPI(apiKey, kpis, first4, persona).then((result) => {
        setTexts(result);
      }).catch(() => {
        setTexts(generateFallback(kpis, first4, persona));
      });
    } else {
      // Mock with delay to simulate API
      const timer = setTimeout(() => {
        setTexts(generateFallback(kpis, first4, persona));
      }, 1000 + Math.random() * 500);
      return () => clearTimeout(timer);
    }
  }, [stateKey, insights, kpis, persona]);

  return texts;
}

async function callAnthropicAPI(
  apiKey: string,
  kpis: PortfolioKPIs,
  insights: Insight[],
  persona: string,
): Promise<Map<string, string | null>> {
  const kpiSummary = `Porteføljeverdi: ${formatNOK(kpis.totalPortfolioValue)}. NOI: ${formatNOK(kpis.totalNOI)}. Yield: ${formatPercent(kpis.noiYield)}. Utleiegrad: ${formatPercent(kpis.portfolioOccupancyRate * 100)}. WAULT: ${formatYears(kpis.portfolioWAULT)}. Ledighetskostnad: ${formatNOK(kpis.totalVacancyCost)}. Inntekt i risiko: ${formatNOK(kpis.incomeAtRisk)}. Bygg: ${kpis.buildingCount}.`;

  const cardDescriptions = insights.map((ins, i) => `Kort ${i + 1} (${ins.id}): Tittel="${ins.title}", Verdi="${ins.value}"`).join('\n');

  const body = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Du er en norsk eiendomsanalytiker. Skriv 1-2 setninger med innsikt for hvert av disse 4 KPI-kortene. Bruk faktiske tall. Persona: ${persona}.\n\nPorteføljedata:\n${kpiSummary}\n\nKort:\n${cardDescriptions}\n\nSvar som JSON: {"kort1": "tekst", "kort2": "tekst", "kort3": "tekst", "kort4": "tekst"}`,
    }],
  };

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) throw new Error(`API ${resp.status}`);

  const data = await resp.json();
  const text = data.content?.[0]?.text ?? '';

  try {
    const parsed = JSON.parse(text);
    const result = new Map<string, string | null>();
    insights.forEach((ins, i) => {
      result.set(ins.id, parsed[`kort${i + 1}`] ?? null);
    });
    return result;
  } catch {
    throw new Error('Failed to parse API response');
  }
}

function generateFallback(kpis: PortfolioKPIs, insights: Insight[], persona: string): Map<string, string | null> {
  const result = new Map<string, string | null>();

  for (const ins of insights) {
    result.set(ins.id, generateInsightForCard(ins, kpis, persona));
  }

  return result;
}

function generateInsightForCard(ins: Insight, kpis: PortfolioKPIs, persona: string): string {
  const id = ins.id;

  if (persona === 'eier') {
    if (id === 'noi-trend') return `NOI-utviklingen er ${kpis.noiMargin > 60 ? 'sunn' : 'under press'} med margin på ${formatPercent(kpis.noiMargin)}. Fokuser på kostnadsoptimalisering for å styrke bunnlinjen.`;
    if (id === 'contract-risk') return `${formatPercent(kpis.incomeAtRiskPercent)} av leieinntektene er utsatt. ${kpis.incomeAtRiskPercent > 10 ? 'Start reforhandlinger nå for å sikre kontinuitet.' : 'Akseptabelt risikonivå, men følg opp utløpende kontrakter.'}`;
    if (id === 'vacancy-cost') return `Ledige arealer koster ${formatNOK(kpis.totalVacancyCost)} årlig. ${kpis.buildingsHighVacancy > 0 ? `Prioriter utleie i de ${kpis.buildingsHighVacancy} byggene med høyest ledighet.` : 'God utleiegrad i porteføljen.'}`;
    if (id === 'occupancy') return `Utleiegraden på ${formatPercent(kpis.portfolioOccupancyRate * 100)} er ${kpis.portfolioOccupancyRate > 0.9 ? 'over markedssnitt — sterk posisjon' : 'under target — prioriter aktiv utleie'}.`;
  }

  if (persona === 'investor') {
    if (id === 'yield-spread') return `Yield-forskjellen mellom fondene indikerer ${kpis.noiYield > 5 ? 'god avkastning' : 'potensial for optimalisering'}. Vurder rebalansering mellom core og value-add.`;
    if (id === 'concentration') return `Konsentrasjonsrisikoen er ${kpis.topTenCoverage > 70 ? 'høy — topp 10 dekker ' + formatPercent(kpis.topTenCoverage) : 'moderat'}. Diversifiser leietakerbasen for å redusere enkelteksponering.`;
    if (id === 'wault-benchmark') return `WAULT på ${formatYears(kpis.portfolioWAULT)} gir ${kpis.portfolioWAULT > 5 ? 'god kontantstrømprediktabilitet' : 'kortsiktig reforhandlingsrisiko'}. Effektiv WAULT er ${formatYears(kpis.effectiveWAULT)}.`;
    if (id === 'value-dev') return `Porteføljen er verdsatt til ${formatNOK(kpis.totalPortfolioValue)} med ${formatPercent(kpis.noiYield)} yield. ${kpis.noiYield > 5 ? 'Attraktiv avkastning for institusjonelle investorer.' : 'Yield under markedsnivå — vurder verdiøkende tiltak.'}`;
  }

  if (persona === 'forvalter') {
    if (id === 'client-ranking') return `Porteføljen forvalter ${kpis.buildingCount} bygninger for ${ins.value}. Prioriter kunder med størst verdipotensial og utløpende kontrakter.`;
    if (id === 'expiring-cross') return `${formatNOK(kpis.incomeAtRisk)} i utløpende kontrakter krever proaktiv oppfølging. ${kpis.incomeAtRiskPercent > 10 ? 'Start reforhandlinger umiddelbart.' : 'Moderat risikonivå.'}`;
    if (id === 'cost-comparison') return `Gjennomsnittlig driftskostnad ligger ${kpis.noiMargin > 60 ? 'innenfor normalt' : 'over optimalt'} nivå. Vurder fellesavtaler for å redusere kostnad per m².`;
    if (id === 'aum') return `Total forvaltet kapital på ${formatNOK(kpis.totalPortfolioValue)} gir godt grunnlag for skalafordeler og honorarinntekter.`;
  }

  return ins.detail;
}
