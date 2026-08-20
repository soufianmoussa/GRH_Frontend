import type { DocumentFieldCheck, DocumentVerificationStatus } from './onboarding.model';

export type TypeModification = 'BANCAIRE' | 'ENFANT';
export type StatutModification = 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE';

export interface DocumentInfo {
  id: number;
  originalFileName: string;
  contentType: string;
  size: number;
  url: string;
  fileCategory: string;

  /**
   * Verdict OCR du justificatif, calcule au depot de la demande.
   * Le document est confronte aux valeurs DEMANDEES (nouveau RIB, identite de l'enfant),
   * pas aux donnees deja enregistrees : c'est tout l'interet du controle.
   */
  verificationStatus?: DocumentVerificationStatus;
  verificationChecks?: DocumentFieldCheck[];
  verificationMessage?: string;
  verificationConfidence?: number;
  verifiedAt?: string;
}

export interface DemandeModificationDto {
  id: number;
  agentId: number;
  agentNom: string;
  agentPrenom: string;
  agentMatricule: string;
  type: TypeModification;
  statut: StatutModification;
  payload: string;
  dateCreation: string;
  dateTraitement?: string;
  traitePar?: string;
  commentaireAdmin?: string;
  documents: DocumentInfo[];
}
