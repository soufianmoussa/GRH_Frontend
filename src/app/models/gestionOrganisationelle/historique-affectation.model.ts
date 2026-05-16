export interface HistoriqueAffectation {
  id?: number;
  matricule: string;
  dateEffet: string | null;
  ancienneImpBudg: string;
  ancienneLocalite: string;
  nouvelleImpBudg: string;
  nouvelleLocalite: string;
}
