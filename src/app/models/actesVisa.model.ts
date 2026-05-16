export interface ActeVisa {
  id: number;

  agentId?: number;
  agentMatricule?: string;
  agentNom?: string;
  agentPrenom?: string;
  dateEffet: string;

  acte: string;
  typeActe: string;
  imputation: string;

  anneeVisa: string;
  numeroVisa: string;

  dateEnvoiCED: string;

  dateAncienneteAdmin: string;
  dateAncienneteCadre: string;
  dateAncienneteGrade: string;
  dateAncienneteEchelon: string;

  corpsActe: string;
}
