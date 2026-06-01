import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import {
  AGENT_STATUS_LABELS,
  COMPLETION_MODE_LABELS,
  DOCUMENT_STATUS_LABELS,
  INVITATION_STATUS_LABELS,
  OnboardingDetail,
  OnboardingDocument,
  OnboardingStep,
  OnboardingStepType,
  ONBOARDING_STATUS_LABELS
} from '../../../../models/onboarding.model';
import { AdminOnboardingService } from '../../services/admin-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { RejectionReasonDialogComponent } from '../../components/rejection-reason-dialog/rejection-reason-dialog.component';
import { onboardingTagSeverity, PrimengSeverity } from '../../utils/onboarding-status.util';
import { DiplomesService } from '../../../documents/services/diplomes/diplomes.service';
import { FormationService } from '../../../documents/services/formation/formation.service';
import { Diplome } from '../../../documents/models/diplomes/diplome.model';
import { Formation } from '../../../../models/formation.model';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type RejectionTarget = { kind: 'dossier' } | { kind: 'document'; documentId: number };

const STEP_LABELS: Record<OnboardingStepType, string> = {
  MATRICULE_ALLOCATION: 'Matricule attribue',
  ACCOUNT_ACTIVATION: 'Compte active',
  PROFILE: 'Profil renseigne',
  DOCUMENTS: 'Documents fournis',
  REVIEW: 'Dossier soumis',
  VALIDATION: 'Validation administrative'
};

const STEP_ICONS: Record<OnboardingStepType, string> = {
  MATRICULE_ALLOCATION: 'pi-id-card',
  ACCOUNT_ACTIVATION: 'pi-user-plus',
  PROFILE: 'pi-user-edit',
  DOCUMENTS: 'pi-file',
  REVIEW: 'pi-send',
  VALIDATION: 'pi-verified'
};

const ACTION_LABELS: Record<string, string> = {
  INITIALIZE: 'Dossier initialise',
  INVITATION_CREATED: 'Invitation creee',
  INVITATION_RESENT: 'Invitation renvoyee',
  INVITATION_RESEND_REQUESTED: 'Renvoi d\'invitation demande',
  INVITATION_REVOKE_PREVIOUS: 'Invitation precedente revoquee',
  INVITATION_VALIDATE_SUCCESS: 'Lien d\'invitation valide',
  INVITATION_VALIDATE_EXPIRED: 'Lien d\'invitation expire',
  INVITATION_ACTIVATION_SUCCESS: 'Compte agent active',
  INVITATION_ACTIVATION_FAILED: 'Echec d\'activation',
  INVITATION_USE_REJECTED: 'Tentative d\'utilisation refusee',
  START_ASSISTED: 'Mode assiste active',
  ASSISTED_PROFILE_UPDATE: 'Profil renseigne (RH)',
  SELF_PROFILE_UPDATE: 'Profil renseigne par l\'agent',
  SELF_DOCUMENT_UPLOAD: 'Document televerse par l\'agent',
  DOCUMENT_UPLOAD: 'Document televerse',
  DOCUMENT_VALIDATE: 'Document valide',
  DOCUMENT_REJECT: 'Document rejete',
  ADMIN_SUBMIT: 'Dossier soumis (RH)',
  SELF_SUBMIT: 'Dossier soumis par l\'agent',
  ONBOARDING_VALIDATE: 'Dossier valide',
  ONBOARDING_REJECT: 'Dossier rejete'
};

const ACTION_ICONS: Record<string, string> = {
  INITIALIZE: 'pi-flag',
  INVITATION_CREATED: 'pi-send',
  INVITATION_RESENT: 'pi-replay',
  INVITATION_RESEND_REQUESTED: 'pi-replay',
  INVITATION_REVOKE_PREVIOUS: 'pi-ban',
  INVITATION_VALIDATE_SUCCESS: 'pi-link',
  INVITATION_VALIDATE_EXPIRED: 'pi-clock',
  INVITATION_ACTIVATION_SUCCESS: 'pi-check-circle',
  INVITATION_ACTIVATION_FAILED: 'pi-times-circle',
  INVITATION_USE_REJECTED: 'pi-shield',
  START_ASSISTED: 'pi-user-edit',
  ASSISTED_PROFILE_UPDATE: 'pi-pencil',
  SELF_PROFILE_UPDATE: 'pi-pencil',
  SELF_DOCUMENT_UPLOAD: 'pi-upload',
  DOCUMENT_UPLOAD: 'pi-upload',
  DOCUMENT_VALIDATE: 'pi-check',
  DOCUMENT_REJECT: 'pi-times',
  ADMIN_SUBMIT: 'pi-send',
  SELF_SUBMIT: 'pi-send',
  ONBOARDING_VALIDATE: 'pi-verified',
  ONBOARDING_REJECT: 'pi-ban'
};

const ACTION_SEVERITY: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
  INITIALIZE: 'info',
  INVITATION_CREATED: 'info',
  INVITATION_RESENT: 'info',
  INVITATION_RESEND_REQUESTED: 'info',
  INVITATION_REVOKE_PREVIOUS: 'warn',
  INVITATION_VALIDATE_SUCCESS: 'success',
  INVITATION_VALIDATE_EXPIRED: 'warn',
  INVITATION_ACTIVATION_SUCCESS: 'success',
  INVITATION_ACTIVATION_FAILED: 'danger',
  INVITATION_USE_REJECTED: 'danger',
  START_ASSISTED: 'info',
  ASSISTED_PROFILE_UPDATE: 'info',
  SELF_PROFILE_UPDATE: 'info',
  SELF_DOCUMENT_UPLOAD: 'info',
  DOCUMENT_UPLOAD: 'info',
  DOCUMENT_VALIDATE: 'success',
  DOCUMENT_REJECT: 'danger',
  ADMIN_SUBMIT: 'info',
  SELF_SUBMIT: 'info',
  ONBOARDING_VALIDATE: 'success',
  ONBOARDING_REJECT: 'danger'
};

@Component({
  selector: 'app-admin-onboarding-detail',
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ConfirmDialogModule,
    MenuModule,
    ProgressBarModule,
    TableModule,
    TabViewModule,
    TagModule,
    Toast,
    TooltipModule,
    RejectionReasonDialogComponent
  ],
  templateUrl: './admin-onboarding-detail.component.html',
  styleUrl: './admin-onboarding-detail.component.scss'
})
export class AdminOnboardingDetailComponent implements OnInit {
  onboarding?: OnboardingDetail;
  diplomes: Diplome[] = [];
  formations: Formation[] = [];
  loading = true;

  private onboardingId!: number;
  private pendingReject?: RejectionTarget;

  @ViewChild(RejectionReasonDialogComponent) rejectDialog?: RejectionReasonDialogComponent;

  readonly onboardingLabels = ONBOARDING_STATUS_LABELS;
  readonly agentLabels = AGENT_STATUS_LABELS;
  readonly modeLabels = COMPLETION_MODE_LABELS;
  readonly documentLabels = DOCUMENT_STATUS_LABELS;
  readonly invitationLabels = INVITATION_STATUS_LABELS;

  constructor(
    private route: ActivatedRoute,
    private onboardingService: AdminOnboardingService,
    private diplomesService: DiplomesService,
    private formationService: FormationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.onboardingId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.onboardingService.getById(this.onboardingId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (detail) => {
          this.onboarding = detail;
          this.loadAgentDiplomesAndFormations();
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement du dossier onboarding.')
      });
  }

  /** Load diplomes + formations stored in their own tables for this agent. */
  private loadAgentDiplomesAndFormations(): void {
    const matricule = this.onboarding?.matricule?.matricule
      || this.onboarding?.agent?.matricule?.matricule;
    if (!matricule) return;
    this.diplomesService.getByMatricule(matricule)
      .pipe(catchError(() => of([] as Diplome[])))
      .subscribe(list => this.diplomes = list);
    this.formationService.getByMatricule(matricule)
      .pipe(catchError(() => of([] as Formation[])))
      .subscribe(list => this.formations = list);
  }

  // --- Counters for tab badges ---------------------------------------------

  totalDocumentsCount(): number {
    return (this.onboarding?.documents?.length ?? 0)
      + this.diplomes.length
      + this.formations.length;
  }

  totalValidatedCount(): number {
    const cinValidated = (this.onboarding?.documents ?? []).filter(d => d.status === 'VALIDATED').length;
    const diplomesWithScan = this.diplomes.filter(d => !!d.scanUrl).length;
    const formationsWithCert = this.formations.filter(f => !!f.certificateUrl).length;
    return cinValidated + diplomesWithScan + formationsWithCert;
  }

  // --- Dossier-level actions ------------------------------------------------

  resendInvitation(): void {
    if (!this.onboarding) return;
    this.onboardingService.resendInvitation(this.onboarding.id).subscribe({
      next: (status) => {
        if (this.onboarding) this.onboarding.invitation = status;
        ToastHelper.showSuccess(this.messageService, 'Invitation renvoyee.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Renvoi impossible.')
    });
  }

  startAssisted(): void {
    if (!this.onboarding) return;
    this.onboardingService.startAssisted(this.onboarding.id).subscribe({
      next: (updated) => {
        this.onboarding = { ...updated, invitation: this.onboarding?.invitation };
        ToastHelper.showSuccess(this.messageService, 'Mode assiste active.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Activation du mode assiste impossible.')
    });
  }

  validateDossier(): void {
    if (!this.onboarding) return;
    ToastHelper.confirmAction(
      this.confirmationService,
      'Confirmer la validation finale du dossier ?',
      'Validation onboarding',
      () => {
        this.onboardingService.validateDossier(this.onboarding!.id).subscribe({
          next: (updated) => {
            this.onboarding = { ...updated, invitation: this.onboarding?.invitation };
            ToastHelper.showSuccess(this.messageService, 'Dossier valide.');
          },
          error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Validation impossible.')
        });
      }
    );
  }

  askRejectDossier(): void {
    this.pendingReject = { kind: 'dossier' };
    this.rejectDialog?.show(this.onboarding?.rejectionReason ?? '');
  }

  // --- Document-level actions (Documents tab) -------------------------------

  validateDocument(document: OnboardingDocument): void {
    if (!this.onboarding) return;
    this.onboardingService.validateDocument(this.onboarding.id, document.id).subscribe({
      next: (updated) => {
        this.onboarding = { ...updated, invitation: this.onboarding?.invitation };
        ToastHelper.showSuccess(this.messageService, 'Document valide.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Validation du document impossible.')
    });
  }

  askRejectDocument(document: OnboardingDocument): void {
    this.pendingReject = { kind: 'document', documentId: document.id };
    this.rejectDialog?.show(document.rejectionReason ?? '');
  }

  confirmRejection(reason: string): void {
    if (!this.onboarding || !this.pendingReject) return;
    const target = this.pendingReject;

    if (target.kind === 'dossier') {
      this.onboardingService.rejectDossier(this.onboarding.id, reason).subscribe({
        next: (updated) => {
          this.onboarding = { ...updated, invitation: this.onboarding?.invitation };
          ToastHelper.showSuccess(this.messageService, 'Dossier rejete.');
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Rejet impossible.')
      });
    } else {
      this.onboardingService.rejectDocument(this.onboarding.id, target.documentId, reason).subscribe({
        next: (updated) => {
          this.onboarding = { ...updated, invitation: this.onboarding?.invitation };
          ToastHelper.showSuccess(this.messageService, 'Document rejete.');
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Rejet du document impossible.')
      });
    }
    this.pendingReject = undefined;
  }

  // --- Derived helpers ------------------------------------------------------

  get progress(): number {
    return this.onboarding?.progressPercent ?? 0;
  }

  isPendingValidation(): boolean {
    return this.onboarding?.status === 'PENDING_VALIDATION';
  }

  documentsCount(): number {
    return this.onboarding?.documents?.length ?? 0;
  }

  validatedDocumentsCount(): number {
    return (this.onboarding?.documents ?? []).filter(d => d.status === 'VALIDATED').length;
  }

  pendingDocumentsCount(): number {
    return (this.onboarding?.documents ?? []).filter(d => d.status !== 'VALIDATED').length;
  }

  completedStepsCount(): number {
    return (this.onboarding?.steps ?? []).filter(s => s.status === 'COMPLETED').length;
  }

  totalStepsCount(): number {
    return this.onboarding?.steps?.length ?? 0;
  }

  headerMenu(): MenuItem[] {
    const o = this.onboarding;
    return [
      {
        label: 'Renvoyer l\'invitation',
        icon: 'pi pi-send',
        command: () => this.resendInvitation()
      },
      {
        label: 'Activer le mode assiste',
        icon: 'pi pi-user-edit',
        disabled: !o || o.completionMode === 'ASSISTED',
        command: () => this.startAssisted()
      },
      { separator: true },
      {
        label: 'Valider le dossier',
        icon: 'pi pi-check',
        disabled: !o || o.status !== 'PENDING_VALIDATION',
        command: () => this.validateDossier()
      },
      {
        label: 'Rejeter le dossier',
        icon: 'pi pi-times',
        disabled: !o || o.status !== 'PENDING_VALIDATION',
        command: () => this.askRejectDossier()
      }
    ];
  }

  agentName(): string {
    const agent = this.onboarding?.agent;
    return [agent?.prenom, agent?.nom].filter(Boolean).join(' ') || 'Agent non complete';
  }

  agentInitials(): string {
    const agent = this.onboarding?.agent;
    const a = (agent?.prenom || '').trim().charAt(0).toUpperCase();
    const b = (agent?.nom || '').trim().charAt(0).toUpperCase();
    return (a + b) || '?';
  }

  matricule(): string {
    return this.onboarding?.matricule?.matricule || this.onboarding?.agent?.matricule?.matricule || '-';
  }

  agentEmail(): string {
    return this.onboarding?.agent?.email
      || this.onboarding?.agent?.coordonneesProfessionnelles?.emailPro
      || this.onboarding?.invitation?.email
      || '-';
  }

  agentPhone(): string {
    return this.onboarding?.agent?.telephone
      || this.onboarding?.agent?.coordonneesProfessionnelles?.telPortable
      || '-';
  }

  principalAdresse(): string {
    const list = this.onboarding?.agent?.adresses ?? [];
    const principal = list.find(a => a.type === 'PRINCIPALE') ?? list[0];
    return principal?.adresse || '-';
  }

  principalVille(): string {
    const list = this.onboarding?.agent?.adresses ?? [];
    const principal = list.find(a => a.type === 'PRINCIPALE') ?? list[0];
    return principal?.ville || principal?.localite || '-';
  }

  stepLabel(step: OnboardingStep): string {
    const key = (step.stepType || step.stepKey) as OnboardingStepType | undefined;
    return key ? STEP_LABELS[key] ?? key : 'Etape';
  }

  stepIcon(step: OnboardingStep): string {
    const key = (step.stepType || step.stepKey) as OnboardingStepType | undefined;
    return key ? STEP_ICONS[key] ?? 'pi-circle' : 'pi-circle';
  }

  stepStateIcon(step: OnboardingStep): string {
    switch (step.status) {
      case 'COMPLETED': return 'pi-check';
      case 'IN_PROGRESS': return 'pi-clock';
      default: return 'pi-circle';
    }
  }

  stepStateLabel(step: OnboardingStep): string {
    switch (step.status) {
      case 'COMPLETED': return 'Termine';
      case 'IN_PROGRESS': return 'En cours';
      default: return 'En attente';
    }
  }

  actionLabel(action?: string): string {
    if (!action) return 'Activite';
    return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase());
  }

  actionIcon(action?: string): string {
    return action ? (ACTION_ICONS[action] ?? 'pi-circle-fill') : 'pi-circle-fill';
  }

  actionSeverity(action?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return action ? (ACTION_SEVERITY[action] ?? 'secondary') : 'secondary';
  }

  // --- Labels / severity ----------------------------------------------------

  private mapLabel(map: Record<string, string>, value?: string): string {
    return value ? (map[value] || value) : '-';
  }

  statusSeverity(status?: string): PrimengSeverity {
    return onboardingTagSeverity(status);
  }

  onboardingStatusLabel(status?: string): string { return this.mapLabel(this.onboardingLabels, status); }
  agentStatusLabel(status?: string): string { return this.mapLabel(this.agentLabels, status); }
  modeLabel(mode?: string): string { return this.mapLabel(this.modeLabels, mode); }
  documentStatusLabel(status?: string): string { return this.mapLabel(this.documentLabels, status); }
  invitationStatusLabel(status?: string): string { return this.mapLabel(this.invitationLabels, status) || 'Non creee'; }
}
