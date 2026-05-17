import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { AdminOnboardingService } from '../../services/admin-onboarding.service';
import { EchelleService } from '../../services/echelle.service';
import { EchelonService } from '../../services/echelon.service';
import { GradeService } from '../../services/grade.service';
import { PosteOnboardingService } from '../../services/poste-onboarding.service';
import { OnboardingInitializeRequest } from '../../../../models/onboarding.model';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

interface SelectOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-admin-onboarding-initialize',
  providers: [MessageService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    DatePicker,
    InputTextModule,
    ProgressSpinnerModule,
    Select,
    Toast
  ],
  templateUrl: './admin-onboarding-initialize.component.html',
  styleUrl: './admin-onboarding-initialize.component.scss'
})
export class AdminOnboardingInitializeComponent implements OnInit {
  form: FormGroup;
  loadingReferentials = true;
  submitting = false;
  createdOnboardingId?: number;

  gradeOptions: SelectOption[] = [];
  echelleOptions: SelectOption[] = [];
  echelonOptions: SelectOption[] = [];
  posteOptions: SelectOption[] = [];

  constructor(
    private fb: FormBuilder,
    private adminOnboardingService: AdminOnboardingService,
    private gradeService: GradeService,
    private echelleService: EchelleService,
    private echelonService: EchelonService,
    private posteService: PosteOnboardingService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.form = this.fb.group({
      matricule: ['', Validators.required],
      dateRecrutement: [null, Validators.required],
      domaine: ['', Validators.required],
      sousDomaine: ['', Validators.required],
      posteId: [null, Validators.required],
      categorie: ['', Validators.required],
      gradeId: [null, Validators.required],
      echelleId: [null, Validators.required],
      echelonId: [null, Validators.required],
      typeContrat: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadReferentials();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      ToastHelper.showRequiredFieldsError(this.messageService);
      return;
    }

    this.submitting = true;
    this.createdOnboardingId = undefined;

    this.adminOnboardingService.initialize(this.toPayload())
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: (onboarding) => {
          this.createdOnboardingId = onboarding.id;
          ToastHelper.showSuccess(this.messageService, 'Onboarding cree et invitation preparee.');
          this.form.reset();
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Initialisation impossible.')
      });
  }

  viewCreated(): void {
    if (this.createdOnboardingId) {
      this.router.navigate(['/admin/onboarding', this.createdOnboardingId]);
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private loadReferentials(): void {
    this.loadingReferentials = true;
    forkJoin({
      grades: this.gradeService.getAll(),
      echelles: this.echelleService.getAll(),
      echelons: this.echelonService.getAll(),
      postes: this.posteService.getAll()
    })
      .pipe(finalize(() => this.loadingReferentials = false))
      .subscribe({
        next: ({ grades, echelles, echelons, postes }) => {
          this.gradeOptions = grades.map(grade => ({
            label: `${grade.code}${grade.libelle ? ' - ' + grade.libelle : ''}`,
            value: grade.id
          }));
          this.echelleOptions = echelles.map(echelle => ({
            label: echelle.echelle || echelle.libelle || String(echelle.id),
            value: echelle.id
          }));
          this.echelonOptions = echelons.map(echelon => ({
            label: echelon.echelon || echelon.libelle || String(echelon.id),
            value: echelon.id
          }));
          this.posteOptions = postes.map(poste => ({
            label: poste.libelleDuPoste || poste.libelle || poste.codeCourt || String(poste.id),
            value: poste.id
          }));
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement des referentiels.')
      });
  }

  private toPayload(): OnboardingInitializeRequest {
    const value = this.form.value;
    return {
      matricule: value.matricule,
      dateRecrutement: this.toIsoDate(value.dateRecrutement),
      domaine: value.domaine,
      sousDomaine: value.sousDomaine,
      posteId: value.posteId,
      categorie: value.categorie,
      gradeId: value.gradeId,
      echelleId: value.echelleId,
      echelonId: value.echelonId,
      typeContrat: value.typeContrat,
      email: value.email,
      telephone: value.telephone
    };
  }

  private toIsoDate(value: Date | string): string {
    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return value;
  }
}
