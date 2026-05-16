export interface TypeEtablissement {
  id?: number;
  code: string;
  libelle: string;
}

export interface TypeEtablissementCreateUpdateRequest {
  code: string;
  libelle: string;
}
