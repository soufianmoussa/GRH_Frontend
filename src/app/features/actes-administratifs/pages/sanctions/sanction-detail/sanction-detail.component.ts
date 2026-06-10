import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthService } from '../../../../../core/auth/auth.service';
import { SanctionService } from '../../../services/sanction/sanction.service';
import { Sanction } from '../../../../../models/Sanction.model';
import { StoredFileDto } from '../../../../../models/StoredFile.model';
import { ActStatus, ACT_STATUS_SEVERITY } from '../../../../../enums/ActStatus';

interface TimelineEvent { label: string; date?: string; actor?: string; icon: string; color: string; }

/** Détail d'une sanction : onglets Informations / Documents / Validation / Historique. */
@Component({
  selector: 'app-sanction-detail',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, FormsModule, Tabs, TabList, Tab, TabPanels, TabPanel,
    TimelineModule, TagModule, ButtonModule, Dialog, InputTextModule, Textarea,
    Toast, ConfirmDialogModule
  ],
  templateUrl: './sanction-detail.component.html',
  styleUrl: './sanction-detail.component.scss'
})
export class SanctionDetailComponent implements OnInit {

  id!: number;
  sanction: Sanction | null = null;
  documents: StoredFileDto[] = [];
  timeline: TimelineEvent[] = [];
  loading = true;
  isAdmin = false;

  rejectDialog = false;
  rejectReason = '';

  readonly ActStatus = ActStatus;
  readonly severity = ACT_STATUS_SEVERITY;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: SanctionService,
    private auth: AuthService,
    private messageService: MessageService,
    private confirm: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.hasRole('ADMIN');
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getById(this.id).subscribe({
      next: s => {
        this.sanction = s;
        this.buildTimeline(s);
        this.loading = false;
        this.service.getDocuments(this.id).subscribe({ next: d => this.documents = d });
      },
      error: () => { this.loading = false; this.toast('error', 'Erreur', 'Sanction introuvable.'); }
    });
  }

  private buildTimeline(s: Sanction): void {
    const events: TimelineEvent[] = [];
    if (s.createdAt) events.push({ label: 'Créée (brouillon)', date: s.createdAt, actor: s.createdBy, icon: 'pi pi-file-edit', color: '#9ca3af' });
    if (s.status !== ActStatus.BROUILLON) events.push({ label: 'Soumise', icon: 'pi pi-send', color: '#3b82f6' });
    if (s.validatedAt) events.push({ label: 'Validée', date: s.validatedAt, actor: s.validatedBy, icon: 'pi pi-check-circle', color: '#22c55e' });
    if (s.status === ActStatus.APPLIQUE) events.push({ label: 'Appliquée à la situation de l\'agent', date: s.dateDecision, icon: 'pi pi-verified', color: '#16a34a' });
    if (s.status === ActStatus.REJETE) events.push({ label: 'Rejetée : ' + (s.rejectionReason || ''), icon: 'pi pi-times-circle', color: '#ef4444' });
    if (s.status === ActStatus.ANNULE) events.push({ label: 'Annulée', icon: 'pi pi-ban', color: '#9ca3af' });
    this.timeline = events;
  }

  // ---- Disponibilité des actions selon le statut ----
  get canEdit(): boolean { return this.isAdmin && this.sanction?.status === ActStatus.BROUILLON; }
  get canSubmit(): boolean { return this.isAdmin && this.sanction?.status === ActStatus.BROUILLON; }
  get canValidate(): boolean { return this.isAdmin && [ActStatus.SOUMIS, ActStatus.EN_VALIDATION_RH, ActStatus.EN_VALIDATION_RESPONSABLE].includes(this.sanction?.status as ActStatus); }
  get canReject(): boolean { return this.canValidate; }
  get canApply(): boolean { return this.isAdmin && this.sanction?.status === ActStatus.VALIDE; }
  get canCancel(): boolean { return this.isAdmin && !!this.sanction && ![ActStatus.APPLIQUE, ActStatus.REJETE, ActStatus.ANNULE].includes(this.sanction.status); }
  get canUpload(): boolean { return this.isAdmin && !!this.sanction && ![ActStatus.APPLIQUE, ActStatus.REJETE, ActStatus.ANNULE].includes(this.sanction.status); }

  edit(): void { this.router.navigate(['/admin/actes/sanctions', this.id, 'edit']); }
  back(): void { this.router.navigate(['/admin/actes/sanctions']); }

  submit(): void { this.confirmAction('Soumettre cette sanction au circuit de validation ?', () => this.service.submit(this.id)); }
  validate(): void { this.confirmAction('Valider cette sanction ? La décision sera actée.', () => this.service.validate(this.id)); }
  apply(): void { this.confirmAction('Appliquer la sanction à la situation de l\'agent ? Action définitive.', () => this.service.apply(this.id)); }
  cancel(): void { this.confirmAction('Annuler cette sanction ?', () => this.service.cancel(this.id)); }

  private confirmAction(message: string, action: () => any): void {
    this.confirm.confirm({
      message, header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Confirmer', rejectLabel: 'Annuler',
      accept: () => action().subscribe({
        next: () => { this.toast('success', 'Mis à jour', 'Statut mis à jour.'); this.load(); },
        error: (err: any) => this.toast('error', 'Erreur', err.error?.message || 'Action impossible.')
      })
    });
  }

  openReject(): void { this.rejectReason = ''; this.rejectDialog = true; }
  doReject(): void {
    if (!this.rejectReason.trim()) { this.toast('warn', 'Motif requis', 'Le motif de rejet est obligatoire.'); return; }
    this.service.reject(this.id, this.rejectReason.trim()).subscribe({
      next: () => { this.rejectDialog = false; this.toast('success', 'Rejetée', 'Sanction rejetée.'); this.load(); },
      error: err => this.toast('error', 'Erreur', err.error?.message || 'Rejet impossible.')
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.service.uploadDocument(this.id, file).subscribe({
      next: () => { this.toast('success', 'Ajouté', 'Décision PDF attachée.'); this.load(); input.value = ''; },
      error: err => this.toast('error', 'Erreur', err.error?.message || 'Upload impossible.')
    });
  }

  deleteDoc(doc: StoredFileDto): void {
    this.confirm.confirm({
      message: `Supprimer « ${doc.originalFileName} » ?`, header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui', rejectLabel: 'Non', acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.service.deleteDocument(doc.id).subscribe({
        next: () => { this.toast('success', 'Supprimé', 'Document supprimé.'); this.load(); },
        error: err => this.toast('error', 'Erreur', err.error?.message || 'Suppression impossible.')
      })
    });
  }

  private toast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: severity === 'success' ? 3000 : 5000 });
  }
}
