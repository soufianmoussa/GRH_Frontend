import type { DocumentFieldCheck, DocumentVerificationStatus } from './onboarding.model';

export interface StoredFileDto {
  id: number;
  originalFileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  fileCategory: string;
  agentId: number;
  url: string;

  /**
   * Verdict OCR du justificatif, calcule au depot du document.
   * Pour un justificatif de conge, le document est confronte a l'identite de l'agent
   * demandeur et aux dates de la periode demandee.
   */
  verificationStatus?: DocumentVerificationStatus;
  verificationChecks?: DocumentFieldCheck[];
  verificationMessage?: string;
  verificationConfidence?: number;
  verifiedAt?: string;
}
