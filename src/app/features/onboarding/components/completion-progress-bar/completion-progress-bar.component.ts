import { Component, Input } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { OnboardingDetail } from '../../../../models/onboarding.model';

@Component({
  selector: 'app-completion-progress-bar',
  imports: [ProgressBarModule],
  template: `<p-progressBar [value]="value" [showValue]="true"></p-progressBar>`
})
export class CompletionProgressBarComponent {
  @Input() onboarding?: OnboardingDetail;

  get value(): number {
    const status = this.onboarding?.status;
    if (status === 'VALIDATED' || status === 'ACTIVE') return 100;
    if (status === 'REJECTED') return 100;
    if (status === 'PENDING_VALIDATION') return 80;
    if (status === 'IN_PROGRESS') {
      const steps = this.onboarding?.steps ?? [];
      if (steps.length) {
        const completed = steps.filter(step => !!step.completedAt || step.status === 'COMPLETED').length;
        return Math.max(45, Math.round((completed / steps.length) * 75));
      }
      return 55;
    }
    return 15;
  }
}
