import { ActStatus } from '../enums/ActStatus';

/** Vue de lecture d'une sanction (miroir de SanctionDto backend). */
export interface Sanction {
  id: number;

  agentId: number;
  matricule: string;
  agentNomComplet: string;

  status: ActStatus;
  statusLabel: string;

  numeroDecision: string;
  dateDecision?: string;
  dateEffet?: string;
  dateFin?: string;
  motif?: string;

  sanctionType: string;
  sanctionTypeLabel: string;
  degre?: number;
  dateFaute?: string;
  reductionTraitement?: number;
  dateAmnistie?: string;

  createdBy?: string;
  createdAt?: string;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;

  documentCount: number;
}

/** Corps de création / modification (miroir de SanctionCreateUpdateRequest). */
export interface SanctionRequest {
  agentId: number | null;
  sanctionType: string | null;
  dateEffet: string | null;
  dateFin?: string | null;
  dateFaute?: string | null;
  motif?: string | null;
  reductionTraitement?: number | null;
  dateAmnistie?: string | null;
}

/** Option de référentiel renvoyée par /types et /statuses. */
export interface EnumOption {
  value: string;
  label: string;
  degre?: number;
}
