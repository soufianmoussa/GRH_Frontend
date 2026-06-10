import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { SanctionService } from '../../../services/sanction/sanction.service';
import { AgentService } from '../../../../dossier-agent/services/agent.service';
import { AgentModel } from '../../../../../models/Agent.model';
import { SanctionRequest, EnumOption } from '../../../../../models/Sanction.model';

/** Formulaire de sanction en étapes : Agent → Détails → Récapitulatif. */
@Component({
  selector: 'app-sanction-form',
  standalone: true,
  providers: [MessageService],
  imports: [CommonModule, FormsModule, Select, DatePicker, InputTextModule, Textarea, ButtonModule, Toast, TagModule],
  templateUrl: './sanction-form.component.html',
  styleUrl: './sanction-form.component.scss'
})
export class SanctionFormComponent implements OnInit {

  isEdit = false;
  id?: number;
  step = 0;
  readonly steps = ['Agent', 'Détails', 'Récapitulatif'];

  agents: AgentModel[] = [];
  types: EnumOption[] = [];

  // Liaisons du formulaire (dates en objets Date pour le datepicker)
  agentId: number | null = null;
  sanctionType: string | null = null;
  dateEffet: Date | null = null;
  dateFin: Date | null = null;
  dateFaute: Date | null = null;
  reductionTraitement: number | null = null;
  motif = '';

  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: SanctionService,
    private agentService: AgentService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.agentService.getAll().subscribe({ next: a => this.agents = a });
    this.service.getTypes().subscribe({ next: t => this.types = t });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.service.getById(this.id).subscribe({
        next: s => {
          this.agentId = s.agentId;
          this.sanctionType = s.sanctionType;
          this.dateEffet = s.dateEffet ? new Date(s.dateEffet) : null;
          this.dateFin = s.dateFin ? new Date(s.dateFin) : null;
          this.dateFaute = s.dateFaute ? new Date(s.dateFaute) : null;
          this.reductionTraitement = s.reductionTraitement ?? null;
          this.motif = s.motif ?? '';
        },
        error: () => this.toast('error', 'Erreur', 'Sanction introuvable.')
      });
    }
  }

  get selectedAgent(): AgentModel | undefined {
    return this.agents.find(a => a.id === this.agentId);
  }

  get selectedTypeLabel(): string {
    return this.types.find(t => t.value === this.sanctionType)?.label || '—';
  }

  get selectedDegre(): number | undefined {
    return this.types.find(t => t.value === this.sanctionType)?.degre;
  }

  // ---- Navigation entre étapes ----
  next(): void {
    if (this.step === 0 && !this.agentId) { this.toast('warn', 'Agent requis', 'Veuillez choisir un agent.'); return; }
    if (this.step === 1 && !this.validDetails()) return;
    if (this.step < this.steps.length - 1) this.step++;
  }
  prev(): void { if (this.step > 0) this.step--; }
  goTo(i: number): void { if (i <= this.step) this.step = i; }

  private validDetails(): boolean {
    if (!this.sanctionType) { this.toast('warn', 'Type requis', 'Choisissez le type de sanction.'); return false; }
    if (!this.dateEffet) { this.toast('warn', 'Date requise', 'La date d\'effet est obligatoire.'); return false; }
    if (this.dateFin && this.dateEffet && this.dateFin < this.dateEffet) {
      this.toast('warn', 'Dates invalides', 'La date de fin doit suivre la date d\'effet.'); return false;
    }
    if (this.dateFaute && this.dateEffet && this.dateFaute > this.dateEffet) {
      this.toast('warn', 'Dates invalides', 'La faute doit précéder la date d\'effet.'); return false;
    }
    return true;
  }

  save(): void {
    if (!this.agentId || !this.validDetails()) return;
    this.saving = true;
    const payload: SanctionRequest = {
      agentId: this.agentId,
      sanctionType: this.sanctionType,
      dateEffet: this.toIso(this.dateEffet),
      dateFin: this.toIso(this.dateFin),
      dateFaute: this.toIso(this.dateFaute),
      reductionTraitement: this.reductionTraitement,
      motif: this.motif?.trim() || null,
    };
    const obs = this.isEdit && this.id
      ? this.service.update(this.id, payload)
      : this.service.create(payload);
    obs.subscribe({
      next: s => {
        this.toast('success', 'Enregistré', this.isEdit ? 'Sanction modifiée.' : 'Brouillon créé.');
        this.router.navigate(['/admin/actes/sanctions', s.id]);
      },
      error: err => { this.saving = false; this.toast('error', 'Erreur', err.error?.message || 'Enregistrement impossible.'); }
    });
  }

  cancel(): void { this.router.navigate(['/admin/actes/sanctions']); }

  private toIso(d: Date | null): string | null { return d ? d.toISOString().substring(0, 10) : null; }
  private toast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: severity === 'success' ? 3000 : 5000 });
  }
}
