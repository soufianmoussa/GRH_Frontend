import {TypeActe} from '../enums/TypeActe';

export interface MouvementModel {
  id?: number;
  agentId?: number;
  matricule?: string;         // derived from agent, read-only
  agentNomComplet?: string;   // derived from agent, read-only
  dateEffet: string;
  acte: string;
  typeActe: TypeActe;
  dateFinPrevisionnelle?: string;
  annule?: boolean;
}
