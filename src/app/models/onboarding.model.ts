import type { AgentFullDto } from './agent-full.model';
import type { AuthResponse } from '../core/auth/auth.models';
import { Matricule } from './initialisation-matricules.model';
import { PageResponse } from './PageResponse.model';

export type AgentStatus = 'INCOMPLETE' | 'PENDING_VALIDATION' | 'ACTIVE' | 'REJECTED';
export type OnboardingStatus = 'PROFILE_INCOMPLETE' | 'IN_PROGRESS' | 'PENDING_VALIDATION' | 'VALIDATED' | 'ACTIVE' | 'REJECTED';
export type CompletionMode = 'SELF_SERVICE' | 'ASSISTED';
export type DocumentStatus = 'PENDING_REVIEW' | 'VALIDATED' | 'REJECTED';
export type InvitationStatus = 'PENDING' | 'USED' | 'EXPIRED' | 'REVOKED';

export interface Grade {
  id: number;
  code: string;
  libelle: string;
  description?: string;
  cadre?: string;
  corps?: string;
  administration?: string;
  active?: boolean;
}

export interface EchelleReferential {
  id: number;
  echelle?: string;
  libelle?: string;
  description?: string;
}

export interface EchelonReferential {
  id: number;
  echelon?: string;
  libelle?: string;
  description?: string;
  echelle?: EchelleReferential;
}

export interface PosteOption {
  id: number;
  codeCourt?: string;
  libelleDuPoste?: string;
  libelle?: string;
}

export interface OnboardingInitializeRequest {
  matriculeId?: number | null;
  matricule?: string;
  dateRecrutement: string;
  domaine: string;
  sousDomaine: string;
  posteId: number;
  categorie: string;
  gradeId: number;
  echelleId: number;
  echelonId: number;
  typeContrat: string;
  email: string;
  telephone: string;
}

export interface OnboardingProfileRequest {
  nom?: string;
  prenom?: string;
  cin?: string;
  sexe?: string;
  situation?: string;
  dateNaissance?: string;
  adresse?: string;
  ville?: string;
  telephone?: string;
  email?: string;
  diplome?: string;
  formation?: string;
  observations?: string;
  [key: string]: unknown;
}

export interface OnboardingStep {
  id: number;
  code?: string;
  label?: string;
  title?: string;
  status?: string;
  completedAt?: string;
  completedBy?: string;
  position?: number;
}

export interface OnboardingDocument {
  id: number;
  code?: string;
  type?: string;
  label?: string;
  name?: string;
  required?: boolean;
  status: DocumentStatus;
  fileName?: string;
  fileUrl?: string;
  rejectionReason?: string;
  comment?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  validatedAt?: string;
  validatedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
}

export interface OnboardingActionLog {
  id: number;
  action?: string;
  actor?: string;
  actorRole?: string;
  comment?: string;
  createdAt?: string;
}

export interface InvitationStatusDto {
  status?: InvitationStatus;
  email?: string;
  expiresAt?: string;
  usedAt?: string;
  revokedAt?: string;
  lastSentAt?: string;
  resendCount?: number;
  queuedEmails?: number;
}

export interface OnboardingDetail {
  id: number;
  agent?: AgentFullDto;
  matricule?: Matricule;
  completionMode: CompletionMode;
  status: OnboardingStatus;
  currentStep?: string;
  submittedAt?: string;
  validatedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  steps?: OnboardingStep[];
  documents?: OnboardingDocument[];
  logs?: OnboardingActionLog[];
  invitation?: InvitationStatusDto;
}

export interface InvitationValidationRequest {
  token: string;
}

export interface InvitationValidationResponse {
  valid: boolean;
  status?: InvitationStatus;
  email?: string;
  expiresAt?: string;
  message?: string;
}

export interface InvitationActivationRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface InvitationActivationResponse {
  success: boolean;
  activated?: boolean;
  message?: string;
  auth?: AuthResponse;
}

export type OnboardingPage = PageResponse<OnboardingDetail>;

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  INCOMPLETE: 'Incomplet',
  PENDING_VALIDATION: 'En attente de validation',
  ACTIVE: 'Actif',
  REJECTED: 'Rejete'
};

export const ONBOARDING_STATUS_LABELS: Record<OnboardingStatus, string> = {
  PROFILE_INCOMPLETE: 'Profil incomplet',
  IN_PROGRESS: 'En cours',
  PENDING_VALIDATION: 'En attente de validation',
  VALIDATED: 'Valide',
  ACTIVE: 'Actif',
  REJECTED: 'Rejete'
};

export const COMPLETION_MODE_LABELS: Record<CompletionMode, string> = {
  SELF_SERVICE: 'Agent',
  ASSISTED: 'Assiste RH'
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  PENDING_REVIEW: 'En revue',
  VALIDATED: 'Valide',
  REJECTED: 'Rejete'
};

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  PENDING: 'En attente',
  USED: 'Utilisee',
  EXPIRED: 'Expiree',
  REVOKED: 'Revoquee'
};
