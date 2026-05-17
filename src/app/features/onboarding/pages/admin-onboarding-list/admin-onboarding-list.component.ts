import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import {
  AGENT_STATUS_LABELS,
  COMPLETION_MODE_LABELS,
  INVITATION_STATUS_LABELS,
  OnboardingDetail,
  ONBOARDING_STATUS_LABELS
} from '../../../../models/onboarding.model';
import { AdminOnboardingService } from '../../services/admin-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

@Component({
  selector: 'app-admin-onboarding-list',
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ConfirmDialogModule,
    ProgressBarModule,
    TableModule,
    TagModule,
    Toast,
    TooltipModule
  ],
  templateUrl: './admin-onboarding-list.component.html',
  styleUrl: './admin-onboarding-list.component.scss'
})
export class AdminOnboardingListComponent implements OnInit {
  onboardings: OnboardingDetail[] = [];
  totalRecords = 0;
  rows = 10;
  loading = false;

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

  load(event?: TableLazyLoadEvent): void {
    const first = event?.first ?? 0;
    const rows = event?.rows ?? this.rows;
    const page = Math.floor(first / rows);
    this.rows = rows;
    this.loading = true;

    this.onboardingService.list(page, rows)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.onboardings = response.content ?? [];
          this.totalRecords = response.totalElements ?? this.onboardings.length;
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement des onboardings.')
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

  rejectDossier(onboarding: OnboardingDetail): void {
    const reason = window.prompt('Motif du rejet');
    if (!reason) {
      return;
    }

    this.onboardingService.rejectDossier(onboarding.id, reason).subscribe({
      next: (updated) => {
        Object.assign(onboarding, updated);
        ToastHelper.showSuccess(this.messageService, 'Dossier rejete.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Rejet impossible.')
    });
  }

  progress(onboarding: OnboardingDetail): number {
    if (onboarding.status === 'VALIDATED' || onboarding.status === 'ACTIVE') return 100;
    if (onboarding.status === 'REJECTED') return 100;
    if (onboarding.status === 'PENDING_VALIDATION') return 80;
    if (onboarding.status === 'IN_PROGRESS') {
      const steps = onboarding.steps ?? [];
      if (steps.length) {
        const completed = steps.filter(step => !!step.completedAt || step.status === 'COMPLETED').length;
        return Math.max(45, Math.round((completed / steps.length) * 75));
      }
      return 50;
    }
    return 15;
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

  tagSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'ACTIVE':
      case 'VALIDATED':
      case 'USED':
        return 'success';
      case 'PENDING_VALIDATION':
      case 'PENDING':
      case 'PENDING_REVIEW':
        return 'warn';
      case 'REJECTED':
      case 'EXPIRED':
      case 'REVOKED':
        return 'danger';
      case 'IN_PROGRESS':
      case 'PROFILE_INCOMPLETE':
      case 'INCOMPLETE':
        return 'info';
      default:
        return 'secondary';
    }
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
