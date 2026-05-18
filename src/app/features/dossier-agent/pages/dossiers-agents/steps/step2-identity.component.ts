import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { AgentWizardState } from '../agent-wizard.state';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-step2-identity',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, Select, DatePicker, TranslateModule],
  templateUrl: './step2-identity.component.html',
})
export class Step2IdentityComponent {
  readonly state = inject(AgentWizardState);
  private readonly translateService = inject(TranslateService);

  get sexeOptions() {
    return [
      { label: this.translateService.instant('GLOBAL.MASCULIN') || 'Homme', value: 'M' },
      { label: this.translateService.instant('GLOBAL.FEMININ') || 'Femme', value: 'F' },
    ];
  }

  get d() {
    return this.state.draft();
  }

  patch<K extends keyof typeof this.d>(key: K, value: any): void {
    this.state.patchDraft({ [key]: value } as any);
  }
}
