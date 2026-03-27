import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { BrregCompany } from '../data/brreg/companies.ts';
import type { PlacePointBuilding } from '../data/placepoint/buildings.ts';
import type { DetectedRole } from '../utils/roleDetection.ts';

export interface TeamMember {
  email: string;
  role: 'admin' | 'bruker';
  status: 'invited' | 'active';
}

export interface BuildingRoleAssignment {
  buildingId: string;
  detectedRole: DetectedRole;
  confirmedRole: DetectedRole;
  fundAssignment?: string;
}

export interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  company: BrregCompany | null;
  companyDisplayName: string;
  companyLogoUrl: string | null;
  konsernEntities: Array<{ organisasjonsnummer: string; navn: string; orgform: string }>;
  teamMembers: TeamMember[];
  discoveredBuildings: PlacePointBuilding[];
  selectedBuildingIds: string[];
  buildingRoles: BuildingRoleAssignment[];
  isComplete: boolean;
}

interface OnboardingContextValue extends OnboardingState {
  setStep: (step: OnboardingState['step']) => void;
  setCompany: (company: BrregCompany) => void;
  setCompanyDisplayName: (name: string) => void;
  setCompanyLogoUrl: (url: string | null) => void;
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (email: string) => void;
  setDiscoveredBuildings: (buildings: PlacePointBuilding[]) => void;
  toggleBuilding: (id: string) => void;
  selectAllBuildings: () => void;
  deselectAllBuildings: () => void;
  setBuildingRole: (buildingId: string, role: DetectedRole) => void;
  setBuildingFund: (buildingId: string, fundId: string) => void;
  setBuildingRoles: (roles: BuildingRoleAssignment[]) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  selectedBuildings: PlacePointBuilding[];
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<OnboardingState['step']>(1);
  const [company, setCompanyState] = useState<BrregCompany | null>(null);
  const [companyDisplayName, setCompanyDisplayName] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [konsernEntities, setKonsernEntities] = useState<OnboardingState['konsernEntities']>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [discoveredBuildings, setDiscoveredBuildings] = useState<PlacePointBuilding[]>([]);
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<string[]>([]);
  const [buildingRoles, setBuildingRolesState] = useState<BuildingRoleAssignment[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const setCompany = useCallback((c: BrregCompany) => {
    setCompanyState(c);
    setCompanyDisplayName(c.navn);
    if (c.konsern) {
      setKonsernEntities(c.konsern.children);
    } else {
      setKonsernEntities([]);
    }
  }, []);

  const addTeamMember = useCallback((member: TeamMember) => {
    setTeamMembers((prev) => [...prev, member]);
  }, []);

  const removeTeamMember = useCallback((email: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.email !== email));
  }, []);

  const toggleBuilding = useCallback((id: string) => {
    setSelectedBuildingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const selectAllBuildings = useCallback(() => {
    setSelectedBuildingIds(discoveredBuildings.map((b) => b.id));
  }, [discoveredBuildings]);

  const deselectAllBuildings = useCallback(() => {
    setSelectedBuildingIds([]);
  }, []);

  const setBuildingRole = useCallback((buildingId: string, role: DetectedRole) => {
    setBuildingRolesState((prev) =>
      prev.map((r) => (r.buildingId === buildingId ? { ...r, confirmedRole: role } : r)),
    );
  }, []);

  const setBuildingFund = useCallback((buildingId: string, fundId: string) => {
    setBuildingRolesState((prev) =>
      prev.map((r) => (r.buildingId === buildingId ? { ...r, fundAssignment: fundId } : r)),
    );
  }, []);

  const setBuildingRoles = useCallback((roles: BuildingRoleAssignment[]) => {
    setBuildingRolesState(roles);
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsComplete(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    setStep(1);
    setCompanyState(null);
    setCompanyDisplayName('');
    setCompanyLogoUrl(null);
    setKonsernEntities([]);
    setTeamMembers([]);
    setDiscoveredBuildings([]);
    setSelectedBuildingIds([]);
    setBuildingRolesState([]);
    setIsComplete(false);
  }, []);

  const selectedBuildings = discoveredBuildings.filter((b) =>
    selectedBuildingIds.includes(b.id),
  );

  const value: OnboardingContextValue = {
    step,
    company,
    companyDisplayName,
    companyLogoUrl,
    konsernEntities,
    teamMembers,
    discoveredBuildings,
    selectedBuildingIds,
    buildingRoles,
    isComplete,
    setStep,
    setCompany,
    setCompanyDisplayName,
    setCompanyLogoUrl,
    addTeamMember,
    removeTeamMember,
    setDiscoveredBuildings,
    toggleBuilding,
    selectAllBuildings,
    deselectAllBuildings,
    setBuildingRole,
    setBuildingFund,
    setBuildingRoles,
    completeOnboarding,
    resetOnboarding,
    selectedBuildings,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
