export type EchelleBusinessKey = '6' | '7' | '8' | '9' | '10' | '11' | 'HORS_ECHELLE';
export type EchelonBusinessKey =
  '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | 'EXCEPTIONNEL';

export interface BusinessEchelleOption {
  key: EchelleBusinessKey;
  label: string;
}

export interface BusinessEchelonOption {
  key: EchelonBusinessKey;
  label: string;
}

export interface BusinessGradeOption {
  code: string;
  label: string;
  group: string;
  echelleKeys: EchelleBusinessKey[];
}

export const BUSINESS_ECHELLES: BusinessEchelleOption[] = [
  { key: '6', label: 'Echelle 6 - Execution' },
  { key: '7', label: 'Echelle 7 - Execution qualifiee' },
  { key: '8', label: 'Echelle 8 - Maitrise' },
  { key: '9', label: 'Echelle 9 - Technicien / maitrise superieure' },
  { key: '10', label: 'Echelle 10 - Cadres moyens' },
  { key: '11', label: 'Echelle 11 - Cadres superieurs' },
  { key: 'HORS_ECHELLE', label: 'Hors Echelle - Haute responsabilite' }
];

export const BUSINESS_ECHELONS: BusinessEchelonOption[] = [
  { key: '1', label: 'Echelon 1' },
  { key: '2', label: 'Echelon 2' },
  { key: '3', label: 'Echelon 3' },
  { key: '4', label: 'Echelon 4' },
  { key: '5', label: 'Echelon 5' },
  { key: '6', label: 'Echelon 6' },
  { key: '7', label: 'Echelon 7' },
  { key: '8', label: 'Echelon 8' },
  { key: '9', label: 'Echelon 9' },
  { key: '10', label: 'Echelon 10' },
  { key: '11', label: 'Echelon 11' },
  { key: 'EXCEPTIONNEL', label: 'Echelon exceptionnel' }
];

export const BUSINESS_GRADES: BusinessGradeOption[] = [
  { code: 'ADM_AA_4', group: 'Administration', label: 'Adjoint administratif 4e grade', echelleKeys: ['6'] },
  { code: 'ADM_AA_3', group: 'Administration', label: 'Adjoint administratif 3e grade', echelleKeys: ['7'] },
  { code: 'ADM_RED_4', group: 'Administration', label: 'Redacteur 4e grade', echelleKeys: ['8'] },
  { code: 'ADM_RED_3', group: 'Administration', label: 'Redacteur 3e grade', echelleKeys: ['9'] },
  { code: 'ADM_ADMIN_3', group: 'Administration', label: 'Administrateur 3e grade', echelleKeys: ['10'] },
  { code: 'ADM_ADMIN_2', group: 'Administration', label: 'Administrateur 2e grade', echelleKeys: ['11'] },
  { code: 'ADM_ADMIN_1', group: 'Administration', label: 'Administrateur 1er grade', echelleKeys: ['HORS_ECHELLE'] },
  { code: 'TECH_4', group: 'Techniciens', label: 'Technicien 4e grade', echelleKeys: ['8'] },
  { code: 'TECH_3', group: 'Techniciens', label: 'Technicien 3e grade', echelleKeys: ['9'] },
  { code: 'TECH_2', group: 'Techniciens', label: 'Technicien 2e grade', echelleKeys: ['10'] },
  { code: 'TECH_1', group: 'Techniciens', label: 'Technicien 1er grade', echelleKeys: ['11'] },
  { code: 'ING_ETAT_1', group: 'Ingenieurs', label: 'Ingenieur d Etat 1er grade', echelleKeys: ['11'] },
  { code: 'ING_PRINCIPAL', group: 'Ingenieurs', label: 'Ingenieur principal', echelleKeys: ['HORS_ECHELLE'] },
  { code: 'ENS_PRIMAIRE', group: 'Enseignement', label: 'Professeur enseignement primaire', echelleKeys: ['10'] },
  { code: 'ENS_SECONDAIRE', group: 'Enseignement', label: 'Professeur enseignement secondaire', echelleKeys: ['10'] },
  { code: 'ENS_AGREGE', group: 'Enseignement', label: 'Professeur agrege', echelleKeys: ['11'] },
  { code: 'ENS_INSPECTEUR', group: 'Enseignement', label: 'Inspecteur', echelleKeys: ['HORS_ECHELLE'] },
  { code: 'SANTE_INFIRMIER', group: 'Sante', label: 'Infirmier', echelleKeys: ['10'] },
  { code: 'SANTE_MEDECIN', group: 'Sante', label: 'Medecin', echelleKeys: ['11'] },
  { code: 'SANTE_PHARMACIEN', group: 'Sante', label: 'Pharmacien', echelleKeys: ['11'] },
  { code: 'SANTE_CHIRURGIEN', group: 'Sante', label: 'Chirurgien', echelleKeys: ['HORS_ECHELLE'] },
  { code: 'JUST_GREFFIER', group: 'Justice et securite', label: 'Greffier', echelleKeys: ['8', '9', '10'] },
  { code: 'SEC_COMMISSAIRE', group: 'Justice et securite', label: 'Commissaire', echelleKeys: ['11'] },
  { code: 'SEC_OFFICIER_POLICE', group: 'Justice et securite', label: 'Officier de police', echelleKeys: ['10'] },
  { code: 'JUST_MAGISTRAT', group: 'Justice et securite', label: 'Magistrat', echelleKeys: ['HORS_ECHELLE'] }
];
