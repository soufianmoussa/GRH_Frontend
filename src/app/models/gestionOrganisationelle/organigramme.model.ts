import { TypeUniteStructurelle } from '../../enums/type-unite-structurelle.enum';

export type StatutResponsable = 'ACTIF' | 'EXPIRE';
export type StatutPoste = 'OCCUPE' | 'VACANT';

export interface OrganigrammeResponsable {
  agentId: number;
  nomComplet: string;
  matricule?: string | null;
  statut: StatutResponsable;
}

export interface OrganigrammePoste {
  id: number;
  codeCourt: string;
  libelle: string;
  fonction?: string | null;
  occupant?: string | null;
  statut: StatutPoste;
}

export interface OrganigrammeNode {
  id: number;
  code: string;
  abreviation: string;
  libelle: string;
  type: TypeUniteStructurelle;
  parentId?: number | null;
  responsable?: OrganigrammeResponsable | null;
  postes: OrganigrammePoste[];
  children: OrganigrammeNode[];
}
