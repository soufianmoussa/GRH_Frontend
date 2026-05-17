import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { INVITATION_STATUS_LABELS } from '../../../../models/onboarding.model';

@Component({
  selector: 'app-invitation-status-badge',
  imports: [TagModule],
  template: `<p-tag [value]="label" [severity]="severity"></p-tag>`
})
export class InvitationStatusBadgeComponent {
  @Input() status?: string;

  get label(): string {
    return this.status ? (INVITATION_STATUS_LABELS[this.status as keyof typeof INVITATION_STATUS_LABELS] || this.status) : 'Non creee';
  }

  get severity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (this.status) {
      case 'USED':
        return 'success';
      case 'PENDING':
        return 'warn';
      case 'EXPIRED':
      case 'REVOKED':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
