export interface Echelle {
  id: number;
  echelle: string;
  description: string;
  niveauDiplome?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
