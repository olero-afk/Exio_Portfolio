import { useState, useRef, useEffect } from 'react';
import { usePersona } from '../../context/PersonaContext.tsx';
import type { PortfolioKPIs } from '../../hooks/usePortfolioKPI.ts';
import { formatNOK, formatPercent, formatYears } from '../../utils/formatters.ts';
import './SpørExio.css';

interface SpørExioProps {
  kpis: PortfolioKPIs;
}

const chipsByPersona: Record<string, string[]> = {
  eier: ['Oppsummer for styremøtet', 'Største risiko?', 'Reduser kostnader', 'Reforhandle kontrakter'],
  investor: ['Sammenlign fondene', 'Hvilke bygg selge?', 'Forbered investorrapport', 'Eksponering Oslo?'],
  forvalter: ['Hvilken kunde prioritere?', 'Oppsummer for ledermøtet', 'Kontrakter som utløper', 'Sammenlign kunder'],
};

function generateMockResponse(query: string, kpis: PortfolioKPIs, _persona: string): string {
  const q = query.toLowerCase();

  if (q.includes('styremøte') || q.includes('oppsummer')) {
    return `**Porteføljeoppsummering:**\n\nTotal porteføljeverdi er ${formatNOK(kpis.totalPortfolioValue)} med en NOI på ${formatNOK(kpis.totalNOI)} (yield ${formatPercent(kpis.noiYield)}). Utleiegrad er ${formatPercent(kpis.portfolioOccupancyRate * 100)} og WAULT er ${formatYears(kpis.portfolioWAULT)}.\n\n${kpis.incomeAtRisk > 0 ? `⚠ Inntekt i risiko: ${formatNOK(kpis.incomeAtRisk)} (${formatPercent(kpis.incomeAtRiskPercent)} av total).` : 'Ingen kritiske kontraktsutløp de neste 12 månedene.'}\n\nLedighetskostnad: ${formatNOK(kpis.totalVacancyCost)} fordelt på ${kpis.buildingsHighVacancy} bygg med >10% ledighet.`;
  }

  if (q.includes('risiko')) {
    const topTenant = kpis.topTenants[0];
    return `**Risikovurdering:**\n\n1. **Konsentrasjonsrisiko:** ${topTenant?.tenantName ?? 'Ukjent'} utgjør ${topTenant ? formatPercent(topTenant.percentOfPortfolio) : '0%'} av total leie${topTenant?.isBankrupt ? ' ⚠ KONKURS' : ''}. Topp 10 dekker ${formatPercent(kpis.topTenCoverage)}.\n\n2. **Kontraktsutløp:** ${formatNOK(kpis.incomeAtRisk)} utløper innen 12 mnd (${formatPercent(kpis.incomeAtRiskPercent)}).\n\n3. **Ledighet:** ${kpis.buildingsHighVacancy} bygg har >10% ledighet. Total ledighetskostnad: ${formatNOK(kpis.totalVacancyCost)}.`;
  }

  if (q.includes('kostnad') || q.includes('reduser')) {
    const costPerM2 = kpis.totalRentableM2 > 0 ? kpis.totalOperatingExpenses / kpis.totalRentableM2 : 0;
    return `**Kostnadsanalyse:**\n\nTotale driftskostnader: ${formatNOK(kpis.totalOperatingExpenses)}. Kostnad per m²: ${formatNOK(costPerM2)}/m².\n\nNOI-margin er ${formatPercent(kpis.noiMargin)}. ${kpis.noiMargin < 60 ? 'Marginen er under 60% — vurder å gjennomgå vedlikeholdskostnader og forsikringsavtaler.' : 'Marginen er sunn.'}`;
  }

  if (q.includes('fond') || q.includes('sammenlign fond')) {
    const funds = kpis.fundValues;
    return `**Fondssammenligning:**\n\n${funds.map((f) => `• **${f.fund.name}**: ${formatNOK(f.totalValue)}`).join('\n')}\n\nTotal porteføljeverdi: ${formatNOK(kpis.totalPortfolioValue)}. NOI-yield: ${formatPercent(kpis.noiYield)}.`;
  }

  if (q.includes('selge') || q.includes('bygg')) {
    const worstOcc = [...kpis.filteredBuildings].sort((a, b) => a.occupancyRate - b.occupancyRate).slice(0, 3);
    return `**Salgskandidater (lavest utleiegrad):**\n\n${worstOcc.map((b) => `• **${b.name}**: ${formatPercent(b.occupancyRate * 100)} utleiegrad, ledighetskostnad ${formatNOK((b.totalRentableM2 - b.committedM2) * (b.marketRentPerM2 ?? 0))}`).join('\n')}\n\nVurder bygninger med vedvarende høy ledighet og lav WAULT for salg.`;
  }

  if (q.includes('oslo') || q.includes('eksponering')) {
    const geo = kpis.diversification.byGeography;
    return `**Geografisk eksponering:**\n\n${geo.map((g) => `• **${g.label}**: ${formatPercent(g.percent)} (${formatNOK(g.value)}/år)`).join('\n')}\n\n${geo[0]?.percent > 50 ? `⚠ ${geo[0].label} utgjør over 50% — vurder geografisk diversifisering.` : 'Porteføljen er rimelig diversifisert geografisk.'}`;
  }

  if (q.includes('kunde') || q.includes('prioritere')) {
    return `**Kundeoversikt:**\n\nPorteføljen har ${kpis.buildingCount} bygninger med total verdi ${formatNOK(kpis.totalPortfolioValue)}.\n\nPrioriter kunder med utløpende kontrakter (${formatNOK(kpis.incomeAtRisk)} i risiko) og høy ledighet (${kpis.buildingsHighVacancy} bygg >10%).`;
  }

  if (q.includes('kontrakt') || q.includes('utløp') || q.includes('reforhandle')) {
    const y1 = kpis.expiryProfile[0];
    return `**Kontraktsanalyse:**\n\nWAULT: ${formatYears(kpis.portfolioWAULT)} (effektiv: ${formatYears(kpis.effectiveWAULT)}).\n\n${y1 ? `Y+1: ${formatNOK(y1.expiringRent)} utløper (${y1.contractCount} kontrakter, ${formatPercent(y1.percentOfTotal)} av total).` : 'Ingen kontrakter utløper Y+1.'}\n\nInntekt i risiko (12 mnd): ${formatNOK(kpis.incomeAtRisk)}.`;
  }

  if (q.includes('rapport') || q.includes('investor')) {
    return `**Investorrapport klar:**\n\nPorteføljeverdi: ${formatNOK(kpis.totalPortfolioValue)}\nNOI: ${formatNOK(kpis.totalNOI)} (yield: ${formatPercent(kpis.noiYield)})\nUtleiegrad: ${formatPercent(kpis.portfolioOccupancyRate * 100)}\nWAULT: ${formatYears(kpis.portfolioWAULT)}\n\nGå til Rapporter → Styrerapport for komplett PDF-versjon.`;
  }

  // Default
  return `Porteføljen har ${kpis.buildingCount} bygninger med total verdi ${formatNOK(kpis.totalPortfolioValue)}. NOI: ${formatNOK(kpis.totalNOI)}, utleiegrad: ${formatPercent(kpis.portfolioOccupancyRate * 100)}, WAULT: ${formatYears(kpis.portfolioWAULT)}.\n\nStill gjerne et mer spesifikt spørsmål om risiko, kontrakter, kostnader eller diversifisering.`;
}

export function SpørExio({ kpis }: SpørExioProps) {
  const { persona } = usePersona();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chips = chipsByPersona[persona] ?? chipsByPersona.investor;

  function handleSubmit(text?: string) {
    const q = text ?? query;
    if (!q.trim()) return;
    setIsLoading(true);
    setResponse(null);

    // Simulate API delay
    setTimeout(() => {
      setResponse(generateMockResponse(q, kpis, persona));
      setIsLoading(false);
    }, 800 + Math.random() * 600);
  }

  function handleChipClick(chip: string) {
    setQuery(chip);
    handleSubmit(chip);
  }

  function handleClose() {
    setResponse(null);
    setQuery('');
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="spor-exio">
      <span className="spor-exio__badge">✦ EXIO AI</span>
      <div className="spor-exio__input-row">
        <span className="spor-exio__sparkle">✦</span>
        <input
          ref={inputRef}
          className="spor-exio__input"
          placeholder="Spør Exio om porteføljen din..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={isLoading}
        />
        <button
          className="spor-exio__send"
          onClick={() => handleSubmit()}
          disabled={!query.trim() || isLoading}
        >
          →
        </button>
      </div>

      {!response && !isLoading && (
        <div className="spor-exio__chips">
          {chips.map((chip) => (
            <button key={chip} className="spor-exio__chip" onClick={() => handleChipClick(chip)}>
              {chip}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="spor-exio__loading">
          <span className="spor-exio__loading-dot" />
          <span className="spor-exio__loading-text">Exio tenker...</span>
        </div>
      )}

      {response && (
        <div className="spor-exio__response">
          <button className="spor-exio__close" onClick={handleClose}>✕</button>
          <div className="spor-exio__response-text">
            {response.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return <h4 key={i} className="spor-exio__response-heading">{line.replace(/\*\*/g, '')}</h4>;
              }
              if (line.startsWith('• **')) {
                const parts = line.replace('• **', '').split('**:');
                return <div key={i} className="spor-exio__response-bullet"><strong>{parts[0]}</strong>:{parts[1] ?? ''}</div>;
              }
              if (line.startsWith('⚠')) {
                return <div key={i} className="spor-exio__response-warning">{line}</div>;
              }
              if (line === '') return <br key={i} />;
              return <p key={i} className="spor-exio__response-para">{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
