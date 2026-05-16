import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { AgentWizardState } from '../agent-wizard.state';
import { CoordonneesBancairesDto } from '../../../../models/agent-full.model';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-step5-bank',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, DatePicker, TranslateModule],
  templateUrl: './step5-bank.component.html',
})
export class Step5BankComponent {
  readonly state = inject(AgentWizardState);

  get b(): CoordonneesBancairesDto {
    return this.state.draft().coordonneesBancaires ?? {};
  }

  patch(patch: Partial<CoordonneesBancairesDto>): void {
    this.state.patchDraft({ coordonneesBancaires: { ...this.b, ...patch } });
  }
}
