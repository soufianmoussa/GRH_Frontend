export interface Communication {
  id?: number;

  agentId?: number;
  agentMatricule?: string;
  agentNom?: string;
  agentPrenom?: string;
  dateRecrutement?: string;

  email?: string;
  telephoneDomicile?: string;
  fax?: string;
  gsm?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
