export interface Diplome {
  id: number;
  agentId: number;
  agentNom?: string;
  agentPrenom?: string;
  agentMatricule?: string;
  dateObtention: string;

  niveau?: string;
  etablissement?: string;
  specialite?: string;

  codePays: string;
  mention: string;
  moyenne: number;
  scanUrl?: string;
  scanFileName?: string;
}

export interface DiplomeCreateUpdateRequest {
  agentId: number;
  dateObtention: string;

  niveau?: string;
  etablissement?: string;
  specialite?: string;

  codePays: string;
  mention: string;
  moyenne: number;
}
