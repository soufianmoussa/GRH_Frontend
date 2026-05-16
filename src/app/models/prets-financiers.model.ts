export interface PretFinancier {
  id?: number;

  agentId?: number;
  agentMatricule?: string;
  agentNom?: string;
  agentPrenom?: string;
  typePret?: string;
  conditions?: string;

  numeroDossier?: string;

  dateOctroi?: string;
  dateFin?: string;

  montant?: number;
  mensualite?: number;
  taux?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
