import {NiveauDiplome} from "./diplomes/niveau-diplome.model";

export interface Echelle {
  id: number;
  echelle: string;
  description: string;
  niveauDiplome?: NiveauDiplome;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
