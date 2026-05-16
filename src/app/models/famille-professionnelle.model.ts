export interface FamilleProfessionnelle {
  id?: number;
  famille: string;
  description?: string | null;
}

export interface SousFamille {
  id?: number;
  sousFamille: string;
  description?: string | null;

  familleProfessionnelleId: number;
  famille?: string | null;
}
