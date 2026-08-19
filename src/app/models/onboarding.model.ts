import type { AgentDocumentType } from './agent-document.model';
import type { AgentFullDto } from './agent-full.model';
import type { AuthResponse } from '../core/auth/auth.models';
import { Matricule } from './initialisation-matricules.model';
import { PageResponse } from './PageResponse.model';

export type AgentStatus = 'INCOMPLETE' | 'PENDING_VALIDATION' | 'ACTIVE' | 'REJECTED';
export type OnboardingStatus = 'PROFILE_INCOMPLETE' | 'IN_PROGRESS' | 'PENDING_VALIDATION' | 'VALIDATED' | 'ACTIVE' | 'REJECTED';
export type CompletionMode = 'SELF_SERVICE' | 'ASSISTED';
export type DocumentStatus = 'PENDING_REVIEW' | 'VALIDATED' | 'REJECTED';
export type InvitationStatus = 'PENDING' | 'USED' | 'EXPIRED' | 'REVOKED';
export type OnboardingStepType =
  | 'MATRICULE_ALLOCATION'
  | 'ACCOUNT_ACTIVATION'
  | 'PROFILE'
  | 'DOCUMENTS'
  | 'REVIEW'
  | 'VALIDATION';
export type OnboardingStepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

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
  /** Canonical step (backend Slice 1: replaces the legacy free-form `stepKey`). */
  stepType?: OnboardingStepType;
  /**
   * @deprecated Backwards-compatible alias for {@link stepType}. Read `stepType` instead.
   * TODO(post-release): remove once the backend drops the legacy `getStepKey()` JSON alias.
   */
  stepKey?: string;
  code?: string;
  label?: string;
  title?: string;
  status?: OnboardingStepStatus | string;
  completedAt?: string;
  completedBy?: string;
  position?: number;
}

/** Verdict de la vérification OCR d'une pièce (backend {@code DocumentVerificationStatus}). */
export type DocumentVerificationStatus =
  | 'MATCH'
  | 'MISMATCH'
  | 'MISSING'
  | 'ERROR'
  | 'UNSUPPORTED';

/** Confrontation d'une information entre le document scanné et la fiche de l'agent. */
export interface DocumentFieldCheck {
  field: string;
  label: string;
  /** Valeur enregistrée dans le SIRH. */
  expected?: string;
  /** Valeur lue sur le document (absente lorsque le statut est MISSING). */
  extracted?: string;
  status: DocumentVerificationStatus;
}

/**
 * Ligne de revue d'une pièce du dossier d'onboarding — miroir exact du backend
 * {@code OnboardingDocumentDto}. C'est la SEULE source de la liste de documents côté admin :
 * les pièces agent y sont projetées, il ne faut donc plus les afficher une seconde fois.
 */
export interface OnboardingDocument {
  id: number;
  /** Pièce agent source (AgentDocument) dont cette ligne est la projection. */
  agentDocumentId?: number;
  documentType?: AgentDocumentType;
  title?: string;
  required?: boolean;
  status: DocumentStatus;
  storedFileId?: number;
  fileName?: string;
  fileContentType?: string;
  fileSize?: number;
  fileUrl?: string;
  uploadedById?: number;
  uploadedAt?: string;
  reviewedById?: number;
  reviewedAt?: string;
  rejectionReason?: string;

  // --- Vérification OCR (Azure Document Intelligence) ---
  verificationStatus?: DocumentVerificationStatus;
  /** Confiance Azure [0..1] sur l'extraction. */
  confidenceScore?: number;
  analyzedAt?: string;
  verificationChecks?: DocumentFieldCheck[];
  verificationMessage?: string;
  /** Vrai si la décision manuelle de l'admin contredit le verdict automatique. */
  manualOverride?: boolean;
  /** Faux pour les types sans comparaison automatique possible (photo de profil). */
  verifiable?: boolean;
}

/**
 * Mirrors the backend {@code OnboardingActionLogDto}. The backend sends
 * {@code actorUserId} and {@code metadataJson}; the older display fields
 * ({@code actor}, {@code actorRole}, {@code comment}) are kept as optional
 * aliases for legacy callers and can be removed after the next release.
 */
export interface OnboardingActionLog {
  id: number;
  action?: string;
  actorUserId?: number;
  metadataJson?: string;
  createdAt?: string;
  /** @deprecated never populated by the backend, kept until consumers are migrated. */
  actor?: string;
  /** @deprecated never populated by the backend, kept until consumers are migrated. */
  actorRole?: string;
  /** @deprecated never populated by the backend, kept until consumers are migrated. */
  comment?: string;
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
  /** Backend serialises {@link OnboardingStepType} as its string name; this stays wire-compatible. */
  currentStep?: OnboardingStepType | string;
  /** Single source of truth for progress, computed by the backend (0-100). */
  progressPercent?: number;
  submittedAt?: string;
  validatedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  steps?: OnboardingStep[];
  documents?: OnboardingDocument[];
  /**
   * Audit trail of admin/agent actions on the dossier.
   * Wire-aligned with backend {@code OnboardingDetailDto.actionLogs} since Slice 1.
   * (Pre-Slice-5 the frontend read {@code logs} and silently got nothing.)
   */
  actionLogs?: OnboardingActionLog[];
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

export const VERIFICATION_STATUS_LABELS: Record<DocumentVerificationStatus, string> = {
  MATCH: 'Concordant',
  MISMATCH: 'Ecart detecte',
  MISSING: 'Information absente',
  ERROR: 'Analyse impossible',
  UNSUPPORTED: 'Non verifiable'
};

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  PENDING: 'Envoyee',
  USED: 'Activee',
  EXPIRED: 'Expiree',
  REVOKED: 'Annulee'
};
