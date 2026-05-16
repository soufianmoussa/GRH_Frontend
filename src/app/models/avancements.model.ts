export interface Avancement {
  id: number;
  agentId?: number;
  agentMatricule?: string;
  agentNom?: string;
  agentPrenom?: string;
  dateEffet: string | null;
  echelle: string | null;
  echelon: string | null;
  motif: string | null;

  indemResidence: string | null;
  indemSujestion: string | null;
  indemTechnicite: string | null;
  indemEncadrement: string | null;
  allocAdmin: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
