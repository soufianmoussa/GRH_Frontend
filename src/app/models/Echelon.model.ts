import {Echelle} from "./Echelle.model";

export interface Echelon {
  id: number;
  echelon: string;
  description: string;
  echelle: Echelle;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
