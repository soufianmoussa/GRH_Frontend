import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { AgentWizardState } from '../agent-wizard.state';
import { CoordonneesProfessionnellesDto } from '../../../../models/agent-full.model';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-step4-pro',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, DatePicker, TranslateModule],
  templateUrl: './step4-pro.component.html',
})
export class Step4ProComponent {
  readonly state = inject(AgentWizardState);

  get p(): CoordonneesProfessionnellesDto {
    return this.state.draft().coordonneesProfessionnelles ?? {};
  }

  get d() {
    return this.state.draft();
  }

  patchPro(patch: Partial<CoordonneesProfessionnellesDto>): void {
    this.state.patchDraft({ coordonneesProfessionnelles: { ...this.p, ...patch } });
  }

  patch<K extends keyof typeof this.d>(key: K, value: any): void {
    this.state.patchDraft({ [key]: value } as any);
  }
}
