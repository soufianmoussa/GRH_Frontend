export type AgentDocumentType =
  | 'CARTE_NATIONALE'
  | 'PASSEPORT'
  | 'PERMIS_CONDUIRE'
  | 'CONTRAT_TRAVAIL'
  | 'FICHE_POSTE'
  | 'ATTESTATION_SALAIRE'
  | 'ATTESTATION_TRAVAIL'
  | 'ATTESTATION_RIB'
  | 'ACTE_MARIAGE'
  | 'ACTE_NAISSANCE'
  | 'PHOTO_PROFIL'
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
  ATTESTATION_RIB: 'Attestation de RIB',
  ACTE_MARIAGE: 'Acte de mariage',
  ACTE_NAISSANCE: 'Acte de naissance',
  PHOTO_PROFIL: 'Photo de profil',
  CV: 'CV',
  AUTRE: 'Autre',
};

/** Icon for each document type (PrimeNG / FontAwesome class). */
export const AGENT_DOCUMENT_TYPE_ICONS: Record<AgentDocumentType, string> = {
  CARTE_NATIONALE: 'pi pi-id-card',
  PASSEPORT: 'pi pi-id-card',
  PERMIS_CONDUIRE: 'pi pi-id-card',
  CONTRAT_TRAVAIL: 'pi pi-file-edit',
  FICHE_POSTE: 'pi pi-briefcase',
  ATTESTATION_SALAIRE: 'pi pi-money-bill',
  ATTESTATION_TRAVAIL: 'pi pi-building',
  ATTESTATION_RIB: 'pi pi-credit-card',
  ACTE_MARIAGE: 'pi pi-heart-fill',
  ACTE_NAISSANCE: 'pi pi-baby',
  PHOTO_PROFIL: 'pi pi-camera',
  CV: 'pi pi-file',
  AUTRE: 'pi pi-paperclip',
};

export const AGENT_DOCUMENT_TYPES: { value: AgentDocumentType; label: string }[] =
  (Object.keys(AGENT_DOCUMENT_TYPE_LABELS) as AgentDocumentType[]).map((v) => ({
    value: v,
    label: AGENT_DOCUMENT_TYPE_LABELS[v],
  }));
