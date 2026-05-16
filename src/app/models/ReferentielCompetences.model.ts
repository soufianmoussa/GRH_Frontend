export interface Competence {
  id?: number;
  competence: string;
  description: string;
  groupeId: number;
}

export interface GroupeCompetence {
  id?: number;
  name: string;
  description?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
