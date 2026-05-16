export type LeaveType =
  | 'ANNUEL'
  | 'MALADIE'
  | 'MATERNITE'
  | 'PATERNITE'
  | 'SANS_SOLDE'
  | 'EXCEPTIONNEL'
  | 'COMPENSATOIRE';

export type TypeOperationSoldeConge =
  | 'INITIALISATION'
  | 'AJOUT'
  | 'DEDUCTION'
  | 'AJUSTEMENT';

export interface SoldeConge {
  id: number;
  agentId: number;
  annee: number;
  typeConge: LeaveType;
  joursBase: number;
  joursReportes: number;
  joursAjustement: number;
  ouvertLe?: string | null;
  premierAnneeEligible?: boolean | null;
}

export interface AgentSoldeSummary {
  agentId: number;
  matricule: string;
  nom: string;
  prenom: string;
  uniteStructurelleId?: number | null;
  uniteStructurelle?: string | null;
  fonction?: string | null;
  annee: number;
  soldesParType: Partial<Record<LeaveType, number>>;
  detailsParType: Partial<Record<LeaveType, SoldeConge>>;
  dateDerniereMiseAJour?: string | null;
}

export interface HistoriqueSoldeConge {
  id: number;
  agentId: number;
  agentNom: string;
  agentPrenom: string;
  agentMatricule: string;
  annee: number;
  typeConge: LeaveType;
  typeOperation: TypeOperationSoldeConge;
  ancienneValeur: number;
  variation: number;
  nouvelleValeur: number;
  commentaire?: string | null;
  dateOperation: string;
  updatedBy?: string | null;
}

export interface InitializeSoldeRequest {
  agentId: number;
  annee: number;
  typeConge: LeaveType;
  joursBase: number;
  commentaire?: string;
  premierAnneeEligible?: boolean;
}

export interface AdjustSoldeRequest {
  agentId: number;
  annee: number;
  typeConge: LeaveType;
  typeOperation: TypeOperationSoldeConge;
  nombreJours: number;
  commentaire?: string;
}

export interface SoldeInitializationResult {
  annee: number;
  agentsProcessed: number;
  soldesCreated: number;
  soldesUpdated: number;
  soldesSkipped: number;
  agentsFailed: number;
}

export interface SoldeCongeCreateUpdateRequest {
  agentId: number;
  annee: number;
  typeConge: LeaveType;
  joursBase: number;
  joursReportes?: number;
  joursAjustement?: number;
  premierAnneeEligible?: boolean | null;
}
