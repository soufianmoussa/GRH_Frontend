import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { OnboardingDetail, OnboardingProfileRequest } from '../../../../models/onboarding.model';
import { OnboardingStepperComponent } from '../../components/onboarding-stepper/onboarding-stepper.component';
import { AgentOnboardingService } from '../../services/agent-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

@Component({
  selector: 'app-agent-onboarding-complete',
  providers: [MessageService],
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    Toast,
    OnboardingStepperComponent
  ],
  templateUrl: './agent-onboarding-complete.component.html',
  styleUrl: './agent-onboarding-complete.component.scss'
})
export class AgentOnboardingCompleteComponent implements OnInit {
  onboarding?: OnboardingDetail;
  loading = true;
  saving = false;

  constructor(
    private onboardingService: AgentOnboardingService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.onboardingService.getMine()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (onboarding) => this.onboarding = onboarding,
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement de votre onboarding.')
      });
  }

  saveProfile(payload: OnboardingProfileRequest): void {
    this.saving = true;
    this.onboardingService.updateProfile(payload)
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
    this.onboardingService.uploadDocument(event.documentId, event.file)
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
    this.onboardingService.submit()
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: (onboarding) => {
          this.onboarding = onboarding;
          ToastHelper.showSuccess(this.messageService, 'Dossier soumis pour validation.');
          this.router.navigate(['/onboarding/waiting']);
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Soumission impossible.')
      });
  }
}
