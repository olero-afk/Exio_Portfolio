import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { PersonaType, PersonaConfig, ClientCompany } from '../types/index.ts';
import { PERSONA_CONFIGS } from '../types/index.ts';
import clientsData from '../data/clients.json';

interface PersonaContextValue {
  persona: PersonaType;
  setPersona: (p: PersonaType) => void;
  config: PersonaConfig;
  clients: ClientCompany[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  /** Building IDs visible for forvalter when a client is selected */
  clientBuildingIds: string[] | null;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

// Eier persona uses a subset of buildings (no fund structure)
const EIER_BUILDING_IDS = ['b-001', 'b-002', 'b-003', 'b-005', 'b-008'];

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<PersonaType>('investor');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const config = PERSONA_CONFIGS[persona];
  const clients = clientsData as ClientCompany[];

  const clientBuildingIds = useMemo(() => {
    if (persona === 'forvalter' && selectedClientId) {
      const client = clients.find((c) => c.id === selectedClientId);
      return client?.buildingIds ?? null;
    }
    return null;
  }, [persona, selectedClientId, clients]);

  const value: PersonaContextValue = {
    persona,
    setPersona,
    config,
    clients,
    selectedClientId,
    setSelectedClientId,
    clientBuildingIds,
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const context = useContext(PersonaContext);
  if (!context) throw new Error('usePersona must be used within PersonaProvider');
  return context;
}

export { EIER_BUILDING_IDS };
