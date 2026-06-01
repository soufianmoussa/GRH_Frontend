import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';
import { StepperModule } from 'primeng/stepper';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { OnboardingDetail } from '../../../../models/onboarding.model';
import { AgentCreateRequest } from '../../../../models/agent-full.model';
import { AdminOnboardingService } from '../../services/admin-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { OnboardingStatusBadgeComponent } from '../../components/onboarding-status-badge/onboarding-status-badge.component';
import { DiplomesService } from '../../../documents/services/diplomes/diplomes.service';
import { FormationService } from '../../../documents/services/formation/formation.service';
import { Diplome, DiplomeCreateUpdateRequest } from '../../../documents/models/diplomes/diplome.model';
import { Formation } from '../../../../models/formation.model';
import {
  DIPLOME_ETABLISSEMENTS,
  DIPLOME_MENTIONS,
  DIPLOME_NIVEAUX,
  DIPLOME_SPECIALITES
} from '../../constants/diplome-options.constants';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AutoCompleteModule } from 'primeng/autocomplete';

type WizardStep = 1 | 2 | 3 | 4 | 5;

const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Local draft items kept in component state.
 * TODO(backend): create admin endpoints to persist these:
 *   - POST /api/admin/onboardings/{id}/cin/scan
 *   - POST /api/admin/onboardings/{id}/attestation-rib
 *   - POST /api/admin/onboardings/{id}/acte-mariage
 *   - POST /api/admin/onboardings/{id}/enfants/{enfantId}/acte-naissance
 *   - POST/PUT/DELETE /api/admin/onboardings/{id}/diplomes(/{id})(/scan)
 *   - POST/PUT/DELETE /api/admin/onboardings/{id}/certifications(/{id})(/scan)
 *   - POST/PUT/DELETE /api/admin/onboardings/{id}/formations(/{id})(/certificate)
 */
/**
 * Local-only certification draft.
 * TODO(backend): create a Certification entity + endpoint, then wire to API.
 */
export interface DraftCertification {
  uid: string;
  intitule: string;
  organisme: string;
  reference: string;
  dateObtention: Date | null;
  dateExpiration: Date | null;
  file: File | null;
}

@Component({
  selector: 'app-admin-onboarding-assisted-complete',
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
    AutoCompleteModule,
    TableModule,
    DialogModule,
    ProgressBarModule,
    MessageModule,
    StepperModule,
    TagModule,
    Toast,
    ConfirmDialog,
    OnboardingStatusBadgeComponent
  ],
  templateUrl: './admin-onboarding-assisted-complete.component.html',
  styleUrl: './admin-onboarding-assisted-complete.component.scss'
})
export class AdminOnboardingAssistedCompleteComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  submitting = signal(false);

  onboarding?: OnboardingDetail;
  onboardingId!: number;
  activeStep: WizardStep = 1;

  identityForm: FormGroup;
  contactForm: FormGroup;

  // ---- Local file slots (TODO backend persistence) ----
  pendingPhotoFile: File | null = null;
  photoPreviewUrl: string | null = null;
  pendingCinFile: File | null = null;
  pendingRibFile: File | null = null;
  pendingMariageFile: File | null = null;
  /** Acte de naissance per child, keyed by index in the FormArray */
  pendingActesNaissance = new Map<number, File>();

  // ---- Backend-backed lists ----
  diplomes: Diplome[] = [];
  formations: Formation[] = [];

  // ---- Local-only (no backend entity yet) ----
  certifications: DraftCertification[] = [];

  // ---- Curated suggestion lists for the diplome dialog ----
  readonly niveauxList: string[] = DIPLOME_NIVEAUX;
  readonly specialitesList: string[] = DIPLOME_SPECIALITES;
  readonly etablissementsList: string[] = DIPLOME_ETABLISSEMENTS;
  readonly mentionsList: string[] = DIPLOME_MENTIONS;

  niveauSuggestions: string[] = [];
  specialiteSuggestions: string[] = [];
  etablissementSuggestions: string[] = [];

  // ---- Dialog states ----
  showDiplomeDialog = false;
  editingDiplome: Diplome | null = null;
  diplomeForm: FormGroup;
  pendingDiplomeFile: File | null = null;

  showCertificationDialog = false;
  editingCertificationUid: string | null = null;
  certificationForm: FormGroup;
  pendingCertificationFile: File | null = null;

  showFormationDialog = false;
  editingFormation: Formation | null = null;
  formationForm: FormGroup;
  pendingFormationFile: File | null = null;

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
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminOnboardingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private diplomesService: DiplomesService,
    private formationService: FormationService
  ) {
    this.identityForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      cin: ['', Validators.required],
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
        id: [null as number | null],
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

    this.diplomeForm = this.fb.group({
      niveau: ['', Validators.required],
      specialite: [''],
      etablissement: [''],
      dateObtention: [null, Validators.required],
      mention: [''],
      moyenne: [null],
      codePays: ['MA']
    });

    this.certificationForm = this.fb.group({
      intitule: ['', Validators.required],
      organisme: [''],
      reference: [''],
      dateObtention: [null, Validators.required],
      dateExpiration: [null]
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
    this.onboardingId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAndStartAssisted();

    // React to situation familiale changes:
    //  - C: no spouse, no children (numEnfant forced to 0)
    //  - M: spouse required, children allowed
    //  - V/D: no spouse, children allowed
    this.identityForm.get('situation')?.valueChanges.subscribe((sit: string | null) => {
      this.applySituationRules(sit);
    });
  }

  private applySituationRules(situation: string | null | undefined): void {
    const conjointGroup = this.contactForm.get('conjoint') as FormGroup;

    if (situation === 'M') {
      // Conjoint required: re-enable validators on key fields
      conjointGroup.get('nom')?.setValidators([Validators.required]);
      conjointGroup.get('prenom')?.setValidators([Validators.required]);
      conjointGroup.get('cin')?.setValidators([Validators.required]);
    } else {
      // Reset spouse data when not married
      conjointGroup.reset({ nom: '', prenom: '', cin: '', dateNaissance: null, profession: '' });
      this.pendingMariageFile = null;
      conjointGroup.get('nom')?.clearValidators();
      conjointGroup.get('prenom')?.clearValidators();
      conjointGroup.get('cin')?.clearValidators();
    }
    conjointGroup.get('nom')?.updateValueAndValidity({ emitEvent: false });
    conjointGroup.get('prenom')?.updateValueAndValidity({ emitEvent: false });
    conjointGroup.get('cin')?.updateValueAndValidity({ emitEvent: false });

    if (situation === 'C') {
      // Single: no children
      this.enfants.clear();
      this.pendingActesNaissance.clear();
      this.identityForm.get('numEnfant')?.setValue(0, { emitEvent: false });
    }
  }

  showConjoint(): boolean {
    return this.identityForm.get('situation')?.value === 'M';
  }

  showEnfants(): boolean {
    return this.identityForm.get('situation')?.value !== 'C';
  }

  private loadAndStartAssisted(): void {
    this.loading.set(true);
    this.adminService.getById(this.onboardingId).subscribe({
      next: (o) => {
        if (o.completionMode === 'ASSISTED') {
          this.applyOnboarding(o);
          this.loading.set(false);
          return;
        }
        this.adminService.startAssisted(this.onboardingId)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (updated) => {
              this.applyOnboarding(updated);
              ToastHelper.showInfo(this.messageService, 'Mode assiste active pour ce dossier.');
            },
            error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Activation du mode assiste impossible.')
          });
      },
      error: (e) => {
        this.loading.set(false);
        ToastHelper.handleApiError(this.messageService, e, 'Erreur lors du chargement du dossier.');
      }
    });
  }

  private applyOnboarding(o: OnboardingDetail): void {
    this.onboarding = o;
    this.patchFromOnboarding();
    this.computeStartingStep();
    this.loadAgentDiplomesAndFormations();
  }

  /** Reload diplomes + formations already saved for this agent. */
  private loadAgentDiplomesAndFormations(): void {
    const matricule = this.onboarding?.matricule?.matricule
      || this.onboarding?.agent?.matricule?.matricule;
    if (!matricule) return;

    forkJoin({
      diplomes: this.diplomesService.getByMatricule(matricule).pipe(catchError(() => of([] as Diplome[]))),
      formations: this.formationService.getByMatricule(matricule).pipe(catchError(() => of([] as Formation[])))
    }).subscribe(({ diplomes, formations }) => {
      this.diplomes = diplomes;
      this.formations = formations;
    });
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

  niveauLabel(d: Diplome): string { return d.niveau ?? '-'; }
  specialiteLabel(d: Diplome): string { return d.specialite ?? '-'; }
  etablissementLabel(d: Diplome): string { return d.etablissement ?? '-'; }

  private patchFromOnboarding(): void {
    const a = this.onboarding?.agent;
    if (!a) return;
    this.identityForm.patchValue({
      nom: a.nom ?? '',
      prenom: a.prenom ?? '',
      cin: a.cin ?? '',
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
        id: primary.id ?? null,
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

  private computeStartingStep(): void {
    const step = this.onboarding?.currentStep;
    if (step === 'PROFILE') this.activeStep = 2;
    else if (step === 'DOCUMENTS') this.activeStep = 4;
    else if (step === 'REVIEW' || step === 'VALIDATION') this.activeStep = 5;
    else this.activeStep = 1;
  }

  // ---------- Navigation ----------
  goTo(step: WizardStep, activate?: (v: number) => void): void {
    this.activeStep = step;
    activate?.(step);
  }

  next(activate?: (v: number) => void): void {
    if (this.activeStep === 2 && !this.validateIdentity()) return;
    if (this.activeStep === 3 && !this.validateContact()) return;
    const target = Math.min(5, this.activeStep + 1) as WizardStep;
    this.goTo(target, activate);
  }

  // ---------- Profile save ----------
  saveIdentity(thenNext?: (v: number) => void): void {
    if (!this.validateIdentity()) return;
    this.persistProfile(thenNext);
  }

  saveContact(thenNext?: (v: number) => void): void {
    if (!this.validateContact()) return;
    this.persistProfile(thenNext);
  }

  private persistProfile(thenNext?: (v: number) => void): void {
    const a = this.onboarding?.agent;
    if (!a) return;
    const id = this.identityForm.value;
    const contact = this.contactForm.value;

    const adresseRaw = contact.adresse ?? {};
    const adresseSan = this.sanitizeObject({
      type: adresseRaw.type || 'PRINCIPALE',
      adresse: adresseRaw.adresse,
      codePostal: adresseRaw.codePostal,
      ville: adresseRaw.ville,
      pays: adresseRaw.pays,
      telephone: adresseRaw.telephone
    });
    // Preserve the existing adresse id so the backend does an UPDATE
    // instead of an INSERT (which would violate the unique (agent_id, type)
    // index in agent_adresse).
    if (adresseRaw.id != null) {
      adresseSan['id'] = adresseRaw.id;
    }
    const hasAdresse = Object.keys(adresseSan).some(k => k !== 'type' && k !== 'id' && adresseSan[k] != null);
    const banqueSan = this.sanitizeObject(contact.coordonneesBancaires ?? {});
    const hasBanque = Object.keys(banqueSan).length > 0;

    const payload: AgentCreateRequest = {
      matriculeId: a.matricule?.id ?? null,
      nom: id.nom,
      prenom: id.prenom,
      cin: id.cin,
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
    if (hasAdresse) payload.adresses = [adresseSan as any];
    if (hasBanque) payload.coordonneesBancaires = banqueSan as any;

    this.saving.set(true);
    this.adminService.updateProfile(this.onboardingId, payload as any)
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
    // Re-key the pending naissance Map after a removal.
    const reindexed = new Map<number, File>();
    this.pendingActesNaissance.forEach((file, idx) => {
      if (idx < i) reindexed.set(idx, file);
      else if (idx > i) reindexed.set(idx - 1, file);
    });
    this.pendingActesNaissance = reindexed;
  }

  // ---------- File pickers (local state for now) ----------
  onPhotoFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!this.validatePhoto(file)) return;
    this.pendingPhotoFile = file;
    if (this.photoPreviewUrl) URL.revokeObjectURL(this.photoPreviewUrl);
    this.photoPreviewUrl = URL.createObjectURL(file);
  }

  removePhoto(): void {
    if (this.photoPreviewUrl) URL.revokeObjectURL(this.photoPreviewUrl);
    this.photoPreviewUrl = null;
    this.pendingPhotoFile = null;
  }

  private validatePhoto(file: File): boolean {
    const imageMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!imageMimes.includes(file.type)) {
      ToastHelper.showError(this.messageService, 'Photo de profil : seuls les formats JPEG, PNG et WebP sont acceptes.');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      ToastHelper.showError(this.messageService, 'Photo de profil : 5 MB maximum.');
      return false;
    }
    return true;
  }

  onCinFileSelected(event: Event): void {
    const file = this.pickFile(event);
    if (!file) return;
    this.pendingCinFile = file;
    this.uploadCinScan(file);
  }

  /** Find the CIN OnboardingDocument slot created by the backend at initialization. */
  private findCinDocument() {
    return (this.onboarding?.documents ?? []).find(d =>
      d.type === 'CARTE_NATIONALE' ||
      d.code === 'CARTE_NATIONALE' ||
      (d.required === true)
    );
  }

  /** Upload the CIN scan to the matching OnboardingDocument slot. */
  private uploadCinScan(file: File): void {
    const cinDoc = this.findCinDocument();
    if (!cinDoc) {
      ToastHelper.showWarn(this.messageService, 'Aucun emplacement CIN cote backend. Le fichier reste en attente.');
      return;
    }
    this.saving.set(true);
    this.adminService.uploadDocument(this.onboardingId, cinDoc.id, file)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (o) => {
          this.onboarding = o;
          ToastHelper.showSuccess(this.messageService, 'Scan CIN televerse.');
        },
        error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Televersement du scan CIN impossible.')
      });
  }

  onRibFileSelected(event: Event): void {
    const file = this.pickFile(event);
    if (file) this.pendingRibFile = file;
  }

  onMariageFileSelected(event: Event): void {
    const file = this.pickFile(event);
    if (file) this.pendingMariageFile = file;
  }

  onActeNaissanceSelected(event: Event, index: number): void {
    const file = this.pickFile(event);
    if (file) this.pendingActesNaissance.set(index, file);
  }

  hasActeNaissance(index: number): boolean {
    return this.pendingActesNaissance.has(index);
  }

  acteNaissanceName(index: number): string | null {
    return this.pendingActesNaissance.get(index)?.name ?? null;
  }

  private pickFile(event: Event): File | null {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return null;
    if (!this.validateFile(file)) return null;
    return file;
  }

  // ---------- Diplomes (persisted via /api/diplomes) ----------
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
    const agentId = this.onboarding?.agent?.id;
    if (!agentId) {
      ToastHelper.showError(this.messageService, 'Agent introuvable.');
      return;
    }
    const v = this.diplomeForm.value;
    const payload: DiplomeCreateUpdateRequest = {
      agentId,
      niveau: (v.niveau || '').trim(),
      specialite: ((v.specialite || '') as string).trim() || undefined,
      etablissement: ((v.etablissement || '') as string).trim() || undefined,
      dateObtention: this.toIsoDate(v.dateObtention) ?? '',
      mention: v.mention || '',
      moyenne: v.moyenne ?? 0,
      codePays: v.codePays || 'MA'
    };

    this.saving.set(true);
    const op$ = this.editingDiplome
      ? this.diplomesService.update(this.editingDiplome.id, payload)
      : this.diplomesService.add(payload);

    op$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (saved) => {
        // If a scan was attached, upload it now.
        if (this.pendingDiplomeFile) {
          this.diplomesService.uploadScan(saved.id, this.pendingDiplomeFile).subscribe({
            next: (withScan) => {
              this.upsertDiplome(withScan);
              this.showDiplomeDialog = false;
              ToastHelper.showSuccess(this.messageService, 'Diplome enregistre.');
            },
            error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Televersement scan diplome impossible.')
          });
        } else {
          this.upsertDiplome(saved);
          this.showDiplomeDialog = false;
          ToastHelper.showSuccess(this.messageService, 'Diplome enregistre.');
        }
      },
      error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Enregistrement du diplome impossible.')
    });
  }

  onDiplomeFileSelected(event: Event): void {
    const file = this.pickFile(event);
    if (file) this.pendingDiplomeFile = file;
  }

  deleteDiplome(d: Diplome): void {
    this.confirmationService.confirm({
      message: 'Supprimer ce diplome ?',
      accept: () => {
        this.diplomesService.delete(d.id).subscribe({
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

  // ---------- Certifications (local CRUD) ----------
  openNewCertification(): void {
    this.editingCertificationUid = null;
    this.pendingCertificationFile = null;
    this.certificationForm.reset();
    this.showCertificationDialog = true;
  }

  openEditCertification(c: DraftCertification): void {
    this.editingCertificationUid = c.uid;
    this.pendingCertificationFile = c.file;
    this.certificationForm.reset({
      intitule: c.intitule,
      organisme: c.organisme,
      reference: c.reference,
      dateObtention: c.dateObtention,
      dateExpiration: c.dateExpiration
    });
    this.showCertificationDialog = true;
  }

  saveCertification(): void {
    if (this.certificationForm.invalid) {
      this.certificationForm.markAllAsTouched();
      return;
    }
    const v = this.certificationForm.value;
    const draft: DraftCertification = {
      uid: this.editingCertificationUid ?? this.newUid(),
      intitule: v.intitule,
      organisme: v.organisme || '',
      reference: v.reference || '',
      dateObtention: v.dateObtention,
      dateExpiration: v.dateExpiration,
      file: this.pendingCertificationFile
    };
    if (this.editingCertificationUid) {
      this.certifications = this.certifications.map(x => x.uid === this.editingCertificationUid ? draft : x);
    } else {
      this.certifications = [...this.certifications, draft];
    }
    this.showCertificationDialog = false;
    ToastHelper.showSuccess(this.messageService, 'Certification enregistree (brouillon local).');
  }

  onCertificationFileSelected(event: Event): void {
    const file = this.pickFile(event);
    if (file) this.pendingCertificationFile = file;
  }

  deleteCertification(c: DraftCertification): void {
    this.confirmationService.confirm({
      message: 'Supprimer cette certification ?',
      accept: () => {
        this.certifications = this.certifications.filter(x => x.uid !== c.uid);
        ToastHelper.showSuccess(this.messageService, 'Certification supprimee.');
      }
    });
  }

  // ---------- Formations (persisted via /api/formations) ----------
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
    const agentId = this.onboarding?.agent?.id;
    if (!agentId) {
      ToastHelper.showError(this.messageService, 'Agent introuvable.');
      return;
    }
    const v = this.formationForm.value;
    const payload: Partial<Formation> = {
      agentId,
      intituleFormation: v.intituleFormation,
      intituleStage: v.intituleStage || '',
      dateDebut: this.toIsoDate(v.dateDebut)!,
      dateFin: this.toIsoDate(v.dateFin)!
    };

    this.saving.set(true);
    const op$ = this.editingFormation
      ? this.formationService.update(this.editingFormation.id, payload)
      : this.formationService.add(payload);

    op$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (saved) => {
        if (this.pendingFormationFile) {
          this.formationService.uploadCertificate(saved.id, this.pendingFormationFile).subscribe({
            next: (withCert) => {
              this.upsertFormation(withCert);
              this.showFormationDialog = false;
              ToastHelper.showSuccess(this.messageService, 'Formation enregistree.');
            },
            error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Televersement certificat impossible.')
          });
        } else {
          this.upsertFormation(saved);
          this.showFormationDialog = false;
          ToastHelper.showSuccess(this.messageService, 'Formation enregistree.');
        }
      },
      error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Enregistrement formation impossible.')
    });
  }

  onFormationFileSelected(event: Event): void {
    const file = this.pickFile(event);
    if (file) this.pendingFormationFile = file;
  }

  deleteFormation(f: Formation): void {
    this.confirmationService.confirm({
      message: 'Supprimer cette formation ?',
      accept: () => {
        this.formationService.delete(f.id).subscribe({
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

  private newUid(): string {
    return Math.random().toString(36).slice(2, 10);
  }

  // ---------- Submit ----------
  submit(): void {
    // Pre-flight: every required OnboardingDocument needs a stored file before
    // the backend will accept the submission. Try to upload the pending CIN
    // scan if we have one but the slot is still empty.
    const cinDoc = this.findCinDocument();
    const cinSlotEmpty = !!cinDoc && !cinDoc.fileName && !cinDoc.fileUrl;

    if (cinSlotEmpty && this.pendingCinFile) {
      this.saving.set(true);
      this.adminService.uploadDocument(this.onboardingId, cinDoc!.id, this.pendingCinFile)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: (o) => {
            this.onboarding = o;
            ToastHelper.showSuccess(this.messageService, 'Scan CIN televerse.');
            this.confirmAndSubmit();
          },
          error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Televersement du scan CIN impossible.')
        });
      return;
    }

    if (cinSlotEmpty) {
      ToastHelper.showError(this.messageService,
        'Le scan de la CIN est obligatoire avant soumission. Retournez a l\'etape "Identite" pour le televerser.');
      this.activeStep = 2;
      return;
    }

    // Warn if other required documents are still missing (defensive — for now
    // only CIN is created by the backend at init, but this protects future changes).
    const missing = (this.onboarding?.documents ?? [])
      .filter(d => d.required && !d.fileName && !d.fileUrl);
    if (missing.length > 0) {
      const labels = missing.map(d => d.label || d.name || d.type || d.code).join(', ');
      ToastHelper.showError(this.messageService,
        `Documents obligatoires manquants : ${labels}.`);
      return;
    }

    this.confirmAndSubmit();
  }

  private confirmAndSubmit(): void {
    this.confirmationService.confirm({
      message: 'Confirmer la soumission du dossier pour validation ?',
      header: 'Soumission du dossier',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.submitting.set(true);
        this.adminService.submit(this.onboardingId)
          .pipe(finalize(() => this.submitting.set(false)))
          .subscribe({
            next: (o) => {
              this.onboarding = o;
              ToastHelper.showSuccess(this.messageService, 'Dossier soumis pour validation.');
              this.router.navigate(['/admin/onboarding', this.onboardingId]);
            },
            error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Soumission impossible.')
          });
      }
    });
  }

  // ---------- Validation ----------
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
}
