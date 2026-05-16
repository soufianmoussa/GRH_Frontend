export type JourFerieType = 'NATIONAL' | 'RELIGIEUX';

export interface JourFerie {
  id: number;
  date: string;
  label: string;
  type: JourFerieType;
  recurring: boolean;
  countryCode: string;
}

export interface JourFerieCreateUpdateRequest {
  date: string;
  label: string;
  type: JourFerieType;
  recurring: boolean;
  countryCode?: string;
}
