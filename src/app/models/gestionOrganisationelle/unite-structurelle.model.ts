import { TypeUniteStructurelle } from '../../enums/type-unite-structurelle.enum';
export interface UniteStructurelle {
  id?: number;
  code: string;
  abreviation: string;
  libelle: string;
  type: TypeUniteStructurelle;
  parentId?: number | null;
}

export interface UniteStructurelleCreateUpdateRequest {
  code: string;
  abreviation: string;
  libelle: string;
  type: TypeUniteStructurelle;
  parentId?: number | null;
}
