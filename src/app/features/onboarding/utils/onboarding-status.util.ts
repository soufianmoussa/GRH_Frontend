/**
 * Single source of truth for mapping any onboarding-related status string
 * (OnboardingStatus, AgentStatus, DocumentStatus, InvitationStatus) to a
 * PrimeNG tag severity. Previously duplicated across admin-list, admin-detail
 * and (in older code) the agent dashboard.
 */
export type PrimengSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

export function onboardingTagSeverity(status?: string): PrimengSeverity {
  switch (status) {
    case 'ACTIVE':
    case 'VALIDATED':
    case 'USED':
      return 'success';
    case 'PENDING_VALIDATION':
    case 'PENDING':
    case 'PENDING_REVIEW':
      return 'warn';
    case 'REJECTED':
    case 'EXPIRED':
    case 'REVOKED':
      return 'danger';
    case 'IN_PROGRESS':
    case 'PROFILE_INCOMPLETE':
    case 'INCOMPLETE':
      return 'info';
    default:
      return 'secondary';
  }
}
