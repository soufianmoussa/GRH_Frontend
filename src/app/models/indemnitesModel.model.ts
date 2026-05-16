export interface IndemniteComplementaire {
  id?: number;
  agentId?: number;
  agentMatricule?: string;
  agentNom?: string;
  agentPrenom?: string;
  rubrique: string;
  montantRubrique: number;
  nombre: number;
  uniteTempsMesure: string;
  dateOrigine: string;
}



export interface IndemnitePermanente {
  id?: number;
  agentId?: number;
  agentMatricule?: string;
  agentNom?: string;
  agentPrenom?: string;
  dateDebutAttribution: string;
  dateFinAttribution: string;
  rubrique: string;
  montantRubrique: number;
  nombreTaux: number;
  uniteTempsMesure: string;
}
