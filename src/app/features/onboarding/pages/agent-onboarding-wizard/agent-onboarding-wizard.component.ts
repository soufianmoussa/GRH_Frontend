import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
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
import { AgentDocument, AgentDocumentType } from '../../../../models/agent-document.model';
import {
  AgentOnboardingService,
  OnboardingCinRequest,
  OnboardingDiplomeRequest,
  OnboardingFormationRequest
} from '../../services/agent-onboarding.service';
import { AgentDocumentsService } from '../../../dossier-agent/services/dossiers-agents/agent-documents.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { stripEmptyStrings } from '../../../../shared/utils/payload-utils';
import { OnboardingStatusBadgeComponent } from '../../components/onboarding-status-badge/onboarding-status-badge.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import {
  DIPLOME_ETABLISSEMENTS,
  DIPLOME_MENTIONS,
  DIPLOME_NIVEAUX,
  DIPLOME_SPECIALITES
} from '../../constants/diplome-options.constants';

type WizardStep = 1 | 2 | 3 | 4 | 5;

/**
 * Local-only certification draft (mirror admin).
 * TODO(backend): create a Certification entity + endpoint to persist.
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

  // ----- Certifications (local-state only, mirror admin) -----
  certifications: DraftCertification[] = [];
  certificationForm: FormGroup;
  showCertificationDialog = false;
  editingCertificationUid: string | null = null;
  pendingCertificationFile: File | null = null;

  pendingCinFile: File | null = null;

  // Preview URL for the profile photo (object URL for pending file or remote URL when stored)
  photoPreviewUrl: string | null = null;

  // ----- AgentDocuments (Photo / RIB / Mariage / Acte naissance) -----
  // Same hydrate-and-replace pattern used in the admin wizard so re-uploads
  // overwrite the existing MinIO object instead of creating duplicates.
  existingDocs: Map<AgentDocumentType, AgentDocument> = new Map();
  existingActesNaissance: Map<string, AgentDocument> = new Map();
  existingPhoto?: AgentDocument;
  existingRib?: AgentDocument;
  existingMariage?: AgentDocument;
  existingActeNaissanceByIndex: Map<number, AgentDocument> = new Map();
  pendingPhotoFile: File | null = null;
  pendingRibFile: File | null = null;
  pendingMariageFile: File | null = null;
  pendingActeNaissanceByIndex: Map<number, File> = new Map();

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
    { label: 'Féminin', value: 'F' }
  ];
  situationOptions = [
    { label: 'Célibataire', value: 'C' },
    { label: 'Marié(e)', value: 'M' },
    { label: 'Veuf(ve)', value: 'V' },
    { label: 'Divorcé(e)', value: 'D' }
  ];

  // Téléphone marocain / international : indicatif optionnel, 8 à 15 chiffres, espaces/tirets tolérés.
  static readonly PHONE_PATTERN = /^\+?[\d\s-]{8,15}$/;
  // RIB marocain : 24 chiffres. IBAN : 2 lettres pays + 2 chiffres clé + 10 à 30 alphanum.
  static readonly RIB_PATTERN = /^\d{24}$/;
  static readonly IBAN_PATTERN = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

  constructor(
    private fb: FormBuilder,
    private service: AgentOnboardingService,
    private agentDocumentsService: AgentDocumentsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    // Les maxLength reflètent EXACTEMENT les longueurs de colonnes backend (DTO @Size + DB)
    // pour afficher un message précis sous le champ, en cohérence avec l'API.
    this.identityForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.maxLength(50)]],
      sexe: ['', Validators.required],
      situation: [''],
      dateNaissance: ['', Validators.required],
      nomTuteurAr: ['', Validators.maxLength(50)],
      prenomTuteurAr: ['', Validators.maxLength(50)],
      pprTuteur: ['', Validators.maxLength(20)],
      dateTutorat: [''],
      numEnfant: [0]
    });

    this.contactForm = this.fb.group({
      adresse: this.fb.group({
        type: ['PRINCIPALE'],
        adresse: ['', [Validators.required, Validators.maxLength(255)]],
        codePostal: ['', Validators.maxLength(10)],
        ville: ['', [Validators.required, Validators.maxLength(50)]],
        pays: ['Maroc', Validators.maxLength(50)],
        telephone: ['', [Validators.pattern(AgentOnboardingWizardComponent.PHONE_PATTERN), Validators.maxLength(20)]]
      }),
      coordonneesBancaires: this.fb.group({
        banque: ['', Validators.maxLength(80)],
        compte: ['', Validators.maxLength(34)],
        rib: ['', [Validators.pattern(AgentOnboardingWizardComponent.RIB_PATTERN), Validators.maxLength(24)]],
        iban: ['', [Validators.pattern(AgentOnboardingWizardComponent.IBAN_PATTERN), Validators.maxLength(34)]]
      }),
      conjoint: this.fb.group({
        nom: ['', Validators.maxLength(50)],
        prenom: ['', Validators.maxLength(50)],
        cin: ['', Validators.maxLength(20)],
        dateNaissance: [''],
        profession: ['', Validators.maxLength(80)]
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

    this.certificationForm = this.fb.group({
      intitule: ['', Validators.required],
      organisme: [''],
      reference: [''],
      dateObtention: [null, Validators.required],
      dateExpiration: [null]
    });
  }

  // ---------- Certifications (local-only) ----------

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
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.validateFile(file)) return;
    this.pendingCertificationFile = file;
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

  private newUid(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  get enfants(): FormArray {
    return this.contactForm.get('enfants') as FormArray;
  }

  ngOnInit(): void {
    this.load();

    // Les sections conditionnelles (Conjoint / Enfants) doivent apparaître ET disparaître proprement :
    // on (dé)pose les validators et on purge les données devenues hors-contexte à chaque changement
    // de situation familiale. Évite les "champs cachés mais obligatoires" et les données figées.
    this.identityForm.get('situation')!.valueChanges.subscribe((situation) => {
      this.applySituationEffects(situation);
    });

    // Problème 3 — Le champ "Nombre d'enfants" pilote dynamiquement les formulaires enfants :
    // chaque changement génère/supprime instantanément les sous-formulaires correspondants.
    this.identityForm.get('numEnfant')!.valueChanges.subscribe((count) => {
      this.adjustEnfantsCount(count);
    });
  }

  /** Construit un sous-formulaire enfant (validators alignés sur le backend). */
  private newEnfantGroup(e?: any): FormGroup {
    return this.fb.group({
      nom: [e?.nom ?? '', [Validators.required, Validators.maxLength(50)]],
      prenom: [e?.prenom ?? '', [Validators.required, Validators.maxLength(50)]],
      dateNaissance: [e?.dateNaissance ? new Date(e.dateNaissance) : null],
      sexe: [e?.sexe ?? ''],
      situation: [e?.situation ?? ''],
      niveauScolaire: [e?.niveauScolaire ?? '', Validators.maxLength(50)]
    });
  }

  /**
   * Aligne le FormArray des enfants sur le nombre demandé : ajoute des formulaires vierges
   * si besoin, retire les excédentaires par la fin (et purge leurs actes en attente).
   */
  private adjustEnfantsCount(count: number | null | undefined): void {
    const target = Math.max(0, Math.min(20, Number(count) || 0));
    while (this.enfants.length < target) {
      this.enfants.push(this.newEnfantGroup());
    }
    while (this.enfants.length > target) {
      const idx = this.enfants.length - 1;
      this.pendingActeNaissanceByIndex.delete(idx);
      this.enfants.removeAt(idx);
    }
    this.hydrateSlotsFromExistingDocs();
  }

  /** (Re)configure validators + purge des sections conjoint/enfants selon la situation familiale. */
  private applySituationEffects(situation: string | null | undefined): void {
    const conjoint = this.contactForm.get('conjoint') as FormGroup;
    const married = situation === 'M';

    // Conjoint : requis uniquement si marié, sinon validators retirés ET données purgées.
    ['nom', 'prenom', 'cin'].forEach((field) => {
      const ctrl = conjoint.get(field)!;
      ctrl.setValidators(married ? [Validators.required] : []);
      ctrl.updateValueAndValidity({ emitEvent: false });
    });
    if (!married) {
      conjoint.reset({ nom: '', prenom: '', cin: '', dateNaissance: '', profession: '' }, { emitEvent: false });
      this.pendingMariageFile = null;
      this.existingMariage = undefined;
    }

    // Enfants : non applicables aux célibataires → purge de la fratrie et des actes en attente.
    if (situation === 'C') {
      if (this.enfants.length) {
        this.pendingActeNaissanceByIndex.clear();
        this.enfants.clear();
      }
      this.identityForm.get('numEnfant')!.setValue(0, { emitEvent: false });
    }
    this.hydrateSlotsFromExistingDocs();
  }

  // ----- Unsaved changes guard (Issue #6) -----

  /** True dès qu'un des formulaires éditables a été modifié sans enregistrement. */
  hasUnsavedChanges(): boolean {
    if (this.locked()) return false;
    return this.identityForm.dirty || this.contactForm.dirty || this.cinForm.dirty;
  }

  /** Averti par le navigateur lors d'un rechargement / fermeture d'onglet avec un brouillon non sauvegardé. */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      // Requis par certains navigateurs pour déclencher la boîte de dialogue native.
      event.returnValue = '';
    }
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
          // Aligne les validators conditionnels sur la situation chargée (sans purger les données existantes).
          this.applySituationEffects(this.identityForm.value.situation);
          // L'étape de reprise est calculée APRÈS le chargement des documents (loadExistingAgentDocuments),
          // car recapIssues dépend de la présence des pièces (photo, RIB, actes...).
          this.loadExistingAgentDocuments();
        },
        error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Chargement impossible.')
      });
  }

  /**
   * Fetches every AgentDocument that already belongs to the current agent and indexes
   * them by type so the UI shows what's already uploaded and re-uploads target the
   * existing id instead of creating duplicates in MinIO.
   */
  private loadExistingAgentDocuments(): void {
    const agentId = this.onboarding?.agent?.id;
    if (!agentId) { this.computeStartingStep(); return; }
    this.agentDocumentsService.getByAgent(agentId)
      .pipe(catchError(() => of([] as AgentDocument[])))
      .subscribe((docs) => {
        this.existingDocs.clear();
        this.existingActesNaissance.clear();
        for (const d of docs) {
          if (d.documentType === 'ACTE_NAISSANCE') {
            const key = (d.description ?? '').trim();
            if (key) this.existingActesNaissance.set(key, d);
          } else {
            this.existingDocs.set(d.documentType, d);
          }
        }
        this.hydrateSlotsFromExistingDocs();
        // Documents chargés : on peut maintenant déterminer la 1ʳᵉ étape réellement incomplète.
        this.computeStartingStep();
      });
  }

  private hydrateSlotsFromExistingDocs(): void {
    this.existingPhoto = this.existingDocs.get('PHOTO_PROFIL');
    this.existingRib = this.existingDocs.get('ATTESTATION_RIB');
    this.existingMariage = this.existingDocs.get('ACTE_MARIAGE');
    this.existingActeNaissanceByIndex.clear();
    this.enfants.controls.forEach((_, i) => {
      const key = this.acteNaissanceKey(i);
      const match = key ? this.existingActesNaissance.get(key) : undefined;
      if (match) this.existingActeNaissanceByIndex.set(i, match);
    });
    // Refresh the photo preview from the persisted file when no local pending file is set.
    if (!this.pendingPhotoFile && this.existingPhoto?.fileUrl) {
      this.photoPreviewUrl = this.existingPhoto.fileUrl;
    }
  }

  /** Stable lookup key for a child's birth certificate: CIN if present, else "prenom nom". */
  acteNaissanceKey(i: number): string {
    const child = this.enfants.at(i)?.value as any;
    if (!child) return '';
    const cin = (child.cin ?? '').trim();
    if (cin) return cin;
    const fullName = `${(child.prenom ?? '').trim()} ${(child.nom ?? '').trim()}`.trim();
    return fullName;
  }

  private cacheUploadedAgentDoc(doc: AgentDocument, matchKey?: string): void {
    if (doc.documentType === 'ACTE_NAISSANCE') {
      const key = matchKey ?? (doc.description ?? '').trim();
      if (key) this.existingActesNaissance.set(key, doc);
    } else {
      this.existingDocs.set(doc.documentType, doc);
    }
    this.hydrateSlotsFromExistingDocs();
  }

  /**
   * Replace-or-create upload for AgentDocument types (PHOTO / RIB / MARIAGE / ACTE_NAISSANCE).
   * If a document of the given type (and matchKey for ACTE_NAISSANCE) already exists, the file
   * is uploaded against its id — the backend deletes the previous MinIO object and stores the
   * new one. Otherwise a new AgentDocument is created first.
   */
  private uploadAgentDocument(
    type: AgentDocumentType,
    file: File,
    titleSuffix?: string,
    matchKey?: string
  ): void {
    const agentId = this.onboarding?.agent?.id;
    if (!agentId) {
      ToastHelper.showError(this.messageService, 'Profil non charge.');
      return;
    }

    let existing: AgentDocument | undefined;
    if (type === 'ACTE_NAISSANCE') {
      if (matchKey) existing = this.existingActesNaissance.get(matchKey);
    } else {
      existing = this.existingDocs.get(type);
    }

    this.saving.set(true);
    if (existing) {
      this.agentDocumentsService.uploadFile(existing.id, file)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: (updated) => {
            this.cacheUploadedAgentDoc(updated, matchKey);
            ToastHelper.showSuccess(this.messageService, 'Document televerse.');
          },
          error: (e) => ToastHelper.handleApiError(this.messageService, e, 'Televersement impossible.')
        });
      return;
    }

    const createPayload: any = {
      agentId,
      documentType: type,
      title: titleSuffix ? `${type} - ${titleSuffix}` : type,
      description: matchKey ?? undefined
    };
    this.agentDocumentsService.create(createPayload).subscribe({
      next: (created) => {
        this.agentDocumentsService.uploadFile(created.id, file)
          .pipe(finalize(() => this.saving.set(false)))
          .subscribe({
            next: (withFile) => {
              this.cacheUploadedAgentDoc(withFile, matchKey);
              ToastHelper.showSuccess(this.messageService, 'Document televerse.');
            },
            error: (e) => {
              this.saving.set(false);
              ToastHelper.handleApiError(this.messageService, e, 'Televersement impossible.');
            }
          });
      },
      error: (e) => {
        this.saving.set(false);
        ToastHelper.handleApiError(this.messageService, e, 'Creation du document impossible.');
      }
    });
  }

  // ----- File pickers for new agent documents -----

  onPhotoFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.validateFile(file)) return;
    this.pendingPhotoFile = file;
    if (this.photoPreviewUrl && this.photoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }
    this.photoPreviewUrl = URL.createObjectURL(file);
    this.uploadAgentDocument('PHOTO_PROFIL', file);
  }

  removePhoto(): void {
    if (this.photoPreviewUrl && this.photoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }
    this.photoPreviewUrl = null;
    this.pendingPhotoFile = null;
    // Note: backend deletion of an already-stored photo would require an extra DELETE call.
    // Kept as visual-only reset; admin can validate/reject in the dossier detail.
  }

  onRibFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.validateFile(file)) return;
    this.uploadAgentDocument('ATTESTATION_RIB', file);
  }

  onMariageFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.validateFile(file)) return;
    this.uploadAgentDocument('ACTE_MARIAGE', file);
  }

  onActeNaissanceFileSelected(i: number, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.validateFile(file)) return;
    const key = this.acteNaissanceKey(i);
    if (!key) {
      ToastHelper.showError(this.messageService, 'Renseignez d\'abord le prenom/nom de l\'enfant.');
      return;
    }
    this.uploadAgentDocument('ACTE_NAISSANCE', file, `Enfant #${i + 1}`, key);
  }

  // ----- Display helpers for the templates -----

  photoIsSet(): boolean { return !!this.existingPhoto?.fileUrl || !!this.pendingPhotoFile; }
  ribIsSet(): boolean { return !!this.existingRib?.fileUrl || !!this.pendingRibFile; }
  mariageIsSet(): boolean { return !!this.existingMariage?.fileUrl || !!this.pendingMariageFile; }
  cinFileIsSet(): boolean { return !!this.cin?.fileUrl || !!this.pendingCinFile; }
  isMarried(): boolean { return this.identityForm.value.situation === 'M'; }

  // ---------- Conditional sections (mirror admin showConjoint / showEnfants) ----------

  showConjoint(): boolean {
    return this.identityForm.get('situation')?.value === 'M';
  }

  showEnfants(): boolean {
    // Piloté par le nombre d'enfants saisi (0 → aucune section). Forcé à 0 pour un célibataire.
    return (this.identityForm.get('numEnfant')?.value ?? 0) > 0;
  }

  // ---------- Display labels ----------

  sexeLabel(code?: string | null): string {
    return this.sexeOptions.find(o => o.value === code)?.label || '-';
  }

  situationLabel(code?: string | null): string {
    return this.situationOptions.find(o => o.value === code)?.label || '-';
  }

  // ---------- Recap validation (mirrors admin recapIssues / canSubmit) ----------

  recapIssues(): Array<{ step: WizardStep; label: string; severity: 'error' | 'warn' }> {
    const issues: Array<{ step: WizardStep; label: string; severity: 'error' | 'warn' }> = [];
    const id = this.identityForm.value;
    const c = this.contactForm.value;

    // Step 2 — identite
    if (!id.nom?.trim()) issues.push({ step: 2, label: 'Nom obligatoire', severity: 'error' });
    if (!id.prenom?.trim()) issues.push({ step: 2, label: 'Prenom obligatoire', severity: 'error' });
    if (!this.cinForm.value.numero?.trim()) issues.push({ step: 2, label: 'CIN obligatoire', severity: 'error' });
    if (!id.sexe) issues.push({ step: 2, label: 'Sexe obligatoire', severity: 'error' });
    if (!id.dateNaissance) issues.push({ step: 2, label: 'Date de naissance obligatoire', severity: 'error' });
    if (!this.cinFileIsSet()) issues.push({ step: 2, label: 'Scan CIN manquant', severity: 'error' });
    if (!this.photoIsSet()) issues.push({ step: 2, label: 'Photo de profil obligatoire', severity: 'error' });

    // Step 3 — adresse
    if (!c.adresse?.adresse?.trim()) issues.push({ step: 3, label: 'Adresse obligatoire', severity: 'error' });
    if (!c.adresse?.ville?.trim()) issues.push({ step: 3, label: 'Ville obligatoire', severity: 'error' });

    // Step 3 — RIB
    if (!this.ribIsSet()) issues.push({ step: 3, label: 'Attestation RIB obligatoire', severity: 'error' });

    // Step 3 — conjoint si marie
    if (this.showConjoint()) {
      if (!c.conjoint?.nom?.trim()) issues.push({ step: 3, label: 'Nom du conjoint obligatoire (situation : Marie/e)', severity: 'error' });
      if (!c.conjoint?.prenom?.trim()) issues.push({ step: 3, label: 'Prenom du conjoint obligatoire', severity: 'error' });
      if (!c.conjoint?.cin?.trim()) issues.push({ step: 3, label: 'CIN du conjoint obligatoire', severity: 'error' });
      if (!this.mariageIsSet()) issues.push({ step: 3, label: 'Acte de mariage obligatoire', severity: 'error' });
    }

    // Step 3 — enfants + actes naissance
    this.enfants.controls.forEach((_, i) => {
      const enfant = this.enfants.at(i).value;
      if (!enfant.nom?.trim() || !enfant.prenom?.trim()) {
        issues.push({ step: 3, label: `Enfant #${i + 1} : nom et prenom obligatoires`, severity: 'error' });
      }
      if (!this.hasActeNaissance(i)) {
        const childName = `${enfant.prenom || ''} ${enfant.nom || ''}`.trim() || `Enfant #${i + 1}`;
        issues.push({ step: 3, label: `Acte de naissance manquant pour ${childName}`, severity: 'error' });
      }
    });

    // Step 4 — diplomes
    if (this.diplomes.length === 0) {
      issues.push({ step: 4, label: 'Au moins un diplome est obligatoire', severity: 'error' });
    }
    if (this.diplomes.length > 0 && !this.diplomes.some(d => !!d.scanUrl)) {
      issues.push({ step: 4, label: 'Au moins un diplome doit avoir un scan', severity: 'error' });
    }

    return issues;
  }

  recapErrors(): number {
    return this.recapIssues().filter(i => i.severity === 'error').length;
  }

  // ---------- Indicateurs de complétude des étapes (Issue #5) ----------

  /** Vrai si l'étape comporte au moins une erreur bloquante. */
  hasStepErrors(step: WizardStep): boolean {
    return this.recapIssues().some(i => i.step === step && i.severity === 'error');
  }

  /** Icône d'état affichée dans l'en-tête de chaque onglet du stepper. */
  stepStateIcon(step: WizardStep): string {
    if (step === 1) return 'pi-check-circle';
    if (step === 5) return this.canSubmit() ? 'pi-check-circle' : 'pi-circle';
    return this.hasStepErrors(step) ? 'pi-exclamation-circle' : 'pi-check-circle';
  }

  /** Classe de couleur associée à l'état de l'étape. */
  stepStateClass(step: WizardStep): string {
    if (step === 1) return 'step-state--done';
    if (step === 5) return this.canSubmit() ? 'step-state--done' : 'step-state--todo';
    return this.hasStepErrors(step) ? 'step-state--warn' : 'step-state--done';
  }

  recapWarnings(): number {
    return this.recapIssues().filter(i => i.severity === 'warn').length;
  }

  canSubmit(): boolean {
    return this.recapErrors() === 0;
  }

  hasActeNaissance(i: number): boolean {
    return !!this.existingActeNaissanceByIndex.get(i)?.fileUrl
        || !!this.pendingActeNaissanceByIndex.get(i);
  }

  acteNaissanceName(i: number): string {
    const existing = this.existingActeNaissanceByIndex.get(i);
    if (existing?.fileName) return existing.fileName;
    const pending = this.pendingActeNaissanceByIndex.get(i);
    return pending?.name ?? '';
  }

  acteNaissanceUrl(i: number): string | undefined {
    return this.existingActeNaissanceByIndex.get(i)?.fileUrl;
  }

  /** Every child whose birth certificate is still missing. */
  enfantsWithoutActe(): number[] {
    const missing: number[] = [];
    this.enfants.controls.forEach((_, i) => {
      if (!this.hasActeNaissance(i)) missing.push(i + 1);
    });
    return missing;
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
    }, { emitEvent: false }); // n'enclenche pas le nettoyage "célibataire" pendant l'hydratation
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
    (a.enfants ?? []).forEach(e => this.enfants.push(this.newEnfantGroup(e)));
    // numEnfant reflète toujours le nombre réel d'enfants persistés (cohérence à la reprise).
    this.identityForm.get('numEnfant')!.setValue(this.enfants.length, { emitEvent: false });
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

  /**
   * Problème 2 — Reprise basée sur la progression RÉELLE et non sur un mapping figé.
   * On positionne l'utilisateur sur la première étape encore incomplète (2 → 3 → 4),
   * sinon sur le récapitulatif (5). Un dossier déjà soumis ouvre directement le récap.
   * (Appelé après chargement des documents pour que recapIssues soit fiable.)
   */
  private computeStartingStep(): void {
    if (!this.onboarding) return;
    if (this.locked()) { this.activeStep = 5; return; }
    for (const s of [2, 3, 4] as WizardStep[]) {
      if (this.hasStepErrors(s)) { this.activeStep = s; return; }
    }
    this.activeStep = 5;
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
    // En brouillon (sans navigation) on persiste les champs texte sans exiger les pièces
    // jointes (photo, scan CIN) : cela lève le blocage "chicken-and-egg" de l'Issue #4.
    // Les pièces obligatoires ne sont contrôlées qu'au passage à l'étape suivante / soumission.
    if (thenNext) {
      if (!this.validateIdentity()) return;
    } else if (!this.validateIdentityFields()) {
      return;
    }
    this.persistProfile(thenNext, this.identityForm.value);
  }

  saveContact(thenNext?: (v: number) => void): void {
    if (thenNext) {
      if (!this.validateContact()) return;
    } else if (!this.validateContactFormats()) {
      // Brouillon : adresse partielle tolérée, mais on refuse les formats invalides.
      return;
    }
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

    // La situation est désormais envoyée telle quelle : le backend accepte un brouillon "Marié(e)"
    // sans conjoint (la complétude conjoint est contrôlée à la soumission). Plus de hack de report.
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
      // numEnfant reflète la liste réelle des enfants saisis (évite toute contradiction récap/liste).
      numEnfant: (contact.enfants ?? []).length,
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

    // Recursively strip empty strings so Jackson can coerce optional enums
    // (situation, sexe, ...) to null instead of failing on empty values.
    const cleanPayload = stripEmptyStrings(payload);
    this.saving.set(true);
    this.service.updateProfile(cleanPayload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (o) => {
          this.onboarding = o;
          // Les données sont persistées : on repart d'un état "propre" pour le garde anti-perte.
          this.identityForm.markAsPristine();
          this.contactForm.markAsPristine();
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

  /**
   * Suppression d'un enfant précis : on retire la ligne puis on réaligne le compteur
   * "Nombre d'enfants" (sans réémettre, pour ne pas re-déclencher adjustEnfantsCount).
   */
  removeEnfant(i: number): void {
    this.pendingActeNaissanceByIndex.delete(i);
    this.enfants.removeAt(i);
    this.identityForm.get('numEnfant')!.setValue(this.enfants.length, { emitEvent: false });
    this.hydrateSlotsFromExistingDocs();
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
          this.cinForm.markAsPristine();
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

  /** Champs texte de l'identité uniquement (sans les pièces jointes) — utilisé pour le brouillon. */
  private validateIdentityFields(): boolean {
    if (this.identityForm.invalid) {
      this.identityForm.markAllAsTouched();
      ToastHelper.showError(this.messageService, 'Identite : champs obligatoires manquants.');
      return false;
    }
    return true;
  }

  /** Contrôle des formats saisis (téléphone, RIB, IBAN) avec messages dédiés (Issues #10/#11). */
  private validateContactFormats(): boolean {
    if (this.contactForm.get('adresse.telephone')?.errors?.['pattern']) {
      ToastHelper.showError(this.messageService, 'Numero de telephone invalide (8 a 15 chiffres, ex : +212 6 12 34 56 78).');
      return false;
    }
    if (this.contactForm.get('coordonneesBancaires.rib')?.errors?.['pattern']) {
      ToastHelper.showError(this.messageService, 'RIB invalide : 24 chiffres attendus.');
      return false;
    }
    if (this.contactForm.get('coordonneesBancaires.iban')?.errors?.['pattern']) {
      ToastHelper.showError(this.messageService, 'IBAN invalide (ex : MA64XXXXXXXXXXXXXXXXXXXXXX).');
      return false;
    }
    return true;
  }

  private validateIdentity(): boolean {
    if (!this.validateIdentityFields()) {
      return false;
    }
    if (!this.photoIsSet()) {
      ToastHelper.showError(this.messageService, 'Photo de profil obligatoire.');
      return false;
    }
    if (this.cinForm.invalid) {
      this.cinForm.markAllAsTouched();
      ToastHelper.showError(this.messageService, 'CIN : numero obligatoire.');
      return false;
    }
    if (!this.cin?.fileUrl) {
      ToastHelper.showError(this.messageService, 'Scan CIN obligatoire.');
      return false;
    }
    // NB : l'acte de mariage et les infos du conjoint sont contrôlés à l'étape 3 (Coordonnées),
    // là où se trouvent les champs/upload. Les exiger ici bloquerait l'agent marié dès l'étape 2.
    return true;
  }

  private validateContact(): boolean {
    if (!this.validateContactFormats()) {
      return false;
    }
    const adresse = this.contactForm.get('adresse')?.value;
    if (!adresse?.adresse?.trim() || !adresse?.ville?.trim()) {
      this.contactForm.markAllAsTouched();
      ToastHelper.showError(this.messageService, 'Adresse et ville obligatoires.');
      return false;
    }
    if (!this.ribIsSet()) {
      ToastHelper.showError(this.messageService, 'Attestation RIB obligatoire.');
      return false;
    }
    // Conjoint + acte de mariage : exigés ici (étape 3) pour un agent marié.
    if (this.showConjoint()) {
      const conjoint = this.contactForm.get('conjoint')?.value;
      if (!conjoint?.nom?.trim() || !conjoint?.prenom?.trim() || !conjoint?.cin?.trim()) {
        this.contactForm.markAllAsTouched();
        ToastHelper.showError(this.messageService, 'Conjoint : nom, prenom et CIN obligatoires (situation Marie/e).');
        return false;
      }
      if (!this.mariageIsSet()) {
        ToastHelper.showError(this.messageService, 'Acte de mariage obligatoire pour les agents maries.');
        return false;
      }
    }
    const missingEnfants = this.enfantsWithoutActe();
    if (missingEnfants.length) {
      ToastHelper.showError(
        this.messageService,
        `Acte de naissance manquant pour l'enfant ${missingEnfants.join(', ')}.`
      );
      return false;
    }
    return true;
  }

  private validateDocuments(): boolean {
    if (!this.photoIsSet()) {
      ToastHelper.showError(this.messageService, 'Photo de profil obligatoire.');
      return false;
    }
    if (!this.cin || !this.cin.fileUrl) {
      ToastHelper.showError(this.messageService, 'CIN : informations + scan obligatoires.');
      return false;
    }
    if (!this.ribIsSet()) {
      ToastHelper.showError(this.messageService, 'Attestation RIB obligatoire.');
      return false;
    }
    if (this.isMarried() && !this.mariageIsSet()) {
      ToastHelper.showError(this.messageService, 'Acte de mariage obligatoire pour les agents maries.');
      return false;
    }
    const missingEnfants = this.enfantsWithoutActe();
    if (missingEnfants.length) {
      ToastHelper.showError(
        this.messageService,
        `Acte de naissance manquant pour l'enfant ${missingEnfants.join(', ')}.`
      );
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
