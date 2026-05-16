export interface TypeConge {
  id: number;
  code: string;
  label: string;
  deductible: boolean;
  requiresAttachment: boolean;
  requiresMedicalCertificate: boolean;
  maxDurationDays: number | null;
  minAdvanceNoticeDays: number | null;
  active: boolean;
  countsWorkingDaysOnly: boolean;
  requiresApproval: boolean;
  defaultBaseDays: number;
}

export interface TypeCongeCreateUpdateRequest {
  code: string;
  label: string;
  deductible: boolean;
  requiresAttachment: boolean;
  requiresMedicalCertificate: boolean;
  maxDurationDays: number | null;
  minAdvanceNoticeDays: number | null;
  active: boolean;
  countsWorkingDaysOnly: boolean;
  requiresApproval: boolean;
  defaultBaseDays: number;
}
