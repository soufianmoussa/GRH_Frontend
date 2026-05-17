import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { OnboardingDetail, OnboardingDocument } from '../../../../models/onboarding.model';
import { DocumentStatusBadgeComponent } from '../../components/document-status-badge/document-status-badge.component';
import { AdminOnboardingService } from '../../services/admin-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

interface DocumentRow {
  onboarding: OnboardingDetail;
  document: OnboardingDocument;
}

@Component({
  selector: 'app-admin-onboarding-documents',
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    Dialog,
    InputTextModule,
    TableModule,
    Toast,
    TooltipModule,
    DocumentStatusBadgeComponent
  ],
  templateUrl: './admin-onboarding-documents.component.html',
  styleUrl: './admin-onboarding-documents.component.scss'
})
export class AdminOnboardingDocumentsComponent implements OnInit {
  rows: DocumentRow[] = [];
  loading = false;
  rejectDialogVisible = false;
  rejectionReason = '';
  selectedRow?: DocumentRow;

  constructor(
    private onboardingService: AdminOnboardingService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.onboardingService.list(0, 200)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (page) => {
          this.rows = (page.content ?? []).flatMap(onboarding =>
            (onboarding.documents ?? []).map(document => ({ onboarding, document }))
          );
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement des documents.')
      });
  }

  validate(row: DocumentRow): void {
    this.onboardingService.validateDocument(row.onboarding.id, row.document.id).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Document valide.');
        this.load();
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Validation du document impossible.')
    });
  }

  openReject(row: DocumentRow): void {
    this.selectedRow = row;
    this.rejectionReason = row.document.rejectionReason || '';
    this.rejectDialogVisible = true;
  }

  reject(): void {
    if (!this.selectedRow || !this.rejectionReason.trim()) {
      ToastHelper.showRequiredFieldsError(this.messageService);
      return;
    }

    this.onboardingService.rejectDocument(
      this.selectedRow.onboarding.id,
      this.selectedRow.document.id,
      this.rejectionReason.trim()
    ).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Document rejete.');
        this.rejectDialogVisible = false;
        this.selectedRow = undefined;
        this.rejectionReason = '';
        this.load();
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Rejet du document impossible.')
    });
  }

  agentName(row: DocumentRow): string {
    const agent = row.onboarding.agent;
    return [agent?.prenom, agent?.nom].filter(Boolean).join(' ') || 'Agent non complete';
  }

  matricule(row: DocumentRow): string {
    return row.onboarding.matricule?.matricule || row.onboarding.agent?.matricule?.matricule || '-';
  }
}
