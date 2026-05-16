export type CategorieNaissance = 'NORMALE' | 'CESARIENNE' | 'MULTIPLE' | 'PREMATUREE';

export interface CongeMaternite {
  id?: number;
  agentId?: number;
  agentMatricule?: string;
  agentNom?: string;
  agentPrenom?: string;

  dateDebut: string | null;
  dateFin: string | null;

  dateDeclarationEmployeur: string | null;
  dateAccouchementPrevue: string | null;
  dateAccouchementEffective: string | null;
  dateDeclarationAutorite: string | null;

  categorieNaissance: CategorieNaissance | null;
}
