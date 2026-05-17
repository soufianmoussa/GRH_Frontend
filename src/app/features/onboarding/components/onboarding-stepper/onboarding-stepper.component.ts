import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { OnboardingDetail, OnboardingProfileRequest } from '../../../../models/onboarding.model';
import { CompletionProgressBarComponent } from '../completion-progress-bar/completion-progress-bar.component';
import { DocumentUploadCardComponent } from '../document-upload-card/document-upload-card.component';
import { OnboardingStatusBadgeComponent } from '../onboarding-status-badge/onboarding-status-badge.component';

@Component({
  selector: 'app-onboarding-stepper',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CompletionProgressBarComponent,
    DocumentUploadCardComponent,
    OnboardingStatusBadgeComponent
  ],
  templateUrl: './onboarding-stepper.component.html',
  styleUrl: './onboarding-stepper.component.scss'
})
export class OnboardingStepperComponent implements OnChanges {
  @Input() onboarding?: OnboardingDetail;
  @Input() actor: 'agent' | 'admin' = 'agent';
  @Input() saving = false;
  @Output() profileSave = new EventEmitter<OnboardingProfileRequest>();
  @Output() documentUpload = new EventEmitter<{ documentId: number; file: File }>();
  @Output() dossierSubmit = new EventEmitter<void>();

  activeStep = 0;
  form: FormGroup;

  readonly steps = [
    'Informations personnelles',
    'Diplomes / Formations',
    'Documents',
    'Recapitulatif'
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      cin: ['', Validators.required],
      sexe: [''],
      situation: [''],
      dateNaissance: [''],
      adresse: [''],
      ville: [''],
      telephone: [''],
      email: [''],
      diplome: [''],
      formation: [''],
      observations: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['onboarding'] && this.onboarding) {
      const agent = this.onboarding.agent;
      this.form.patchValue({
        nom: agent?.nom ?? '',
        prenom: agent?.prenom ?? '',
        cin: agent?.cin ?? '',
        sexe: agent?.sexe ?? '',
        situation: agent?.situation ?? '',
        dateNaissance: agent?.dateNaissance ?? '',
        telephone: agent?.telephone ?? agent?.coordonneesProfessionnelles?.telPortable ?? '',
        email: agent?.email ?? agent?.coordonneesProfessionnelles?.emailPro ?? ''
      }, { emitEvent: false });
    }
  }

  next(): void {
    if (this.activeStep === 0 && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.activeStep = Math.min(this.activeStep + 1, this.steps.length - 1);
  }

  previous(): void {
    this.activeStep = Math.max(this.activeStep - 1, 0);
  }

  goTo(index: number): void {
    this.activeStep = index;
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.profileSave.emit(this.form.value);
  }

  upload(event: { documentId: number; file: File }): void {
    this.documentUpload.emit(event);
  }

  submit(): void {
    this.dossierSubmit.emit();
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  locked(): boolean {
    return !!this.onboarding && ['PENDING_VALIDATION', 'VALIDATED', 'ACTIVE'].includes(this.onboarding.status);
  }
}
