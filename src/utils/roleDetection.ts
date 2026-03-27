import type { PlacePointBuilding } from '../data/placepoint/buildings.ts';

export type DetectedRole = 'eier' | 'investor' | 'forvalter';

export function detectRole(
  building: PlacePointBuilding,
  userOrgNr: string,
  konsernOrgNrs: string[],
): DetectedRole {
  if (building.hjemmelshaver.organisasjonsnummer === userOrgNr) return 'eier';
  if (konsernOrgNrs.includes(building.hjemmelshaver.organisasjonsnummer)) return 'investor';
  return 'forvalter';
}

export const ROLE_LABELS: Record<DetectedRole, string> = {
  eier: 'Eier',
  investor: 'Investor',
  forvalter: 'Forvalter',
};

export const ROLE_COLORS: Record<DetectedRole, string> = {
  eier: '#4ade80',
  investor: '#22d4e8',
  forvalter: '#FED092',
};
