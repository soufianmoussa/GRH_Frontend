import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgentWizardState } from '../agent-wizard.state';
import { ConjointDto, EnfantDto } from '../../../../../models/agent-full.model';

@Component({
  selector: 'app-step6-family',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, Button, DatePicker, Select, TableModule, TranslateModule],
  templateUrl: './step6-family.component.html',
})
export class Step6FamilyComponent {
  readonly state = inject(AgentWizardState);
  private readonly translate = inject(TranslateService);

  get sexeOptions() {
    return [
      { label: this.translate.instant('GLOBAL.MASCULIN'), value: 'M' },
      { label: this.translate.instant('GLOBAL.FEMININ'), value: 'F' },
    ];
  }

  get situationOptions() {
    const p = 'GESTION_PERSONNELLE.DOSSIERS_AGENTS.AGENT_WIZARD.STEPS.STEP6.VAL_';
    return [
      { label: this.translate.instant(p + 'CELIBATAIRE'), value: 'C' },
      { label: this.translate.instant(p + 'MARIE'), value: 'M' },
      { label: this.translate.instant(p + 'VEUF'), value: 'V' },
      { label: this.translate.instant(p + 'DIVORCE'), value: 'D' },
    ];
  }

  readonly isMarried = computed(() => this.state.draft().situation === 'M');

  get c(): ConjointDto {
    return this.state.draft().conjoint ?? {};
  }

  get enfants(): EnfantDto[] {
    return this.state.draft().enfants ?? [];
  }

  patchConjoint(patch: Partial<ConjointDto>): void {
    this.state.patchDraft({ conjoint: { ...this.c, ...patch } });
  }

  clearConjoint(): void {
    this.state.patchDraft({ conjoint: null });
  }

  addEnfant(): void {
    const next: EnfantDto[] = [...this.enfants, {}];
    this.state.patchDraft({ enfants: next });
  }

  removeEnfant(i: number): void {
    const next = this.enfants.filter((_, idx) => idx !== i);
    this.state.patchDraft({ enfants: next });
  }

  updateEnfant(i: number, patch: Partial<EnfantDto>): void {
    const next = this.enfants.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    this.state.patchDraft({ enfants: next });
  }

  trackByIndex = (index: number, _item: EnfantDto) => index;
}
