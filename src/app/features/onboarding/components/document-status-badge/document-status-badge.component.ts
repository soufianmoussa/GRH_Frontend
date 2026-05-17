import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { DOCUMENT_STATUS_LABELS } from '../../../../models/onboarding.model';

@Component({
  selector: 'app-document-status-badge',
  imports: [TagModule],
  template: `<p-tag [value]="label" [severity]="severity"></p-tag>`
})
export class DocumentStatusBadgeComponent {
  @Input() status?: string;

  get label(): string {
    return this.status ? (DOCUMENT_STATUS_LABELS[this.status as keyof typeof DOCUMENT_STATUS_LABELS] || this.status) : '-';
  }

  get severity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (this.status) {
      case 'VALIDATED':
        return 'success';
      case 'PENDING_REVIEW':
        return 'warn';
      case 'REJECTED':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
