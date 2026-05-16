export interface Anciennete {
  id?: number;
  agentId?: number;
  agentMatricule?: string;
  agentNom?: string;
  agentPrenom?: string;
  admin?: string | null;
  cadre?: string | null;
  grade?: string | null;
  echelon?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
