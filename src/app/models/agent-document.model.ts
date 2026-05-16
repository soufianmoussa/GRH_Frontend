export type AgentDocumentType =
  | 'CARTE_NATIONALE'
  | 'PASSEPORT'
  | 'PERMIS_CONDUIRE'
  | 'CONTRAT_TRAVAIL'
  | 'FICHE_POSTE'
  | 'ATTESTATION_SALAIRE'
  | 'ATTESTATION_TRAVAIL'
  | 'CV'
  | 'AUTRE';

export interface AgentDocument {
  id: number;
  agentId: number;

  documentType: AgentDocumentType;
  title: string;
  description?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;

  createdAt?: string;
  updatedAt?: string;

  fileName?: string;
  fileContentType?: string;
  fileSize?: number;
  fileUrl?: string;
}

export interface AgentDocumentCreateUpdateRequest {
  agentId: number;
  documentType: AgentDocumentType;
  title: string;
  description?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
}

/** User-facing label for each document type. */
export const AGENT_DOCUMENT_TYPE_LABELS: Record<AgentDocumentType, string> = {
  CARTE_NATIONALE: 'Carte nationale',
  PASSEPORT: 'Passeport',
  PERMIS_CONDUIRE: 'Permis de conduire',
  CONTRAT_TRAVAIL: 'Contrat de travail',
  FICHE_POSTE: 'Fiche de poste',
  ATTESTATION_SALAIRE: 'Attestation de salaire',
  ATTESTATION_TRAVAIL: 'Attestation de travail',
  CV: 'CV',
  AUTRE: 'Autre',
};

export const AGENT_DOCUMENT_TYPES: { value: AgentDocumentType; label: string }[] =
  (Object.keys(AGENT_DOCUMENT_TYPE_LABELS) as AgentDocumentType[]).map((v) => ({
    value: v,
    label: AGENT_DOCUMENT_TYPE_LABELS[v],
  }));
