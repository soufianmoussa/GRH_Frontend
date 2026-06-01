import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import {
  AGENT_STATUS_LABELS,
  COMPLETION_MODE_LABELS,
  INVITATION_STATUS_LABELS,
  OnboardingDetail,
  OnboardingStatus,
  ONBOARDING_STATUS_LABELS
} from '../../../../models/onboarding.model';
import { AdminOnboardingService } from '../../services/admin-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { RejectionReasonDialogComponent } from '../../components/rejection-reason-dialog/rejection-reason-dialog.component';
import { onboardingTagSeverity, PrimengSeverity } from '../../utils/onboarding-status.util';

type DashboardTab = 'all' | 'to-activate' | 'in-progress' | 'to-validate' | 'validated' | 'rejected';

interface TabDef {
  key: DashboardTab;
  label: string;
  predicate: (o: OnboardingDetail) => boolean;
}

@Component({
  selector: 'app-admin-onboarding-list',
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    ConfirmDialogModule,
    InputTextModule,
    MenuModule,
    ProgressBarModule,
    TableModule,
    TagModule,
    Toast,
    TooltipModule,
    RejectionReasonDialogComponent
  ],
  templateUrl: './admin-onboarding-list.component.html',
  styleUrl: './admin-onboarding-list.component.scss'
})
export class AdminOnboardingListComponent implements OnInit {
  onboardings: OnboardingDetail[] = [];
  rows = 10;
  loading = false;
  activeTab: DashboardTab = 'all';
  search = '';

  rejectVisible = false;
  private pendingReject?: OnboardingDetail;

  @ViewChild(RejectionReasonDialogComponent) rejectDialog?: RejectionReasonDialogComponent;

  readonly tabs: TabDef[] = [
    { key: 'all',           label: 'Tous',          predicate: () => true },
    { key: 'to-activate',   label: 'A activer',     predicate: o => o.status === 'PROFILE_INCOMPLETE' },
    { key: 'in-progress',   label: 'En cours',      predicate: o => o.status === 'IN_PROGRESS' },
    { key: 'to-validate',   label: 'A valider',     predicate: o => o.status === 'PENDING_VALIDATION' },
    { key: 'validated',     label: 'Valides',       predicate: o => o.status === 'VALIDATED' || o.status === 'ACTIVE' },
    { key: 'rejected',      label: 'Rejetes',       predicate: o => o.status === 'REJECTED' }
  ];

  readonly onboardingLabels = ONBOARDING_STATUS_LABELS;
  readonly agentLabels = AGENT_STATUS_LABELS;
  readonly modeLabels = COMPLETION_MODE_LABELS;
  readonly invitationLabels = INVITATION_STATUS_LABELS;

  constructor(
    private onboardingService: AdminOnboardingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    // Load every onboarding once and let p-table handle pagination/filtering
    // client-side. The tab counters and the search bar both operate on the
    // already-loaded array, so server-side pagination here would silently
    // hide rows when client filters are applied.
    this.onboardingService.list(0, 1000)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.onboardings = response.content ?? [];
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement des onboardings.')
      });
  }

  setTab(tab: DashboardTab): void {
    this.activeTab = tab;
  }

  countFor(tab: TabDef): number {
    return this.onboardings.filter(tab.predicate).length;
  }

  countByStatus(...statuses: OnboardingStatus[]): number {
    return this.onboardings.filter(o => statuses.includes(o.status)).length;
  }

  filteredOnboardings(): OnboardingDetail[] {
    const tab = this.tabs.find(t => t.key === this.activeTab) ?? this.tabs[0];
    const search = this.search.trim().toLowerCase();
    return this.onboardings
      .filter(tab.predicate)
      .filter(o => {
        if (!search) return true;
        const name = [o.agent?.prenom, o.agent?.nom].filter(Boolean).join(' ').toLowerCase();
        const mat = (o.matricule?.matricule || o.agent?.matricule?.matricule || '').toLowerCase();
        const email = (o.agent?.email || o.invitation?.email || '').toLowerCase();
        return name.includes(search) || mat.includes(search) || email.includes(search);
      });
  }

  resendInvitation(onboarding: OnboardingDetail): void {
    this.onboardingService.resendInvitation(onboarding.id).subscribe({
      next: (status) => {
        onboarding.invitation = status;
        ToastHelper.showSuccess(this.messageService, 'Invitation renvoyee.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Renvoi impossible.')
    });
  }

  startAssisted(onboarding: OnboardingDetail): void {
    this.onboardingService.startAssisted(onboarding.id).subscribe({
      next: (updated) => {
        Object.assign(onboarding, updated);
        ToastHelper.showSuccess(this.messageService, 'Mode assiste active.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Activation du mode assiste impossible.')
    });
  }

  validateDossier(onboarding: OnboardingDetail): void {
    ToastHelper.confirmAction(
      this.confirmationService,
      'Confirmer la validation finale du dossier ?',
      'Validation onboarding',
      () => {
        this.onboardingService.validateDossier(onboarding.id).subscribe({
          next: (updated) => {
            Object.assign(onboarding, updated);
            ToastHelper.showSuccess(this.messageService, 'Dossier valide.');
          },
          error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Validation impossible.')
        });
      }
    );
  }

  askRejectDossier(onboarding: OnboardingDetail): void {
    this.pendingReject = onboarding;
    this.rejectDialog?.show();
  }

  confirmRejectDossier(reason: string): void {
    const target = this.pendingReject;
    if (!target) return;
    this.onboardingService.rejectDossier(target.id, reason).subscribe({
      next: (updated) => {
        Object.assign(target, updated);
        ToastHelper.showSuccess(this.messageService, 'Dossier rejete.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Rejet impossible.')
    });
    this.pendingReject = undefined;
  }

  moreActions(onboarding: OnboardingDetail): MenuItem[] {
    return [
      {
        label: 'Renvoyer l\'invitation',
        icon: 'pi pi-send',
        command: () => this.resendInvitation(onboarding)
      },
      {
        label: 'Activer le mode assiste',
        icon: 'pi pi-user-edit',
        disabled: onboarding.completionMode === 'ASSISTED',
        command: () => this.startAssisted(onboarding)
      },
      {
        label: 'Valider le dossier',
        icon: 'pi pi-check',
        disabled: onboarding.status !== 'PENDING_VALIDATION',
        command: () => this.validateDossier(onboarding)
      },
      {
        label: 'Rejeter le dossier',
        icon: 'pi pi-times',
        disabled: onboarding.status !== 'PENDING_VALIDATION',
        command: () => this.askRejectDossier(onboarding)
      }
    ];
  }

  // Single source of truth: backend OnboardingStepService.computeProgressPercent.
  progress(onboarding: OnboardingDetail): number {
    return onboarding.progressPercent ?? 0;
  }

  agentName(onboarding: OnboardingDetail): string {
    const agent = onboarding.agent;
    const fullName = [agent?.prenom, agent?.nom].filter(Boolean).join(' ');
    return fullName || 'Agent non complete';
  }

  matricule(onboarding: OnboardingDetail): string {
    return onboarding.matricule?.matricule || onboarding.agent?.matricule?.matricule || '-';
  }

  email(onboarding: OnboardingDetail): string {
    return onboarding.agent?.email || onboarding.agent?.coordonneesProfessionnelles?.emailPro || onboarding.invitation?.email || '-';
  }

  grade(onboarding: OnboardingDetail): string {
    const grade = onboarding.agent?.grade;
    return grade ? `${grade.code}${grade.libelle ? ' - ' + grade.libelle : ''}` : '-';
  }

  echelle(onboarding: OnboardingDetail): string {
    return onboarding.agent?.echelle?.echelle || onboarding.agent?.echelle?.libelle || '-';
  }

  echelon(onboarding: OnboardingDetail): string {
    return onboarding.agent?.echelon?.echelon || onboarding.agent?.echelon?.libelle || '-';
  }

  tagSeverity(status?: string): PrimengSeverity {
    return onboardingTagSeverity(status);
  }

  agentStatusLabel(status?: string): string {
    return this.agentLabels[status as keyof typeof this.agentLabels] || status || 'Incomplet';
  }

  onboardingStatusLabel(status?: string): string {
    return this.onboardingLabels[status as keyof typeof this.onboardingLabels] || status || '-';
  }

  modeLabel(mode?: string): string {
    return this.modeLabels[mode as keyof typeof this.modeLabels] || mode || '-';
  }

  invitationStatusLabel(status?: string): string {
    return this.invitationLabels[status as keyof typeof this.invitationLabels] || status || 'Non creee';
  }
}
