import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { AGENT_STATUS_LABELS } from '../../../../models/onboarding.model';

@Component({
  selector: 'app-agent-status-badge',
  imports: [TagModule],
  template: `<p-tag [value]="label" [severity]="severity"></p-tag>`
})
export class AgentStatusBadgeComponent {
  @Input() status?: string;

  get label(): string {
    return this.status ? (AGENT_STATUS_LABELS[this.status as keyof typeof AGENT_STATUS_LABELS] || this.status) : '-';
  }

  get severity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (this.status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING_VALIDATION':
        return 'warn';
      case 'REJECTED':
        return 'danger';
      case 'INCOMPLETE':
        return 'info';
      default:
        return 'secondary';
    }
  }
}
