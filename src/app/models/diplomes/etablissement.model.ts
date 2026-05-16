import {TypeEtablissement} from "./type-etablissement.model";

export interface Etablissement {
  id?: number;
  code: string;
  libelle: string;
  typeEtab?: TypeEtablissement;
}

export interface EtablissementCreateUpdateRequest {
  code: string;
  libelle: string;
  typeEtabId?: number;
}
