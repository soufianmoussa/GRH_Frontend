export interface ServiceAnterieur {
  id?: number;

  agentId?: number;
  agentMatricule?: string;
  agentNom?: string;
  agentPrenom?: string;
  dateDebut: string | null;
  finValidite: string | null;
  localite: string;
  codePays: string;

  activite: string;
  typeContrat: string;
  serviceValidable: string;
  grade: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
