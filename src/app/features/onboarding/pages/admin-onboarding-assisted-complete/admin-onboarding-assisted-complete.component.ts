import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { OnboardingDetail, OnboardingProfileRequest } from '../../../../models/onboarding.model';
import { OnboardingStepperComponent } from '../../components/onboarding-stepper/onboarding-stepper.component';
import { AdminOnboardingService } from '../../services/admin-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

@Component({
  selector: 'app-admin-onboarding-assisted-complete',
  providers: [MessageService],
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    Toast,
    OnboardingStepperComponent
  ],
  templateUrl: './admin-onboarding-assisted-complete.component.html',
  styleUrl: './admin-onboarding-assisted-complete.component.scss'
})
export class AdminOnboardingAssistedCompleteComponent implements OnInit {
  onboarding?: OnboardingDetail;
  loading = true;
  saving = false;

  onboardingId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private onboardingService: AdminOnboardingService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.onboardingId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAndStartAssisted();
  }

  saveProfile(payload: OnboardingProfileRequest): void {
    this.saving = true;
    this.onboardingService.updateProfile(this.onboardingId, payload)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: (onboarding) => {
          this.onboarding = onboarding;
          ToastHelper.showSuccess(this.messageService, 'Profil enregistre.');
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Enregistrement impossible.')
      });
  }

  uploadDocument(event: { documentId: number; file: File }): void {
    this.saving = true;
    this.onboardingService.uploadDocument(this.onboardingId, event.documentId, event.file)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: (onboarding) => {
          this.onboarding = onboarding;
          ToastHelper.showSuccess(this.messageService, 'Document importe.');
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Import du document impossible.')
      });
  }

  submitDossier(): void {
    this.saving = true;
    this.onboardingService.submit(this.onboardingId)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: (onboarding) => {
          this.onboarding = onboarding;
          ToastHelper.showSuccess(this.messageService, 'Dossier soumis pour validation.');
          this.router.navigate(['/admin/onboarding', this.onboardingId]);
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Soumission impossible.')
      });
  }

  private loadAndStartAssisted(): void {
    this.loading = true;
    this.onboardingService.getById(this.onboardingId).subscribe({
      next: (onboarding) => {
        if (onboarding.completionMode === 'ASSISTED') {
          this.onboarding = onboarding;
          this.loading = false;
          return;
        }

        this.onboardingService.startAssisted(this.onboardingId)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: (updated) => {
              this.onboarding = updated;
              ToastHelper.showInfo(this.messageService, 'Mode assiste active pour ce dossier.');
            },
            error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Activation du mode assiste impossible.')
          });
      },
      error: (error) => {
        this.loading = false;
        ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement du dossier onboarding.');
      }
    });
  }
}
