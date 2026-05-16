export interface PosteTravailDTO {
  id?: number;
  designationObjet: string;
  description?: string;

  familleProfessionnelleId?: number | null;
  familleProfessionnelleLibelle?: string;

  familleEmploiId?: number | null;
  familleEmploiLibelle?: string;

  emploiId?: number | null;
  emploiLibelle?: string;

  activiteIds?: number[];
}

export interface ActiviteDTO {
  id?: number;
  designationObjet: string;
  description?: string;
  ordreAffichage?: number | null;

  posteTravailId?: number | null;
  posteTravailDesignation?: string;
}

export interface ActiviteCreateUpdateRequest {
  designationObjet: string;
  description?: string;
  ordreAffichage?: number | null;
  posteTravailId: number;
}
