export type TypeModification = 'BANCAIRE' | 'ENFANT';
export type StatutModification = 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE';

export interface DocumentInfo {
  id: number;
  originalFileName: string;
  contentType: string;
  size: number;
  url: string;
  fileCategory: string;
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
