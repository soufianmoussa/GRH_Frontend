import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import {
  DOCUMENT_STATUS_LABELS,
  OnboardingDetail,
  ONBOARDING_STATUS_LABELS
} from '../../../../models/onboarding.model';
import { AgentOnboardingService } from '../../services/agent-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

@Component({
  selector: 'app-agent-onboarding-dashboard',
  providers: [MessageService],
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ProgressBarModule,
    TagModule,
    Toast
  ],
  templateUrl: './agent-onboarding-dashboard.component.html',
  styleUrl: './agent-onboarding-dashboard.component.scss'
})
export class AgentOnboardingDashboardComponent implements OnInit {
  onboarding?: OnboardingDetail;
  loading = true;

  private readonly statusLabels = ONBOARDING_STATUS_LABELS;
  private readonly documentLabels = DOCUMENT_STATUS_LABELS;

  constructor(
    private onboardingService: AgentOnboardingService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.onboardingService.getMine().subscribe({
      next: (onboarding) => {
        this.onboarding = onboarding;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement de votre onboarding.');
      }
    });
  }

  progress(): number {
    const status = this.onboarding?.status;
    if (status === 'VALIDATED' || status === 'ACTIVE') return 100;
    if (status === 'REJECTED') return 100;
    if (status === 'PENDING_VALIDATION') return 80;
    if (status === 'IN_PROGRESS') return 55;
    return 15;
  }

  missingDocuments() {
    return (this.onboarding?.documents ?? []).filter(document => document.required && !document.fileName);
  }

  rejectedDocuments() {
    return (this.onboarding?.documents ?? []).filter(document => document.status === 'REJECTED');
  }

  pendingDocuments() {
    return (this.onboarding?.documents ?? []).filter(document => document.status === 'PENDING_REVIEW');
  }

  statusLabel(status?: string): string {
    return status ? (this.statusLabels[status as keyof typeof this.statusLabels] || status) : '-';
  }

  documentStatusLabel(status?: string): string {
    return status ? (this.documentLabels[status as keyof typeof this.documentLabels] || status) : '-';
  }

  statusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'VALIDATED':
      case 'ACTIVE':
        return 'success';
      case 'PENDING_VALIDATION':
      case 'PENDING_REVIEW':
        return 'warn';
      case 'REJECTED':
        return 'danger';
      case 'IN_PROGRESS':
      case 'PROFILE_INCOMPLETE':
        return 'info';
      default:
        return 'secondary';
    }
  }

  canContinue(): boolean {
    return !!this.onboarding && !['PENDING_VALIDATION', 'VALIDATED', 'ACTIVE'].includes(this.onboarding.status);
  }
}
