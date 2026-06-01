import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';
import { StepperModule } from 'primeng/stepper';
import { TooltipModule } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { OnboardingDetail } from '../../../../models/onboarding.model';
import { AgentCreateRequest } from '../../../../models/agent-full.model';
import { Diplome } from '../../../documents/models/diplomes/diplome.model';
import { Formation } from '../../../../models/formation.model';
import { AgentDocument } from '../../../../models/agent-document.model';
import {
  AgentOnboardingService,
  OnboardingCinRequest,
  OnboardingDiplomeRequest,
  OnboardingFormationRequest
} from '../../services/agent-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { OnboardingStatusBadgeComponent } from '../../components/onboarding-status-badge/onboarding-status-badge.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import {
  DIPLOME_ETABLISSEMENTS,
  DIPLOME_MENTIONS,
  DIPLOME_NIVEAUX,
  DIPLOME_SPECIALITES
} from '../../constants/diplome-options.constants';

type WizardStep = 1 | 2 | 3 | 4 | 5;

const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Component({
  selector: 'app-agent-onboarding-wizard',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TableModule,
    DialogModule,
    TagModule,
    ProgressBarModule,
    MessageModule,
    StepperModule,
    AutoCompleteModule,
    Toast,
    ConfirmDialog,
    OnboardingStatusBadgeComponent
  ],
  templateUrl: './agent-onboarding-wizard.component.html',
  styleUrl: './agent-onboarding-wizard.component.scss'
})
export class AgentOnboardingWizardComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  submitting = signal(false);

  onboarding?: OnboardingDetail;
  activeStep: WizardStep = 1;

  identityForm: FormGroup;
  contactForm: FormGroup;
  cinForm: FormGroup;
  diplomeForm: FormGroup;
  formationForm: FormGroup;

  cin: AgentDocument | null = null;
  diplomes: Diplome[] = [];
  formations: Formation[] = [];

  showDiplomeDialog = false;
  editingDiplome: Diplome | null = null;
  pendingDiplomeFile: File | null = null;

  showFormationDialog = false;
  editingFormation: Formation | null = null;
  pendingFormationFile: File | null = null;

  pendingCinFile: File | null = null;

  // Curated suggestion lists (free text allowed via p-autoComplete).
  readonly niveauxList: string[] = DIPLOME_NIVEAUX;
  readonly specialitesList: string[] = DIPLOME_SPECIALITES;
  readonly etablissementsList: string[] = DIPLOME_ETABLISSEMENTS;
  readonly mentionsList: string[] = DIPLOME_MENTIONS;

  niveauSuggestions: string[] = [];
  specialiteSuggestions: string[] = [];
  etablissementSuggestions: string[] = [];

  sexeOptions = [
    { label: 'Masculin', value: 'M' },
    { label: 'Feminin', value: 'F' }
  ];
  situationOptions = [
    { label: 'Celibataire', value: 'C' },
    { label: 'Marie(e)', value: 'M' },
    { label: 'Veuf(ve)', value: 'V' },
    { label: 'Divorce(e)', value: 'D' }
  ];

  constructor(
    private fb: FormBuilder,
    private service: AgentOnboardingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.identityForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      sexe: ['', Validators.required],
      situation: [''],
      dateNaissance: ['', Validators.required],
      nomTuteurAr: [''],
      prenomTuteurAr: [''],
      pprTuteur: [''],
      dateTutorat: [''],
      numEnfant: [0]
    });

    this.contactForm = this.fb.group({
      adresse: this.fb.group({
        type: ['PRINCIPALE'],
        adresse: ['', Validators.required],
        codePostal: [''],
        ville: ['', Validators.required],
        pays: ['Maroc'],
        telephone: ['']
      }),
      coordonneesBancaires: this.fb.group({
        banque: [''],
        compte: [''],
        rib: [''],
        iban: ['']
      }),
      conjoint: this.fb.group({
        nom: [''],
        prenom: [''],
        cin: [''],
        dateNaissance: [''],
        profession: ['']
      }),
      enfants: this.fb.array([])
    });

    this.cinForm = this.fb.group({
      numero: ['', [Validators.required, Validators.minLength(4)]],
      dateDelivrance: [null],
      dateExpiration: [null],
      lieuDelivrance: ['']
    });

    this.diplomeForm = this.fb.group({
      niveau: ['', Validators.required],
      specialite: [''],
      etablissement: [''],
      dateObtention: [null, Validators.required],
      mention: [''],
      moyenne: [null],
      codePays: ['MA']
    });

    this.formationForm = this.fb.group({
      intituleFormation: ['', Validators.required],
      intituleStage: [''],
      dateDebut: [null, Validators.required],
      dateFin: [null, Validators.required]
    });
  }

  get enfants(): FormArray {
    return this.contactForm.get('enfants') as FormArray;
  }

  ngOnInit(): void {
    this.load();
  }

  filterNiveau(event: { query: string }) {
    this.niveauSuggestions = this.filterList(this.niveauxList, event.query);
  }
  filterSpecialite(event: { query: string }) {
    this.specialiteSuggestions = this.filterList(this.specialitesList, event.query);
  }
  filterEtablissement(event: { query: string }) {
    this.etablissementSuggestions = this.filterList(this.etablissementsList, event.query);
  }
  private filterList(list: string[], q: string): string[] {
    const needle = (q || '').trim().toLowerCase();
    if (!needle) return list.slice(0, 30);
    return list.filter(v => v.toLowerCase().includes(needle));
  }

  load(): void {
    this.loading.set(true);
    forkJoin({
      onboarding: this.service.getMine(),
      docs: this.service.getMyDocuments().pipe(catchError(() => of({ cin: null, diplomes: [], formations: [] })))
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ onboarding, docs }) => {
          this.onboarding = onboarding;
          this.cin = docs.cin ?? null;
          this.diplomes = docs.diplomes ?? [];
          this.formations = docs.formations ?? [];
          this.patchFromOnboarding();
          this.patchCinForm();
          this.computeStartingStep();
        },
        error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Chargement impossible.')
      });
  }

  private patchFromOnboarding(): void {
    const a = this.onboarding?.agent;
    if (!a) return;
    this.identityForm.patchValue({
      nom: a.nom ?? '',
      prenom: a.prenom ?? '',
      sexe: a.sexe ?? '',
      situation: a.situation ?? '',
      dateNaissance: a.dateNaissance ? new Date(a.dateNaissance) : null,
      nomTuteurAr: a.nomTuteurAr ?? '',
      prenomTuteurAr: a.prenomTuteurAr ?? '',
      pprTuteur: a.pprTuteur ?? '',
      dateTutorat: a.dateTutorat ? new Date(a.dateTutorat) : null,
      numEnfant: a.numEnfant ?? 0
    });
    const primary = (a.adresses ?? [])[0];
    if (primary) {
      (this.contactForm.get('adresse') as FormGroup).patchValue({
        type: primary.type ?? 'PRINCIPALE',
        adresse: primary.adresse ?? '',
        codePostal: primary.codePostal ?? '',
        ville: primary.ville ?? '',
        pays: primary.pays ?? 'Maroc',
        telephone: primary.telephone ?? ''
      });
    }
    if (a.coordonneesBancaires) {
      (this.contactForm.get('coordonneesBancaires') as FormGroup).patchValue(a.coordonneesBancaires);
    }
    if (a.conjoint) {
      (this.contactForm.get('conjoint') as FormGroup).patchValue({
        nom: a.conjoint.nom ?? '',
        prenom: a.conjoint.prenom ?? '',
        cin: a.conjoint.cin ?? '',
        dateNaissance: a.conjoint.dateNaissance ? new Date(a.conjoint.dateNaissance) : null,
        profession: a.conjoint.profession ?? ''
      });
    }
    this.enfants.clear();
    (a.enfants ?? []).forEach(e => this.enfants.push(this.fb.group({
      nom: [e.nom ?? '', Validators.required],
      prenom: [e.prenom ?? '', Validators.required],
      dateNaissance: [e.dateNaissance ? new Date(e.dateNaissance) : null],
      sexe: [e.sexe ?? ''],
      situation: [e.situation ?? ''],
      niveauScolaire: [e.niveauScolaire ?? '']
    })));
  }

  private patchCinForm(): void {
    if (!this.cin && this.onboarding?.agent?.cin) {
      this.cinForm.patchValue({ numero: this.onboarding.agent.cin });
      return;
    }
    if (this.cin) {
      this.cinForm.patchValue({
        numero: this.onboarding?.agent?.cin ?? '',
        dateDelivrance: this.cin.issuedAt ? new Date(this.cin.issuedAt) : null,
        dateExpiration: this.cin.expiresAt ? new Date(this.cin.expiresAt) : null,
        lieuDelivrance: this.cin.description ?? ''
      });
    }
  }

  private computeStartingStep(): void {
    if (!this.onboarding) return;
    const step = this.onboarding.currentStep;
    if (step === 'PROFILE') this.activeStep = 2;
    else if (step === 'DOCUMENTS') this.activeStep = 4;
    else if (step === 'REVIEW' || step === 'VALIDATION') this.activeStep = 5;
    else this.activeStep = 1;
  }

  // ----- Navigation -----

  goTo(step: WizardStep, activate?: (v: number) => void): void {
    this.activeStep = step;
    activate?.(step);
  }

  next(activate?: (v: number) => void): void {
    if (this.activeStep === 2 && !this.validateIdentity()) return;
    if (this.activeStep === 3 && !this.validateContact()) return;
    if (this.activeStep === 4 && !this.validateDocuments()) return;
    const target = Math.min(5, this.activeStep + 1) as WizardStep;
    this.goTo(target, activate);
  }

  prev(activate?: (v: number) => void): void {
    const target = Math.max(1, this.activeStep - 1) as WizardStep;
    this.goTo(target, activate);
  }

  // ----- Step 2 / 3 save -----

  saveIdentity(thenNext?: (v: number) => void): void {
    if (!this.validateIdentity()) return;
    this.persistProfile(thenNext, this.identityForm.value);
  }

  saveContact(thenNext?: (v: number) => void): void {
    if (!this.validateContact()) return;
    this.persistProfile(thenNext, {});
  }

  private persistProfile(thenNext: ((v: number) => void) | undefined, _extra: Record<string, unknown>): void {
    const a = this.onboarding?.agent;
    if (!a) return;
    const id = this.identityForm.value;
    const contact = this.contactForm.value;

    // Resolve CIN: keep existing value or use newly entered one; omit if still blank
    // (backend has @NotBlank on cin only when actually submitted/finalized).
    const cinValue = this.blankToNull(a.cin) ?? this.blankToNull(this.cinForm.value.numero);

    // Sanitize address: only send when at least one field is filled.
    const adresseRaw = contact.adresse ?? {};
    const adresseSan = this.sanitizeObject({
      type: adresseRaw.type || 'PRINCIPALE',
      adresse: adresseRaw.adresse,
      codePostal: adresseRaw.codePostal,
      ville: adresseRaw.ville,
      pays: adresseRaw.pays,
      telephone: adresseRaw.telephone
    });
    const hasAdresse = Object.keys(adresseSan).some(k => k !== 'type' && adresseSan[k] != null);

    // Sanitize bank: only send when at least one field is filled.
    const banqueSan = this.sanitizeObject(contact.coordonneesBancaires ?? {});
    const hasBanque = Object.keys(banqueSan).length > 0;

    const payload: Partial<AgentCreateRequest> = {
      matriculeId: a.matricule?.id ?? null,
      nom: id.nom,
      prenom: id.prenom,
      sexe: id.sexe,
      situation: id.situation || undefined,
      dateNaissance: this.toIsoDate(id.dateNaissance),
      nomTuteurAr: id.nomTuteurAr || undefined,
      prenomTuteurAr: id.prenomTuteurAr || undefined,
      pprTuteur: id.pprTuteur || undefined,
      dateTutorat: this.toIsoDate(id.dateTutorat),
      numEnfant: id.numEnfant ?? 0,
      conjoint: this.hasConjoint(contact.conjoint) ? {
        ...contact.conjoint,
        dateNaissance: this.toIsoDate(contact.conjoint.dateNaissance)
      } : null,
      enfants: (contact.enfants ?? []).map((e: any) => ({
        ...e,
        dateNaissance: this.toIsoDate(e.dateNaissance)
      }))
    };

    if (cinValue) payload.cin = cinValue;
    if (hasAdresse) payload.adresses = [adresseSan as any];
    if (hasBanque) payload.coordonneesBancaires = banqueSan as any;
    this.saving.set(true);
    this.service.updateProfile(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (o) => {
          this.onboarding = o;
          ToastHelper.showSuccess(this.messageService, 'Informations enregistrees.');
          if (thenNext) this.next(thenNext);
        },
        error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Enregistrement impossible.')
      });
  }

  private hasConjoint(c: any): boolean {
    return !!(c && (c.nom || c.prenom || c.cin));
  }

  /** Returns null when value is null/undefined or an empty/whitespace string. */
  private blankToNull(v: any): string | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s.length ? s : null;
  }

  /** Strips empty-string / null / undefined entries from a flat object. */
  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj || {})) {
      const cleaned = typeof v === 'string' ? v.trim() : v;
      if (cleaned !== '' && cleaned !== null && cleaned !== undefined) {
        out[k] = cleaned;
      }
    }
    return out;
  }

  addEnfant(): void {
    this.enfants.push(this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      dateNaissance: [null],
      sexe: [''],
      situation: [''],
      niveauScolaire: ['']
    }));
  }

  removeEnfant(i: number): void {
    this.enfants.removeAt(i);
  }

  // ----- Step 4 - CIN -----

  saveCin(): void {
    if (this.cinForm.invalid) {
      this.cinForm.markAllAsTouched();
      ToastHelper.showError(this.messageService, 'Veuillez renseigner le numero CIN.');
      return;
    }
    const v = this.cinForm.value;
    const payload: OnboardingCinRequest = {
      numero: v.numero,
      dateDelivrance: this.toIsoDate(v.dateDelivrance),
      dateExpiration: this.toIsoDate(v.dateExpiration),
      lieuDelivrance: v.lieuDelivrance
    };
    this.saving.set(true);
    this.service.saveCin(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (dto) => {
          this.cin = dto;
          ToastHelper.showSuccess(this.messageService, 'Informations CIN enregistrees.');
          if (this.pendingCinFile) {
            this.uploadCinScan(this.pendingCinFile);
            this.pendingCinFile = null;
          }
        },
        error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Erreur enregistrement CIN.')
      });
  }

  onCinFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!this.validateFile(file)) return;
    if (!this.cin) {
      this.pendingCinFile = file;
      this.saveCin();
      return;
    }
    this.uploadCinScan(file);
  }

  private uploadCinScan(file: File): void {
    this.saving.set(true);
    this.service.uploadCinScan(file)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (dto) => {
          this.cin = dto;
          ToastHelper.showSuccess(this.messageService, 'Scan CIN televerse.');
        },
        error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Televersement impossible.')
      });
  }

  // ----- Step 4 - Diplomes -----

  openNewDiplome(): void {
    this.editingDiplome = null;
    this.pendingDiplomeFile = null;
    this.diplomeForm.reset({ codePays: 'MA' });
    this.showDiplomeDialog = true;
  }

  openEditDiplome(d: Diplome): void {
    this.editingDiplome = d;
    this.pendingDiplomeFile = null;
    this.diplomeForm.reset({
      niveau: d.niveau ?? '',
      specialite: d.specialite ?? '',
      etablissement: d.etablissement ?? '',
      dateObtention: d.dateObtention ? new Date(d.dateObtention) : null,
      mention: d.mention ?? '',
      moyenne: d.moyenne ?? null,
      codePays: d.codePays ?? 'MA'
    });
    this.showDiplomeDialog = true;
  }

  saveDiplome(): void {
    if (this.diplomeForm.invalid) {
      this.diplomeForm.markAllAsTouched();
      return;
    }
    const v = this.diplomeForm.value;
    const payload: OnboardingDiplomeRequest = {
      niveau: (v.niveau || '').trim(),
      specialite: ((v.specialite || '') as string).trim() || null,
      etablissement: ((v.etablissement || '') as string).trim() || null,
      dateObtention: this.toIsoDate(v.dateObtention),
      mention: v.mention || null,
      moyenne: v.moyenne,
      codePays: v.codePays
    };
    this.saving.set(true);
    const op$ = this.editingDiplome
      ? this.service.updateDiplome(this.editingDiplome.id, payload)
      : this.service.createDiplome(payload);
    op$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (saved) => {
        if (this.pendingDiplomeFile) {
          this.service.uploadDiplomeScan(saved.id, this.pendingDiplomeFile).subscribe({
            next: (withScan) => {
              this.upsertDiplome(withScan);
              this.showDiplomeDialog = false;
              ToastHelper.showSuccess(this.messageService, 'Diplome enregistre.');
            },
            error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Erreur televersement scan.')
          });
        } else {
          this.upsertDiplome(saved);
          this.showDiplomeDialog = false;
          ToastHelper.showSuccess(this.messageService, 'Diplome enregistre.');
        }
      },
      error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Erreur enregistrement diplome.')
    });
  }

  onDiplomeFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.validateFile(file)) return;
    this.pendingDiplomeFile = file;
  }

  deleteDiplome(d: Diplome): void {
    this.confirmationService.confirm({
      message: `Supprimer le diplome ?`,
      accept: () => {
        this.service.deleteDiplome(d.id).subscribe({
          next: () => {
            this.diplomes = this.diplomes.filter(x => x.id !== d.id);
            ToastHelper.showSuccess(this.messageService, 'Diplome supprime.');
          },
          error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Suppression impossible.')
        });
      }
    });
  }

  private upsertDiplome(d: Diplome): void {
    const i = this.diplomes.findIndex(x => x.id === d.id);
    if (i >= 0) this.diplomes[i] = d;
    else this.diplomes = [...this.diplomes, d];
  }

  // ----- Step 4 - Formations -----

  openNewFormation(): void {
    this.editingFormation = null;
    this.pendingFormationFile = null;
    this.formationForm.reset();
    this.showFormationDialog = true;
  }

  openEditFormation(f: Formation): void {
    this.editingFormation = f;
    this.pendingFormationFile = null;
    this.formationForm.reset({
      intituleFormation: f.intituleFormation,
      intituleStage: f.intituleStage,
      dateDebut: f.dateDebut ? new Date(f.dateDebut) : null,
      dateFin: f.dateFin ? new Date(f.dateFin) : null
    });
    this.showFormationDialog = true;
  }

  saveFormation(): void {
    if (this.formationForm.invalid) {
      this.formationForm.markAllAsTouched();
      return;
    }
    const v = this.formationForm.value;
    const payload: OnboardingFormationRequest = {
      intituleFormation: v.intituleFormation,
      intituleStage: v.intituleStage,
      dateDebut: this.toIsoDate(v.dateDebut),
      dateFin: this.toIsoDate(v.dateFin)
    };
    this.saving.set(true);
    const op$ = this.editingFormation
      ? this.service.updateFormation(this.editingFormation.id, payload)
      : this.service.createFormation(payload);
    op$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (saved) => {
        if (this.pendingFormationFile) {
          this.service.uploadFormationCertificate(saved.id, this.pendingFormationFile).subscribe({
            next: (withCert) => {
              this.upsertFormation(withCert);
              this.showFormationDialog = false;
              ToastHelper.showSuccess(this.messageService, 'Formation enregistree.');
            },
            error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Erreur televersement certificat.')
          });
        } else {
          this.upsertFormation(saved);
          this.showFormationDialog = false;
          ToastHelper.showSuccess(this.messageService, 'Formation enregistree.');
        }
      },
      error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Erreur enregistrement formation.')
    });
  }

  onFormationFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.validateFile(file)) return;
    this.pendingFormationFile = file;
  }

  deleteFormation(f: Formation): void {
    this.confirmationService.confirm({
      message: `Supprimer la formation ?`,
      accept: () => {
        this.service.deleteFormation(f.id).subscribe({
          next: () => {
            this.formations = this.formations.filter(x => x.id !== f.id);
            ToastHelper.showSuccess(this.messageService, 'Formation supprimee.');
          },
          error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Suppression impossible.')
        });
      }
    });
  }

  private upsertFormation(f: Formation): void {
    const i = this.formations.findIndex(x => x.id === f.id);
    if (i >= 0) this.formations[i] = f;
    else this.formations = [...this.formations, f];
  }

  // ----- Step 5 - Submit -----

  submit(): void {
    this.submitting.set(true);
    this.service.submit()
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (o) => {
          this.onboarding = o;
          ToastHelper.showSuccess(this.messageService, 'Dossier soumis pour validation.');
          this.router.navigate(['/mon-onboarding']);
        },
        error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Soumission impossible.')
      });
  }

  // ----- Validation -----

  locked(): boolean {
    const s = this.onboarding?.status;
    return s === 'PENDING_VALIDATION' || s === 'VALIDATED' || s === 'ACTIVE';
  }

  private validateIdentity(): boolean {
    if (this.identityForm.invalid) {
      this.identityForm.markAllAsTouched();
      ToastHelper.showError(this.messageService, 'Identite : champs obligatoires manquants.');
      return false;
    }
    return true;
  }

  private validateContact(): boolean {
    if (this.contactForm.get('adresse')?.invalid) {
      this.contactForm.markAllAsTouched();
      ToastHelper.showError(this.messageService, 'Adresse principale obligatoire.');
      return false;
    }
    return true;
  }

  private validateDocuments(): boolean {
    if (!this.cin || !this.cin.fileUrl) {
      ToastHelper.showError(this.messageService, 'CIN : informations + scan obligatoires.');
      return false;
    }
    if (this.diplomes.length === 0) {
      ToastHelper.showError(this.messageService, 'Au moins un diplome est obligatoire.');
      return false;
    }
    if (!this.diplomes.some(d => !!d.scanUrl)) {
      ToastHelper.showError(this.messageService, 'Au moins un diplome avec scan est obligatoire.');
      return false;
    }
    return true;
  }

  private validateFile(file: File): boolean {
    if (file.size > MAX_FILE_SIZE) {
      ToastHelper.showError(this.messageService, 'Fichier trop volumineux (max 10 MB).');
      return false;
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      ToastHelper.showError(this.messageService, 'Type non autorise (PDF, JPEG, PNG, WebP).');
      return false;
    }
    return true;
  }

  private toIsoDate(v: any): string | undefined {
    if (!v) return undefined;
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    return v;
  }

  // ----- Convenience for template -----

  niveauLabel(d: Diplome): string {
    return d.niveau ?? '-';
  }

  etablissementLabel(d: Diplome): string {
    return d.etablissement ?? '-';
  }

  specialiteLabel(d: Diplome): string {
    return d.specialite ?? '-';
  }
}
