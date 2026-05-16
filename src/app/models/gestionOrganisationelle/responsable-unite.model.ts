export interface ResponsableUniteDto {
  id?: number;
  uniteId: number;
  agentId: number;
  uniteLibelle?: string;
  uniteType?: string;
  agentNom?: string;
  agentPrenom?: string;
  agentMatricule?: string;

  dateDebut: string;
  dateFin?: string | null;
}

export interface ResponsableUniteCreateUpdateRequest {
  uniteId: number;
  agentId: number;
  dateDebut: string;
  dateFin?: string | null;
}
export interface UniteStructurelleOption {
  id: number;
  libelle: string;
  code: string;
  type?: string;
}

export interface AgentOption {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
}
