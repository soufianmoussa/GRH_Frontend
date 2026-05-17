import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import {
  AGENT_STATUS_LABELS,
  COMPLETION_MODE_LABELS,
  DOCUMENT_STATUS_LABELS,
  INVITATION_STATUS_LABELS,
  OnboardingDetail,
  ONBOARDING_STATUS_LABELS
} from '../../../../models/onboarding.model';
import { AdminOnboardingService } from '../../services/admin-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

@Component({
  selector: 'app-admin-onboarding-detail',
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ConfirmDialogModule,
    ProgressBarModule,
    TableModule,
    TagModule,
    Toast
  ],
  templateUrl: './admin-onboarding-detail.component.html',
  styleUrl: './admin-onboarding-detail.component.scss'
})
export class AdminOnboardingDetailComponent implements OnInit {
  onboarding?: OnboardingDetail;
  loading = true;

  private onboardingId!: number;
  private readonly onboardingLabels = ONBOARDING_STATUS_LABELS;
  private readonly agentLabels = AGENT_STATUS_LABELS;
  private readonly modeLabels = COMPLETION_MODE_LABELS;
  private readonly documentLabels = DOCUMENT_STATUS_LABELS;
  private readonly invitationLabels = INVITATION_STATUS_LABELS;

  constructor(
    private route: ActivatedRoute,
    private onboardingService: AdminOnboardingService,
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
        next: (detail) => this.onboarding = detail,
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement du dossier onboarding.')
      });
  }

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

  rejectDossier(): void {
    if (!this.onboarding) return;
    const reason = window.prompt('Motif du rejet');
    if (!reason) return;

    this.onboardingService.rejectDossier(this.onboarding.id, reason).subscribe({
      next: (updated) => {
        this.onboarding = { ...updated, invitation: this.onboarding?.invitation };
        ToastHelper.showSuccess(this.messageService, 'Dossier rejete.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Rejet impossible.')
    });
  }

  progress(): number {
    const status = this.onboarding?.status;
    if (status === 'VALIDATED' || status === 'ACTIVE') return 100;
    if (status === 'REJECTED') return 100;
    if (status === 'PENDING_VALIDATION') return 80;
    if (status === 'IN_PROGRESS') return 50;
    return 15;
  }

  agentName(): string {
    const agent = this.onboarding?.agent;
    return [agent?.prenom, agent?.nom].filter(Boolean).join(' ') || 'Agent non complete';
  }

  label(map: Record<string, string>, value?: string): string {
    return value ? (map[value] || value) : '-';
  }

  statusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
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

  onboardingStatusLabel(status?: string): string {
    return this.label(this.onboardingLabels, status);
  }

  agentStatusLabel(status?: string): string {
    return this.label(this.agentLabels, status);
  }

  modeLabel(mode?: string): string {
    return this.label(this.modeLabels, mode);
  }

  documentStatusLabel(status?: string): string {
    return this.label(this.documentLabels, status);
  }

  invitationStatusLabel(status?: string): string {
    return this.label(this.invitationLabels, status) || 'Non creee';
  }
}
