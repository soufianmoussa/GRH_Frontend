import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { ONBOARDING_STATUS_LABELS } from '../../../../models/onboarding.model';

@Component({
  selector: 'app-onboarding-status-badge',
  imports: [TagModule],
  template: `<p-tag [value]="label" [severity]="severity"></p-tag>`
})
export class OnboardingStatusBadgeComponent {
  @Input() status?: string;

  get label(): string {
    return this.status ? (ONBOARDING_STATUS_LABELS[this.status as keyof typeof ONBOARDING_STATUS_LABELS] || this.status) : '-';
  }

  get severity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (this.status) {
      case 'VALIDATED':
      case 'ACTIVE':
        return 'success';
      case 'PENDING_VALIDATION':
        return 'warn';
      case 'REJECTED':
        return 'danger';
      case 'IN_PROGRESS':
      case 'PROFILE_INCOMPLETE':
        return 'info';
      default:
        return 'secondary';
    }
  }
}
