import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { AgentWizardState } from '../agent-wizard.state';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-step1-matricule',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, DatePicker, TranslateModule],
  templateUrl: './step1-matricule.component.html',
})
export class Step1MatriculeComponent {
  readonly state = inject(AgentWizardState);

  get readonly(): boolean {
    return this.state.mode() !== 'create';
  }

  get matricule(): string {
    return this.state.draft().matricule ?? '';
  }
  set matricule(v: string) {
    this.state.patchDraft({ matricule: v });
  }

  /**
   * dateRecrutement stockée en ISO string, exposée en Date pour p-datepicker.
   * Le Date est mémorisé par clé ISO pour renvoyer la même référence à chaque
   * cycle de détection de changement, sinon `[(ngModel)]` boucle avec p-datepicker.
   */
  private dateRecrutementCache: { iso: string; date: Date | null } | null = null;

  get dateRecrutement(): Date | null {
    const iso = this.state.draft().dateRecrutement ?? '';
    if (this.dateRecrutementCache && this.dateRecrutementCache.iso === iso) {
      return this.dateRecrutementCache.date;
    }
    let date: Date | null = null;
    if (iso) {
      const d = new Date(iso);
      date = isNaN(d.getTime()) ? null : d;
    }
    this.dateRecrutementCache = { iso, date };
    return date;
  }
  set dateRecrutement(v: Date | null) {
    const iso = this.toIso(v);
    this.dateRecrutementCache = { iso, date: v };
    this.state.patchDraft({ dateRecrutement: iso });
  }

  get domaine(): string { return this.state.draft().domaine ?? ''; }
  set domaine(v: string) { this.state.patchDraft({ domaine: v }); }

  get sousDomaine(): string { return this.state.draft().sousDomaine ?? ''; }
  set sousDomaine(v: string) { this.state.patchDraft({ sousDomaine: v }); }

  get categorie(): string { return this.state.draft().categorie ?? ''; }
  set categorie(v: string) { this.state.patchDraft({ categorie: v }); }

  get typeContrat(): string { return this.state.draft().typeContrat ?? ''; }
  set typeContrat(v: string) { this.state.patchDraft({ typeContrat: v }); }

  private toIso(d: Date | null): string {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
