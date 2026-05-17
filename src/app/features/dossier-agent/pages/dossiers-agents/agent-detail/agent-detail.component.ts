import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { Button, ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { InputSwitchModule } from 'primeng/inputswitch';

import { DossiersAgentsService } from '../../../services/dossiers-agents/dossiers-agents.service';
import { AgentDocumentsService } from '../../../services/dossiers-agents/agent-documents.service';
import { AgentService } from '../../../services/agent.service';
import { GestionUtilisateursService } from '../../../../gestion-comptes/services/gestion-utilisateurs/gestion-utilisateurs.service';
import { DiplomesService } from '../../../../documents/services/diplomes/diplomes.service';
import { FormationService } from '../../../../documents/services/formation/formation.service';
import { ToastHelper } from '../../../../../shared/utils/toast-helper';
import { AdresseDto, AgentCreateRequest, AgentFullDto, AgentTravailDto, EnfantDto, TypeAdresse } from '../../../../../models/agent-full.model';
import { Diplome } from '../../../../documents/models/diplomes/diplome.model';
import { Formation } from '../../../../../models/formation.model';
import {
  AgentDocument,
  AgentDocumentType,
  AgentDocumentCreateUpdateRequest,
  AGENT_DOCUMENT_TYPE_LABELS,
  AGENT_DOCUMENT_TYPES,
} from '../../../../../models/agent-document.model';
import { buildAgentPayload } from '../agent-wizard-payload';

type Draft = AgentCreateRequest;

@Component({
  selector: 'app-agent-detail',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    Toast,
    ConfirmDialogModule,
    DialogModule,
    Button,
    ButtonModule,
    InputText,
    Textarea,
    DatePicker,
    Select,
    TagModule,
    TableModule,
    TooltipModule,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    DividerModule,
    InputSwitchModule,
  ],
  templateUrl: './agent-detail.component.html',
  styleUrl: './agent-detail.component.scss',
})
export class AgentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(DossiersAgentsService);
  private readonly agentService = inject(AgentService);
  private readonly usersService = inject(GestionUtilisateursService);
  private readonly diplomesService = inject(DiplomesService);
  private readonly formationService = inject(FormationService);
  private readonly agentDocumentsService = inject(AgentDocumentsService);
  private readonly toast = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly editMode = signal(false);
  readonly agent = signal<AgentFullDto | null>(null);
  readonly draft = signal<Draft | null>(null);
  readonly photoUrl = signal<string | null>(null);

  readonly fullName = computed(() => {
    const a = this.agent();
    return a ? `${a.prenom ?? ''} ${a.nom ?? ''}`.trim() || '—' : '';
  });

  readonly sexeOptions = [
    { label: this.translate.instant('GESTION_PERSONNELLE.GLOBAL.MASCULIN'), value: 'M' },
    { label: this.translate.instant('GESTION_PERSONNELLE.GLOBAL.FEMININ'), value: 'F' },
  ];
  readonly situationOptions = [
    { label: this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP6.VAL_CELIBATAIRE'), value: 'C' },
    { label: this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP6.VAL_MARIE'), value: 'M' },
    { label: this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP6.VAL_VEUF'), value: 'V' },
    { label: this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP6.VAL_DIVORCE'), value: 'D' },
  ];

  // ─────────────────────────────────────────────────────────────────────
  // Onglet "Travail" : données réelles chargées depuis /api/agents/{id}/travail
  // ─────────────────────────────────────────────────────────────────────
  readonly travail = signal<AgentTravailDto | null>(null);
  readonly travailLoading = signal(false);

  readonly departementLabel = computed(() => this.travail()?.uniteLibelle ?? null);
  readonly posteLabel = computed(() => this.travail()?.posteLibelle ?? null);
  readonly responsableLabel = computed(() => {
    const s = this.travail()?.superieur;
    if (!s) return null;
    return `${s.prenom ?? ''} ${s.nom ?? ''}`.trim() || null;
  });

  // ─────────────────────────────────────────────────────────────────────
  // Onglet "CV" : diplômes + formations (chargés via matricule)
  // ─────────────────────────────────────────────────────────────────────
  readonly diplomes = signal<Diplome[]>([]);
  readonly formations = signal<Formation[]>([]);
  readonly cvLoading = signal(false);

  diplomeTitle(d: Diplome): string {
    const niveau = d.niveau?.libelle?.trim();
    const spec = d.specialite?.libelle?.trim();
    if (niveau && spec) return `${niveau} — ${spec}`;
    return niveau || spec || 'Diplôme';
  }

  diplomeYear(d: Diplome): string {
    if (!d.dateObtention) return '—';
    const y = new Date(d.dateObtention).getFullYear();
    return isNaN(y) ? '—' : String(y);
  }

  // ─── Scan / certificate preview ──────────────────────────────────────
  readonly scanPreview = signal<{
    url: string;
    fileName: string;
    kind: 'pdf' | 'image' | 'other';
  } | null>(null);

  private detectFileKind(fileName: string | undefined): 'pdf' | 'image' | 'other' {
    const ext = (fileName ?? '').split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
    return 'other';
  }

  openScan(url: string | undefined, fileName: string | undefined): void {
    if (!url) return;
    this.scanPreview.set({
      url,
      fileName: fileName ?? 'document',
      kind: this.detectFileKind(fileName),
    });
  }

  closeScan(): void {
    this.scanPreview.set(null);
  }

  readonly scanPreviewSafeUrl = computed<SafeResourceUrl | null>(() => {
    const p = this.scanPreview();
    return p ? this.sanitizer.bypassSecurityTrustResourceUrl(p.url) : null;
  });

  // ─── Agent documents (Carte nationale, passeport, contrats, ...) ────
  readonly documents = signal<AgentDocument[]>([]);
  readonly documentsLoading = signal(false);
  readonly documentTypeOptions = AGENT_DOCUMENT_TYPES;

  /** Local state of the add/edit document dialog. */
  readonly documentDialogVisible = signal(false);
  readonly documentDialogMode = signal<'add' | 'edit'>('add');
  readonly documentSaving = signal(false);
  readonly documentUploading = signal<number | null>(null);

  private readonly emptyDocumentForm = (): {
    id: number | null;
    documentType: AgentDocumentType;
    title: string;
    description: string;
    issuedAt: Date | null;
    expiresAt: Date | null;
    pendingFile: File | null;
  } => ({
    id: null,
    documentType: 'CARTE_NATIONALE',
    title: '',
    description: '',
    issuedAt: null,
    expiresAt: null,
    pendingFile: null,
  });

  documentForm = this.emptyDocumentForm();

  documentTypeLabel(type: AgentDocumentType | undefined): string {
    return type ? AGENT_DOCUMENT_TYPE_LABELS[type] ?? type : '—';
  }

  formatFileSize(size: number | undefined | null): string {
    if (size == null) return '—';
    if (size < 1024) return `${size} o`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
    return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
  }

  parametresCompte = {
    compteActif: true,
    twoFa: false,
    notificationsEmail: true,
    accesPortailAgent: true,
  };

  eligibiliteConge = {
    droitAnnuel: 22,
    joursAcquis: 18,
    joursPris: 6,
    joursRestants: 12,
    dateOuvertureDroits: '2020-01-15',
    categorieBareme: 'Cadre',
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/GestionUtilisateurs']);
      return;
    }
    this.load(Number(idParam));
  }

  private load(id: number): void {
    this.loading.set(true);
    this.service.getFull(id).subscribe({
      next: (full) => {
        this.agent.set(full);
        this.draft.set(this.toDraft(full));
        this.loading.set(false);
        const matricule = full.matricule?.matricule;
        if (matricule) {
          this.loadCv(matricule);
        } else {
          this.diplomes.set([]);
          this.formations.set([]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
        ToastHelper.showError(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_LOAD_ERROR'));
      },
    });

    this.agentService.getProfilePicture(id).subscribe({
      next: (file) => this.photoUrl.set(file?.url ?? null),
      error: () => this.photoUrl.set(null),
    });

    this.loadTravail(id);
    this.loadDocuments(id);
  }

  private loadDocuments(agentId: number): void {
    this.documentsLoading.set(true);
    this.agentDocumentsService.getByAgent(agentId).subscribe({
      next: (list) => {
        this.documents.set(list ?? []);
        this.documentsLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.documents.set([]);
        this.documentsLoading.set(false);
      },
    });
  }

  // ─── Document CRUD handlers ──────────────────────────────────────────
  openAddDocument(): void {
    this.documentForm = this.emptyDocumentForm();
    this.documentDialogMode.set('add');
    this.documentDialogVisible.set(true);
  }

  openEditDocument(doc: AgentDocument): void {
    this.documentForm = {
      id: doc.id,
      documentType: doc.documentType,
      title: doc.title,
      description: doc.description ?? '',
      issuedAt: doc.issuedAt ? new Date(doc.issuedAt) : null,
      expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : null,
      pendingFile: null,
    };
    this.documentDialogMode.set('edit');
    this.documentDialogVisible.set(true);
  }

  closeDocumentDialog(): void {
    this.documentDialogVisible.set(false);
    this.documentForm = this.emptyDocumentForm();
  }

  onDocumentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      ToastHelper.showWarn(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MAX_SIZE'));
      input.value = '';
      return;
    }
    this.documentForm = { ...this.documentForm, pendingFile: file };
    input.value = '';
  }

  clearPendingFile(): void {
    this.documentForm = { ...this.documentForm, pendingFile: null };
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  saveDocument(): void {
    const a = this.agent();
    const f = this.documentForm;
    if (!a) return;

    if (!f.title?.trim()) {
      ToastHelper.showWarn(this.toast, this.translate.instant('GLOBAL.MESSAGE.REQUIRED_FIELDS'));
      return;
    }
    if (f.issuedAt && f.expiresAt && f.expiresAt < f.issuedAt) {
      ToastHelper.showWarn(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.DATE_EXPIRATION'));
      return;
    }

    const payload: AgentDocumentCreateUpdateRequest = {
      agentId: a.id,
      documentType: f.documentType,
      title: f.title.trim(),
      description: f.description?.trim() || null,
      issuedAt: this.toIsoDate(f.issuedAt),
      expiresAt: this.toIsoDate(f.expiresAt),
    };

    this.documentSaving.set(true);
    const obs = f.id
      ? this.agentDocumentsService.update(f.id, payload)
      : this.agentDocumentsService.create(payload);

    obs.subscribe({
      next: (saved) => {
        const file = f.pendingFile;
        if (file) {
          this.agentDocumentsService.uploadFile(saved.id, file).subscribe({
            next: (withFile) => {
              this.documentSaving.set(false);
              this.upsertDocument(withFile);
              this.closeDocumentDialog();
              ToastHelper.showSuccess(this.toast, f.id ? this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_DOC_SUCCESS_EDIT') : this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_DOC_SUCCESS_ADD'));
            },
            error: (err) => {
              this.documentSaving.set(false);
              console.error(err);
              this.upsertDocument(saved);
              this.closeDocumentDialog();
              ToastHelper.showError(this.toast, err?.error?.message || this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_DOC_FILE_ERROR'));
            },
          });
        } else {
          this.documentSaving.set(false);
          this.upsertDocument(saved);
          this.closeDocumentDialog();
          ToastHelper.showSuccess(this.toast, f.id ? this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_DOC_SUCCESS_EDIT') : this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_DOC_SUCCESS_ADD'));
        }
      },
      error: (err) => {
        this.documentSaving.set(false);
        console.error(err);
        ToastHelper.showError(this.toast, err?.error?.message || this.translate.instant('GLOBAL.MESSAGE.ERR_ADD'));
      },
    });
  }

  private upsertDocument(doc: AgentDocument): void {
    this.documents.update((list) => {
      const idx = list.findIndex((d) => d.id === doc.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = doc;
        return next;
      }
      return [doc, ...list];
    });
  }

  deleteDocument(doc: AgentDocument): void {
    ToastHelper.confirmDelete(this.confirm, () => {
      this.agentDocumentsService.delete(doc.id).subscribe({
        next: () => {
          this.documents.update((list) => list.filter((d) => d.id !== doc.id));
          ToastHelper.showDelete(this.toast);
        },
        error: (err) => {
          console.error(err);
          ToastHelper.showDeleteError(this.toast, err?.error?.message);
        },
      });
    });
  }

  /** Replace the attached file on an existing document (inline from the list). */
  onReplaceDocumentFile(doc: AgentDocument, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      ToastHelper.showWarn(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MAX_SIZE'));
      input.value = '';
      return;
    }

    this.documentUploading.set(doc.id);
    this.agentDocumentsService.uploadFile(doc.id, file).subscribe({
      next: (updated) => {
        this.upsertDocument(updated);
        this.documentUploading.set(null);
        ToastHelper.showSuccess(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_DOC_SUCCESS_EDIT'));
      },
      error: (err) => {
        this.documentUploading.set(null);
        console.error(err);
        ToastHelper.showError(this.toast, err?.error?.message || this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_DOC_FILE_ERROR'));
      },
    });
    input.value = '';
  }

  private loadCv(matricule: string): void {
    this.cvLoading.set(true);
    let pending = 2;
    const done = () => { if (--pending === 0) this.cvLoading.set(false); };

    this.diplomesService.getByMatricule(matricule).subscribe({
      next: (list) => { this.diplomes.set(list ?? []); done(); },
      error: (err) => { console.error(err); this.diplomes.set([]); done(); },
    });

    this.formationService.getByMatricule(matricule).subscribe({
      next: (list) => { this.formations.set(list ?? []); done(); },
      error: (err) => { console.error(err); this.formations.set([]); done(); },
    });
  }

  private loadTravail(id: number): void {
    this.travailLoading.set(true);
    this.service.getTravail(id).subscribe({
      next: (data) => {
        this.travail.set(data);
        this.travailLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.travail.set(null);
        this.travailLoading.set(false);
      },
    });
  }

  summaryInitials(s?: { nom?: string; prenom?: string } | null): string {
    if (!s) return '?';
    const p = (s.prenom ?? '').charAt(0);
    const n = (s.nom ?? '').charAt(0);
    return (p + n).toUpperCase() || '?';
  }

  summaryFullName(s?: { nom?: string; prenom?: string } | null): string {
    if (!s) return '—';
    return `${s.prenom ?? ''} ${s.nom ?? ''}`.trim() || '—';
  }

  private toDraft(full: AgentFullDto): Draft {
    return {
      matriculeId: full.matricule?.id ?? null,
      matricule: full.matricule?.matricule,
      dateRecrutement: full.matricule?.dateRecrutement,
      domaine: full.matricule?.domaine,
      sousDomaine: full.matricule?.sousDomaine,
      categorie: full.matricule?.categorie,
      typeContrat: full.matricule?.typeContrat,
      nom: full.nom,
      prenom: full.prenom,
      cin: full.cin,
      sexe: full.sexe,
      situation: full.situation,
      dateNaissance: full.dateNaissance,
      nomTuteurAr: full.nomTuteurAr,
      prenomTuteurAr: full.prenomTuteurAr,
      pprTuteur: full.pprTuteur,
      dateTutorat: full.dateTutorat,
      numEnfant: full.numEnfant,
      adresses: (full.adresses ?? []).map((a) => ({ ...a })),
      coordonneesBancaires: full.coordonneesBancaires ? { ...full.coordonneesBancaires } : undefined,
      coordonneesProfessionnelles: full.coordonneesProfessionnelles ? { ...full.coordonneesProfessionnelles } : undefined,
      conjoint: full.conjoint ? { ...full.conjoint } : null,
      enfants: (full.enfants ?? []).map((e) => ({ ...e })),
    };
  }

  patch(patch: Partial<Draft>): void {
    this.draft.update((d) => (d ? { ...d, ...patch } : d));
  }

  readonly typeAdresseOptions: { label: string; value: TypeAdresse }[] = [
    { label: this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP3.TYPE_PRINCIPALE'), value: 'PRINCIPALE' },
    { label: this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP3.TYPE_SECONDAIRE'), value: 'SECONDAIRE' },
    { label: this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP3.TYPE_TRAVAIL'), value: 'TRAVAIL' },
    { label: this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP3.TYPE_AUTRE'), value: 'AUTRE' },
  ];

  typeAdresseLabel(value?: TypeAdresse): string {
    return this.typeAdresseOptions.find((o) => o.value === value)?.label ?? '—';
  }

  addAdresse(): void {
    this.draft.update((d) => {
      if (!d) return d;
      const list = d.adresses ?? [];
      const used = new Set(list.map((a) => a.type));
      const nextType: TypeAdresse =
        this.typeAdresseOptions.find((o) => !used.has(o.value))?.value ?? 'AUTRE';
      return { ...d, adresses: [...list, { type: nextType }] };
    });
  }

  removeAdresse(i: number): void {
    this.draft.update((d) =>
      d ? { ...d, adresses: (d.adresses ?? []).filter((_, idx) => idx !== i) } : d
    );
  }

  updateAdresse(i: number, patch: Partial<AdresseDto>): void {
    this.draft.update((d) => {
      if (!d) return d;
      const next = (d.adresses ?? []).map((a, idx) => (idx === i ? { ...a, ...patch } : a));
      return { ...d, adresses: next };
    });
  }

  patchPro(patch: Partial<NonNullable<Draft['coordonneesProfessionnelles']>>): void {
    this.draft.update((d) =>
      d ? { ...d, coordonneesProfessionnelles: { ...(d.coordonneesProfessionnelles ?? {}), ...patch } } : d
    );
  }

  patchBank(patch: Partial<NonNullable<Draft['coordonneesBancaires']>>): void {
    this.draft.update((d) =>
      d ? { ...d, coordonneesBancaires: { ...(d.coordonneesBancaires ?? {}), ...patch } } : d
    );
  }

  patchConjoint(patch: Partial<NonNullable<Draft['conjoint']>>): void {
    this.draft.update((d) => (d ? { ...d, conjoint: { ...(d.conjoint ?? {}), ...patch } } : d));
  }

  trackByIndex = (i: number) => i;

  addEnfant(): void {
    this.draft.update((d) => (d ? { ...d, enfants: [...(d.enfants ?? []), {}] } : d));
  }

  removeEnfant(i: number): void {
    this.draft.update((d) =>
      d ? { ...d, enfants: (d.enfants ?? []).filter((_, idx) => idx !== i) } : d
    );
  }

  updateEnfant(i: number, patch: Partial<EnfantDto>): void {
    this.draft.update((d) => {
      if (!d) return d;
      const next = (d.enfants ?? []).map((e, idx) => (idx === i ? { ...e, ...patch } : e));
      return { ...d, enfants: next };
    });
  }

  enterEdit(): void {
    const a = this.agent();
    if (!a) return;
    this.draft.set(this.toDraft(a));
    this.editMode.set(true);
  }

  cancelEdit(): void {
    const a = this.agent();
    if (a) this.draft.set(this.toDraft(a));
    this.editMode.set(false);
  }

  save(): void {
    const a = this.agent();
    const d = this.draft();
    if (!a || !d) return;

    if (d.situation === 'M' && !d.conjoint) {
      ToastHelper.showWarn(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP6.SUBTITLE_CONJOINT'));
      return;
    }

    this.saving.set(true);
    const payload = buildAgentPayload(d);
    this.service.updateFull(a.id, payload).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.agent.set(updated);
        this.draft.set(this.toDraft(updated));
        this.editMode.set(false);
        ToastHelper.showSuccess(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.MSG_UPDATED'));
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        ToastHelper.showError(this.toast, err?.error?.message || this.translate.instant('GLOBAL.MESSAGE.ERR_UPDATE'));
      },
    });
  }

  // ── Delete with matricule confirmation ────────────────────────────
  showDeleteDialog = signal(false);
  deleteConfirmInput = signal('');
  deleting = signal(false);

  readonly expectedMatricule = computed(() => this.agent()?.matricule?.matricule ?? '');

  readonly deleteInputMatch = computed(() => {
    const expected = this.expectedMatricule();
    return expected !== '' && this.deleteConfirmInput().trim() === expected;
  });

  deleteAgent(): void {
    const a = this.agent();
    if (!a) return;

    // Pre-check if agent is assigned to a poste
    this.service.canDelete(a.id).subscribe({
      next: (res) => {
        if (!res.canDelete) {
          ToastHelper.showError(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_DELETE_IMPOSSIBLE'));
          return;
        }
        this.deleteConfirmInput.set('');
        this.showDeleteDialog.set(true);
      },
      error: () => {
        // Fallback: show dialog anyway, backend will reject if needed
        this.deleteConfirmInput.set('');
        this.showDeleteDialog.set(true);
      },
    });
  }

  confirmDelete(): void {
    const a = this.agent();
    if (!a || !this.deleteInputMatch()) return;

    this.deleting.set(true);
    this.usersService.deleteAgent(a.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteDialog.set(false);
        ToastHelper.showDelete(this.toast);
        setTimeout(() => this.router.navigate(['/GestionUtilisateurs']), 400);
      },
      error: (err) => {
        this.deleting.set(false);
        this.showDeleteDialog.set(false);
        console.error(err);
        ToastHelper.showDeleteError(this.toast, err?.error?.message);
      },
    });
  }

  back(): void {
    this.router.navigate(['/GestionUtilisateurs']);
  }

  initials(): string {
    const a = this.agent();
    if (!a) return '';
    const p = (a.prenom ?? '').charAt(0);
    const n = (a.nom ?? '').charAt(0);
    return (p + n).toUpperCase() || '?';
  }

  situationLabel(value?: string): string {
    return this.situationOptions.find((o) => o.value === value)?.label ?? '—';
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.agent()) return;

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      ToastHelper.showWarn(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP7.DRAG_DROP_HINT'));
      input.value = '';
      return;
    }

    this.service.uploadProfilePicture(this.agent()!.id, file).subscribe({
      next: (res) => {
        this.photoUrl.set(res?.url ?? null);
        // Reload to get fresh URL if needed
        this.agentService.getProfilePicture(this.agent()!.id).subscribe({
          next: (f) => this.photoUrl.set(f?.url ?? null),
          error: () => {},
        });
        ToastHelper.showSuccess(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_PHOTO_SUCCESS'));
      },
      error: (err) => {
        console.error(err);
        ToastHelper.showError(this.toast, this.translate.instant('GESTION_PERSONNELLE.AGENT_DETAIL.MSG_PHOTO_ERROR'));
      },
    });

    input.value = '';
  }
}
