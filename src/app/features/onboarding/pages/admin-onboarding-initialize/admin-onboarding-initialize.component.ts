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
import { EchelleReferential, EchelonReferential, Grade, OnboardingInitializeRequest } from '../../../../models/onboarding.model';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import {
  BUSINESS_ECHELLES,
  BUSINESS_ECHELONS,
  BUSINESS_GRADES,
  BusinessGradeOption,
  EchelleBusinessKey
} from '../../constants/public-administration-classification.constants';

interface SelectOption {
  label: string;
  value: number | null;
  disabled?: boolean;
}

interface GradeSelectOption extends SelectOption {
  value: number | null;
  group: string;
  echelleKeys: EchelleBusinessKey[];
}

interface EchelleSelectOption extends SelectOption {
  value: number | null;
  key: EchelleBusinessKey;
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

  gradeOptions: GradeSelectOption[] = [];
  echelleOptions: EchelleSelectOption[] = [];
  echelonOptions: SelectOption[] = [];
  posteOptions: SelectOption[] = [];
  selectedGrade?: GradeSelectOption;

  private allEchelleOptions: EchelleSelectOption[] = [];

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
    this.form.get('gradeId')?.valueChanges.subscribe(gradeId => this.applyGradeEchelleRule(gradeId));
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
          this.selectedGrade = undefined;
          this.echelleOptions = [...this.allEchelleOptions];
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
          this.gradeOptions = this.buildGradeOptions(grades);
          this.allEchelleOptions = this.buildEchelleOptions(echelles);
          this.echelleOptions = [...this.allEchelleOptions];
          this.echelonOptions = this.buildEchelonOptions(echelons);
          this.posteOptions = postes.map(poste => ({
            label: poste.libelleDuPoste || poste.libelle || poste.codeCourt || String(poste.id),
            value: poste.id
          }));
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement des referentiels.')
      });
  }

  private buildGradeOptions(grades: Grade[]): GradeSelectOption[] {
    return BUSINESS_GRADES.map(businessGrade => {
      const grade = this.findBackendGrade(businessGrade, grades);
      return {
        label: `${businessGrade.group} - ${businessGrade.label} (${this.formatEchelleRange(businessGrade.echelleKeys)})${grade ? '' : ' - grade non configure'}`,
        value: grade?.id ?? null,
        disabled: !grade,
        group: businessGrade.group,
        echelleKeys: businessGrade.echelleKeys
      };
    });
  }

  private buildEchelleOptions(echelles: EchelleReferential[]): EchelleSelectOption[] {
    return BUSINESS_ECHELLES.map(businessEchelle => {
      const echelle = echelles.find(item => this.extractEchelleKey(item) === businessEchelle.key);
      return {
        label: `${businessEchelle.label}${echelle ? '' : ' - non configuree'}`,
        value: echelle?.id ?? null,
        key: businessEchelle.key,
        disabled: !echelle
      };
    });
  }

  private buildEchelonOptions(echelons: EchelonReferential[]): SelectOption[] {
    return BUSINESS_ECHELONS.map(businessEchelon => {
      const echelon = echelons.find(item => this.extractEchelonKey(item) === businessEchelon.key);
      return {
        label: `${businessEchelon.label}${echelon ? '' : ' - non configure'}`,
        value: echelon?.id ?? null,
        disabled: !echelon
      };
    });
  }

  private applyGradeEchelleRule(gradeId: number | null): void {
    this.selectedGrade = this.gradeOptions.find(option => option.value === gradeId) ?? undefined;

    if (!this.selectedGrade) {
      this.echelleOptions = [...this.allEchelleOptions];
      return;
    }

    this.echelleOptions = this.allEchelleOptions.filter(option => this.selectedGrade?.echelleKeys.includes(option.key));

    if (this.selectedGrade.echelleKeys.length === 1) {
      const echelle = this.echelleOptions.find(option => !option.disabled);
      this.form.get('echelleId')?.setValue(echelle?.value ?? null, { emitEvent: false });
      return;
    }

    const currentEchelleId = this.form.get('echelleId')?.value;
    const currentStillAllowed = this.echelleOptions.some(option => option.value === currentEchelleId && !option.disabled);

    if (!currentStillAllowed) {
      this.form.get('echelleId')?.setValue(null, { emitEvent: false });
    }
  }

  private findBackendGrade(businessGrade: BusinessGradeOption, grades: Grade[]): Grade | undefined {
    const target = this.normalizeText(businessGrade.label);
    return grades.find(grade => {
      const candidates = [
        grade.code,
        grade.libelle,
        grade.description,
        `${grade.code ?? ''} ${grade.libelle ?? ''}`
      ]
        .filter(Boolean)
        .map(value => this.normalizeText(value));

      return candidates.some(candidate => candidate === target || candidate.includes(target));
    });
  }

  private extractEchelleKey(echelle: EchelleReferential): EchelleBusinessKey | undefined {
    const text = this.normalizeText(`${echelle.echelle ?? ''} ${echelle.libelle ?? ''} ${echelle.description ?? ''}`);
    if (text.includes('hors echelle')) {
      return 'HORS_ECHELLE';
    }

    const match = text.match(/\b(6|7|8|9|10|11)\b/);
    return match?.[1] as EchelleBusinessKey | undefined;
  }

  private extractEchelonKey(echelon: EchelonReferential): string | undefined {
    const text = this.normalizeText(`${echelon.echelon ?? ''} ${echelon.libelle ?? ''} ${echelon.description ?? ''}`);
    if (text.includes('exceptionnel')) {
      return 'EXCEPTIONNEL';
    }

    const match = text.match(/\b(1|2|3|4|5|6|7|8|9|10|11)\b/);
    return match?.[1];
  }

  private formatEchelleRange(keys: EchelleBusinessKey[]): string {
    if (keys.length === 1) {
      return keys[0] === 'HORS_ECHELLE' ? 'Hors Echelle' : `Echelle ${keys[0]}`;
    }

    const numericKeys = keys.filter(key => key !== 'HORS_ECHELLE').map(Number);
    const first = Math.min(...numericKeys);
    const last = Math.max(...numericKeys);
    return `Echelle ${first} a ${last}`;
  }

  private normalizeText(value?: string): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’']/g, ' ')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .toLowerCase();
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
