export type StatutDemande = 'En attente' | 'Approuvé' | 'Rejetée' | 'Validée' | 'Traitée';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DemandeConge {
  id: number;
  matricule: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  dateCreation: string;
  statut: StatutDemande;
}

export interface DemandeAttestation {
  id: number;
  matricule: string;
  type: string;
  numero: string;
  dateCreation: string;
  statut: StatutDemande;
}
