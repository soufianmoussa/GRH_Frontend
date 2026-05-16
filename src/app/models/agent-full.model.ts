import { Matricule } from './initialisation-matricules.model';

export type TypeAdresse = 'PRINCIPALE' | 'SECONDAIRE' | 'TRAVAIL' | 'AUTRE';

export interface AdresseDto {
  id?: number;
  type?: TypeAdresse;
  adresse?: string;
  codePostal?: string;
  localite?: string;
  ville?: string;
  pays?: string;
  telephone?: string;
}

export interface CoordonneesBancairesDto {
  id?: number;
  banque?: string;
  compte?: string;
  iban?: string;
  rib?: string;
  dateOuverture?: string;
  dateValidite?: string;
}

export interface CoordonneesProfessionnellesDto {
  id?: number;
  emailPro?: string;
  telFixe?: string;
  telPortable?: string;
  bureau?: string;
}

export interface ConjointDto {
  id?: number;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  pays?: string;
  profession?: string;
  cin?: string;
  lieu?: string;
  nationalite?: string;
  dateSituation?: string;
  matricule?: string;
}

export interface EnfantDto {
  id?: number;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  sexe?: 'M' | 'F' | string;
  situation?: 'C' | 'M' | 'V' | 'D';
  niveauScolaire?: string;
}

/** Payload envoyé au backend pour créer/mettre à jour un dossier agent. */
export interface AgentCreateRequest {
  /** Null à la création (matricule créé en même temps) ; renseigné en édition. */
  matriculeId: number | null;

  // --- Données matricule (saisies dans Step 1) ---
  matricule?: string;
  dateRecrutement?: string;
  domaine?: string;
  sousDomaine?: string;
  categorie?: string;
  typeContrat?: string;

  nom: string;
  prenom: string;
  cin: string;
  sexe?: string;
  situation?: 'C' | 'M' | 'V' | 'D';
  dateNaissance?: string;
  nomTuteurAr?: string;
  prenomTuteurAr?: string;
  pprTuteur?: string;
  dateTutorat?: string;
  numEnfant?: number;

  adresses?: AdresseDto[];
  coordonneesBancaires?: CoordonneesBancairesDto;
  coordonneesProfessionnelles?: CoordonneesProfessionnellesDto;
  conjoint?: ConjointDto | null;
  enfants?: EnfantDto[];
}

/** Résumé léger d'un agent pour l'affichage "organigramme" / collègues. */
export interface AgentSummaryDto {
  id: number;
  nom?: string;
  prenom?: string;
  matricule?: string;
  posteLibelle?: string;
}

/** Vue "Travail" : infos pro + mini-organigramme. */
export interface AgentTravailDto {
  affectationActive: boolean;
  posteId?: number;
  posteLibelle?: string;
  posteCodeCourt?: string;
  uniteId?: number;
  uniteLibelle?: string;
  uniteType?: string;
  dateDebutAffectation?: string;
  superieur?: AgentSummaryDto | null;
  agent?: AgentSummaryDto;
  collegues?: AgentSummaryDto[];
}

/** Réponse complète (lecture / édition). */
export interface AgentFullDto {
  id: number;
  matricule: Matricule;

  nom: string;
  prenom: string;
  cin: string;
  sexe?: string;
  situation?: 'C' | 'M' | 'V' | 'D';
  dateNaissance?: string;
  nomTuteurAr?: string;
  prenomTuteurAr?: string;
  pprTuteur?: string;
  dateTutorat?: string;
  numEnfant?: number;

  adresses?: AdresseDto[];
  coordonneesBancaires?: CoordonneesBancairesDto;
  coordonneesProfessionnelles?: CoordonneesProfessionnellesDto;
  conjoint?: ConjointDto;
  enfants?: EnfantDto[];
}
