import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgentWizardState } from '../agent-wizard.state';
import { AdresseDto, TypeAdresse } from '../../../../models/agent-full.model';

@Component({
  selector: 'app-step3-address',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, Select, Button, TooltipModule, TranslateModule],
  templateUrl: './step3-address.component.html',
})
export class Step3AddressComponent {
  readonly state = inject(AgentWizardState);
  private readonly translateService = inject(TranslateService);

  get typeOptions(): { label: string; value: TypeAdresse }[] {
    const p = 'GESTION_PERSONNELLE.DOSSIERS_AGENTS.AGENT_WIZARD.STEPS.STEP3.TYPE_';
    return [
      { label: this.translateService.instant(p + 'PRINCIPALE'), value: 'PRINCIPALE' },
      { label: this.translateService.instant(p + 'SECONDAIRE'), value: 'SECONDAIRE' },
      { label: this.translateService.instant(p + 'TRAVAIL'), value: 'TRAVAIL' },
      { label: this.translateService.instant(p + 'AUTRE'), value: 'AUTRE' },
    ];
  }

  get list(): AdresseDto[] {
    return this.state.draft().adresses ?? [];
  }

  trackByIndex = (i: number) => i;

  private nextAvailableType(): TypeAdresse {
    const used = new Set(this.list.map((a) => a.type));
    for (const opt of this.typeOptions) {
      if (!used.has(opt.value)) return opt.value;
    }
    return 'AUTRE';
  }

  add(): void {
    const next: AdresseDto = { type: this.nextAvailableType() };
    this.state.patchDraft({ adresses: [...this.list, next] });
  }

  remove(i: number): void {
    const next = this.list.filter((_, idx) => idx !== i);
    this.state.patchDraft({ adresses: next });
  }

  update(i: number, patch: Partial<AdresseDto>): void {
    const next = this.list.map((a, idx) => (idx === i ? { ...a, ...patch } : a));
    this.state.patchDraft({ adresses: next });
  }

  hasPrincipale(): boolean {
    return this.list.some((a) => a.type === 'PRINCIPALE');
  }
}
