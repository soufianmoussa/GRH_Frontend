import {FormationInitiale} from "./formation-initiale.model";

export interface Specialite {
  id?: number;
  code: string;
  libelle: string;
  formationInitiale?: FormationInitiale;
}

export interface SpecialiteCreateUpdateRequest {
  code: string;
  libelle: string;
  formationInitialeId?: number;
}
