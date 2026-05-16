export interface AffectationAgentPosteDto {
  id?: number;
  agentId: number;
  agentNom?: string;
  agentPrenom?: string;
  agentMatricule?: string;
  posteId: number;
  posteLibelle?: string;
  posteCodeCourt?: string;
  uniteLibelle?: string;
  dateDebut: string;
  dateFin?: string | null;
  statut: StatutAffectation;
  motif?: string | null;
}

export interface AffectationAgentPosteCreateRequest {
  agentId: number;
  posteId: number;
  dateDebut: string;
  dateFin?: string | null;
  motif?: string | null;
}

export interface AffectationAgentPosteUpdateRequest {
  dateDebut: string;
  dateFin?: string | null;
  motif?: string | null;
}

export type StatutAffectation = 'ACTIVE' | 'CLOTUREE';

export interface PosteOption {
  id: number;
  codeCourt: string;
  libelleDuPoste: string;
}
