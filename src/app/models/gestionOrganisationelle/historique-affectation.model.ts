import { StatutAffectation } from './affectation-agent-poste.model';

export type MouvementType = 'CREATION' | 'TRANSFERT' | 'CLOTURE';

export interface HistoriqueAffectationDto {
  id: number;

  type: MouvementType;
  statut: StatutAffectation;

  dateEffet: string;
  createdAt?: string | null;

  agentId?: number | null;
  matricule?: string;
  agentNom?: string;
  agentPrenom?: string;

  ancienPosteId?: number | null;
  ancienPosteLibelle?: string;
  ancienPosteCodeCourt?: string;

  nouveauPosteId?: number | null;
  nouveauPosteLibelle?: string;
  nouveauPosteCodeCourt?: string;

  ancienneUniteId?: number | null;
  ancienneUniteLibelle?: string;

  nouvelleUniteId?: number | null;
  nouvelleUniteLibelle?: string;

  motif?: string | null;
  performedBy?: string | null;

  ancienneImpBudg?: string;
  ancienneLocalite?: string;
  nouvelleImpBudg?: string;
  nouvelleLocalite?: string;
}

export interface HistoriqueAffectationTimelineDto {
  id: number;
  type: MouvementType;
  statut: StatutAffectation;
  dateEffet: string;
  ancienPosteLibelle?: string;
  nouveauPosteLibelle?: string;
  ancienneUniteLibelle?: string;
  nouvelleUniteLibelle?: string;
  motif?: string | null;
  performedBy?: string | null;
}

export interface AuditCenterStats {
  totalMouvements: number;
  affectationsActives: number;
  transferts: number;
  postesLiberes: number;
  affectationsCloturees: number;
}

export interface HistoriqueAffectationFilters {
  global?: string;
  agentId?: number | null;
  matricule?: string;
  uniteId?: number | null;
  posteId?: number | null;
  type?: MouvementType | null;
  statut?: StatutAffectation | null;
  performedBy?: string;
  dateEffetFrom?: string;
  dateEffetTo?: string;
}
