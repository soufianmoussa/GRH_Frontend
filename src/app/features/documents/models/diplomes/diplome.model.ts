import { NiveauDiplome } from './niveau-diplome.model';
import { Etablissement } from './etablissement.model';
import { Specialite } from './specialite.model';

export interface Diplome {
  id: number;
  agentId: number;
  agentNom?: string;
  agentPrenom?: string;
  agentMatricule?: string;
  dateObtention: string;

  niveau?: NiveauDiplome;
  etablissement?: Etablissement;
  specialite?: Specialite;

  codePays: string;
  mention: string;
  moyenne: number;
  scanUrl?: string;
  scanFileName?: string;
}

export interface DiplomeCreateUpdateRequest {
  agentId: number;
  dateObtention: string;

  niveauId?: number;
  etablissementId?: number;
  specialiteId?: number;

  codePays: string;
  mention: string;
  moyenne: number;
}
