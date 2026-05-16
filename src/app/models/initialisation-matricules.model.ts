export interface Matricule {
  id: number;

  matricule: string;
  dateRecrutement: string;

  domaine: string;
  sousDomaine: string;
  categorie: string;
  typeContrat: string;

  status?: 'DISPONIBLE' | 'AFFECTE' | 'ARCHIVE';
}

export type MatriculeStatus = 'DISPONIBLE' | 'AFFECTE' | 'ARCHIVE';
