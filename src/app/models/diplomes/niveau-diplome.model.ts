export interface NiveauDiplome {
  id?: number;
  code: string;
  libelle: string;
}

export interface NiveauDiplomeCreateUpdateRequest {
  code: string;
  libelle: string;
}
