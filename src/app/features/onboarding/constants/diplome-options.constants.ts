/**
 * Curated lists for the Diplome dialog (admin & agent onboarding wizards).
 * These are suggestions for the p-autoComplete component — the user can still
 * enter any custom value (free text) since the backend stores plain strings.
 *
 * Niveaux : main academic levels in the Moroccan public sector.
 * Specialites : technical & administrative domains commonly seen on agent files.
 * Etablissements : major Moroccan universities + grandes ecoles. Free entries
 *                  allowed for foreign or unreferenced institutions.
 * Mentions : standard French academic mentions.
 */

export const DIPLOME_NIVEAUX: string[] = [
  'Baccalaureat',
  'Technicien',
  'Technicien Specialise',
  'DEUG',
  'DEUP',
  'DUT',
  'BTS',
  'Licence Professionnelle',
  'Licence Fondamentale',
  'Licence',
  'Master Specialise',
  'Master',
  "Diplome d'Ingenieur d'Etat",
  'Doctorat',
  'Habilitation Universitaire',
  'Autre'
];

export const DIPLOME_SPECIALITES: string[] = [
  'Informatique',
  'Genie Logiciel',
  'Reseaux et Telecommunications',
  'Cybersecurite',
  "Systemes d'Information",
  'Data Science',
  'Intelligence Artificielle',
  'Big Data',
  'Cloud Computing',
  'Business Intelligence',
  'Mathematiques',
  'Statistiques',
  'Electronique',
  'Genie Electrique',
  'Genie Industriel',
  'Genie Civil',
  'Gestion',
  'Comptabilite',
  'Finance',
  'Audit',
  'Controle de Gestion',
  'Marketing',
  'Commerce',
  'Economie',
  'Droit',
  'Administration Publique',
  'Ressources Humaines',
  'Communication',
  'Medecine',
  'Pharmacie',
  'Agronomie',
  'Architecture',
  'Autre'
];

export const DIPLOME_ETABLISSEMENTS: string[] = [
  'Universite Mohammed V',
  'Universite Hassan II',
  'Universite Ibn Tofail',
  'Universite Chouaib Doukkali',
  'Universite Cadi Ayyad',
  'Universite Sidi Mohamed Ben Abdellah',
  'Universite Ibn Zohr',
  'Universite Mohammed Premier',
  'Universite Hassan Premier',
  'Universite Moulay Ismail',
  'Al Akhawayn University',
  'Universite Internationale de Rabat',
  'UM6P',
  'EMI',
  'ENSIAS',
  'INPT',
  'INSEA',
  'ENSA',
  'ENSET',
  'FST',
  'EST',
  'EHTP',
  'ENSAM'
];

export const DIPLOME_MENTIONS: string[] = [
  'Passable',
  'Assez Bien',
  'Bien',
  'Tres Bien',
  'Excellent',
  'Sans Mention'
];
