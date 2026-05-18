import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgentWizardState } from '../agent-wizard.state';

import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-step8-recap',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslateModule, TagModule],
  templateUrl: './step8-recap.component.html',
})
export class Step8RecapComponent {
  readonly state = inject(AgentWizardState);
  private readonly translate = inject(TranslateService);

  get d() { return this.state.draft(); }

  situationLabel(val?: string): string {
    if (!val) return '—';
    const p = 'GESTION_PERSONNELLE.DOSSIERS_AGENTS.AGENT_WIZARD.STEPS.STEP6.VAL_';
    const map: Record<string, string> = {
      'C': p + 'CELIBATAIRE',
      'M': p + 'MARIE',
      'V': p + 'VEUF',
      'D': p + 'DIVORCE'
    };
    const key = map[val];
    return key ? this.translate.instant(key) : val;
  }
}
