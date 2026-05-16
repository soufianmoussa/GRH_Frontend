export interface FormationInitiale {
  id?: number;
  code: string;
  libelle: string;
}

export interface FormationInitialeCreateUpdateRequest {
  code: string;
  libelle: string;
}
