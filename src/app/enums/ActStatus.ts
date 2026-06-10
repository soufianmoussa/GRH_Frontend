/**
 * Cycle de vie d'un acte administratif (miroir de l'enum backend ActStatus).
 * Fournit les libellés FR et la « severity » PrimeNG pour les badges colorés.
 */
export enum ActStatus {
  BROUILLON = 'BROUILLON',
  SOUMIS = 'SOUMIS',
  EN_VALIDATION_RH = 'EN_VALIDATION_RH',
  EN_VALIDATION_RESPONSABLE = 'EN_VALIDATION_RESPONSABLE',
  VALIDE = 'VALIDE',
  APPLIQUE = 'APPLIQUE',
  REJETE = 'REJETE',
  ANNULE = 'ANNULE',
}

export const ACT_STATUS_LABEL: Record<string, string> = {
  BROUILLON: 'Brouillon',
  SOUMIS: 'Soumis',
  EN_VALIDATION_RH: 'En validation RH',
  EN_VALIDATION_RESPONSABLE: 'En validation responsable',
  VALIDE: 'Validé',
  APPLIQUE: 'Appliqué',
  REJETE: 'Rejeté',
  ANNULE: 'Annulé',
};

/** Mappe un statut vers une severity p-tag : info / warn / success / danger / secondary. */
export const ACT_STATUS_SEVERITY: Record<string, 'info' | 'warn' | 'success' | 'danger' | 'secondary'> = {
  BROUILLON: 'secondary',
  SOUMIS: 'info',
  EN_VALIDATION_RH: 'warn',
  EN_VALIDATION_RESPONSABLE: 'warn',
  VALIDE: 'success',
  APPLIQUE: 'success',
  REJETE: 'danger',
  ANNULE: 'secondary',
};

export const ACT_TERMINAL_STATUSES = [ActStatus.APPLIQUE, ActStatus.REJETE, ActStatus.ANNULE];
