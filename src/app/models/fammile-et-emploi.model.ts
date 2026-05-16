export interface FamilleEmploi {
  id?: number;
  famillesEmploi: string;
  description?: string | null;
}


export interface Emploi {
  id?: number;
  emploi: string;
  description?: string | null;

  familleEmploiId: number;
  famillesEmploi?: string | null;
}
