import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import {
  AGENT_STATUS_LABELS,
  COMPLETION_MODE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DocumentVerificationStatus,
  INVITATION_STATUS_LABELS,
  OnboardingDetail,
  OnboardingDocument,
  OnboardingStep,
  OnboardingStepType,
  ONBOARDING_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS
} from '../../../../models/onboarding.model';
import { AdminOnboardingService } from '../../services/admin-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { RejectionReasonDialogComponent } from '../../components/rejection-reason-dialog/rejection-reason-dialog.component';
import { onboardingTagSeverity, PrimengSeverity } from '../../utils/onboarding-status.util';
import { DiplomesService } from '../../../documents/services/diplomes/diplomes.service';
import { FormationService } from '../../../documents/services/formation/formation.service';
import { Diplome } from '../../../documents/models/diplomes/diplome.model';
import { Formation } from '../../../../models/formation.model';
import { AffectationAgentPosteService } from '../../../gestion-organisationnelle/services/affectation-agent-poste.service';
import { AffectationAgentPosteDto } from '../../../../models/gestionOrganisationelle/affectation-agent-poste.model';
import {
  AGENT_DOCUMENT_TYPE_ICONS,
  AGENT_DOCUMENT_TYPE_LABELS
} from '../../../../models/agent-document.model';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type RejectionTarget =
  | { kind: 'dossier' }
  | { kind: 'document'; documentId: number };

const STEP_LABELS: Record<OnboardingStepType, string> = {
  MATRICULE_ALLOCATION: 'Matricule attribue',
  ACCOUNT_ACTIVATION: 'Compte active',
  PROFILE: 'Profil renseigne',
  DOCUMENTS: 'Documents fournis',
  REVIEW: 'Dossier soumis',
  VALIDATION: 'Validation administrative'
};

const STEP_ICONS: Record<OnboardingStepType, string> = {
  MATRICULE_ALLOCATION: 'pi-id-card',
  ACCOUNT_ACTIVATION: 'pi-user-plus',
  PROFILE: 'pi-user-edit',
  DOCUMENTS: 'pi-file',
  REVIEW: 'pi-send',
  VALIDATION: 'pi-verified'
};

const ACTION_LABELS: Record<string, string> = {
  INITIALIZE: 'Dossier initialise',
  INVITATION_CREATED: 'Invitation creee',
  INVITATION_RESENT: 'Invitation renvoyee',
  INVITATION_RESEND_REQUESTED: 'Renvoi d\'invitation demande',
  INVITATION_REVOKE_PREVIOUS: 'Invitation precedente revoquee',
  INVITATION_CANCELLED: 'Invitation annulee',
  INVITATION_UPDATED: 'Email de l\'invitation modifie',
  INVITATION_VALIDATE_SUCCESS: 'Lien d\'invitation valide',
  INVITATION_VALIDATE_EXPIRED: 'Lien d\'invitation expire',
  INVITATION_ACTIVATION_SUCCESS: 'Compte agent active',
  INVITATION_ACTIVATION_FAILED: 'Echec d\'activation',
  INVITATION_USE_REJECTED: 'Tentative d\'utilisation refusee',
  START_ASSISTED: 'Mode assiste active',
  ASSISTED_PROFILE_UPDATE: 'Profil renseigne (RH)',
  SELF_PROFILE_UPDATE: 'Profil renseigne par l\'agent',
  SELF_DOCUMENT_UPLOAD: 'Document televerse par l\'agent',
  DOCUMENT_UPLOAD: 'Document televerse',
  DOCUMENT_VALIDATE: 'Document valide',
  DOCUMENT_REJECT: 'Document rejete',
  ADMIN_SUBMIT: 'Dossier soumis (RH)',
  SELF_SUBMIT: 'Dossier soumis par l\'agent',
  ONBOARDING_VALIDATE: 'Dossier valide',
  ONBOARDING_POSTE_ASSIGNED: 'Agent affecte au poste',
  ONBOARDING_REJECT: 'Dossier rejete',
  DOCUMENT_OCR_ANALYZE: 'Document verifie par OCR',
  DOCUMENT_OCR_ANALYZE_ALL: 'Verification OCR du dossier'
};

const ACTION_ICONS: Record<string, string> = {
  INITIALIZE: 'pi-flag',
  INVITATION_CREATED: 'pi-send',
  INVITATION_RESENT: 'pi-replay',
  INVITATION_RESEND_REQUESTED: 'pi-replay',
  INVITATION_REVOKE_PREVIOUS: 'pi-ban',
  INVITATION_CANCELLED: 'pi-ban',
  INVITATION_UPDATED: 'pi-pencil',
  INVITATION_VALIDATE_SUCCESS: 'pi-link',
  INVITATION_VALIDATE_EXPIRED: 'pi-clock',
  INVITATION_ACTIVATION_SUCCESS: 'pi-check-circle',
  INVITATION_ACTIVATION_FAILED: 'pi-times-circle',
  INVITATION_USE_REJECTED: 'pi-shield',
  START_ASSISTED: 'pi-user-edit',
  ASSISTED_PROFILE_UPDATE: 'pi-pencil',
  SELF_PROFILE_UPDATE: 'pi-pencil',
  SELF_DOCUMENT_UPLOAD: 'pi-upload',
  DOCUMENT_UPLOAD: 'pi-upload',
  DOCUMENT_VALIDATE: 'pi-check',
  DOCUMENT_REJECT: 'pi-times',
  ADMIN_SUBMIT: 'pi-send',
  SELF_SUBMIT: 'pi-send',
  ONBOARDING_VALIDATE: 'pi-verified',
  ONBOARDING_REJECT: 'pi-ban',
  DOCUMENT_OCR_ANALYZE: 'pi-search',
  DOCUMENT_OCR_ANALYZE_ALL: 'pi-sparkles'
};

const ACTION_SEVERITY: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
  INITIALIZE: 'info',
  INVITATION_CREATED: 'info',
  INVITATION_RESENT: 'info',
  INVITATION_RESEND_REQUESTED: 'info',
  INVITATION_REVOKE_PREVIOUS: 'warn',
  INVITATION_CANCELLED: 'warn',
  INVITATION_UPDATED: 'info',
  INVITATION_VALIDATE_SUCCESS: 'success',
  INVITATION_VALIDATE_EXPIRED: 'warn',
  INVITATION_ACTIVATION_SUCCESS: 'success',
  INVITATION_ACTIVATION_FAILED: 'danger',
  INVITATION_USE_REJECTED: 'danger',
  START_ASSISTED: 'info',
  ASSISTED_PROFILE_UPDATE: 'info',
  SELF_PROFILE_UPDATE: 'info',
  SELF_DOCUMENT_UPLOAD: 'info',
  DOCUMENT_UPLOAD: 'info',
  DOCUMENT_VALIDATE: 'success',
  DOCUMENT_REJECT: 'danger',
  ADMIN_SUBMIT: 'info',
  SELF_SUBMIT: 'info',
  ONBOARDING_VALIDATE: 'success',
  ONBOARDING_POSTE_ASSIGNED: 'success',
  ONBOARDING_REJECT: 'danger',
  DOCUMENT_OCR_ANALYZE: 'info',
  DOCUMENT_OCR_ANALYZE_ALL: 'info'
};

@Component({
  selector: 'app-admin-onboarding-detail',
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    MenuModule,
    ProgressBarModule,
    TableModule,
    TabViewModule,
    TagModule,
    Toast,
    TooltipModule,
    RejectionReasonDialogComponent
  ],
  templateUrl: './admin-onboarding-detail.component.html',
  styleUrl: './admin-onboarding-detail.component.scss'
})
export class AdminOnboardingDetailComponent implements OnInit {
  onboarding?: OnboardingDetail;
  diplomes: Diplome[] = [];
  formations: Formation[] = [];
  loading = true;

  /** Affectation active de l'agent (poste/unité), créée automatiquement à la validation. */
  activeAffectation?: AffectationAgentPosteDto;

  // --- Invitation management (modifier / annuler) ---
  showInvitationEmailDialog = false;
  invitationEmailValue = '';
  savingInvitation = false;

  // --- Revue documentaire ---
  /** Document ouvert dans la visionneuse ; `undefined` = dialogue fermé. */
  previewedDocument?: OnboardingDocument;
  /** URL assainie du PDF affiché dans l'iframe de la visionneuse. */
  previewFrameUrl: SafeResourceUrl | null = null;
  /** Identifiants des documents dont le détail de vérification est déplié. */
  private expandedChecks = new Set<number>();
  /** Documents dont l'analyse OCR est en cours (désactive les boutons et affiche le spinner). */
  private analyzing = new Set<number>();
  analyzingAll = false;

  readonly agentDocLabels = AGENT_DOCUMENT_TYPE_LABELS;
  readonly agentDocIcons = AGENT_DOCUMENT_TYPE_ICONS;
  readonly verificationLabels = VERIFICATION_STATUS_LABELS;

  private readonly sanitizer = inject(DomSanitizer);
  private onboardingId!: number;
  private pendingReject?: RejectionTarget;

  @ViewChild(RejectionReasonDialogComponent) rejectDialog?: RejectionReasonDialogComponent;

  readonly onboardingLabels = ONBOARDING_STATUS_LABELS;
  readonly agentLabels = AGENT_STATUS_LABELS;
  readonly modeLabels = COMPLETION_MODE_LABELS;
  readonly documentLabels = DOCUMENT_STATUS_LABELS;
  readonly invitationLabels = INVITATION_STATUS_LABELS;

  constructor(
    private route: ActivatedRoute,
    private onboardingService: AdminOnboardingService,
    private diplomesService: DiplomesService,
    private formationService: FormationService,
    private affectationService: AffectationAgentPosteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.onboardingId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.onboardingService.getById(this.onboardingId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (detail) => {
          this.onboarding = detail;
          this.loadAgentDiplomesAndFormations();
          this.refreshInvitationStatus();
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement du dossier onboarding.')
      });
  }

  /** Load diplomes + formations stored in their own tables for this agent. */
  private loadAgentDiplomesAndFormations(): void {
    const matricule = this.onboarding?.matricule?.matricule
      || this.onboarding?.agent?.matricule?.matricule;
    const agentId = this.onboarding?.agent?.id;

    if (matricule) {
      this.diplomesService.getByMatricule(matricule)
        .pipe(catchError(() => of([] as Diplome[])))
        .subscribe(list => this.diplomes = list);
      this.formationService.getByMatricule(matricule)
        .pipe(catchError(() => of([] as Formation[])))
        .subscribe(list => this.formations = list);
    }

    if (agentId) {
      // Affectation poste/unité (créée automatiquement à la validation finale).
      this.affectationService.getByAgent(agentId)
        .pipe(catchError(() => of([] as AffectationAgentPosteDto[])))
        .subscribe(list => {
          this.activeAffectation = list.find(a => a.statut === 'ACTIVE') ?? list[0];
        });
    }
  }

  // --- Presentation des pieces ---------------------------------------------

  /**
   * Les pièces téléversées par l'agent sont projetées par le backend dans `onboarding.documents` :
   * c'est la seule liste à afficher. L'écran montrait auparavant, en plus, les `AgentDocument`
   * bruts — chaque pièce apparaissait donc deux fois, avec deux workflows de validation distincts.
   */
  get documents(): OnboardingDocument[] {
    return this.onboarding?.documents ?? [];
  }

  documentLabel(document: OnboardingDocument): string {
    return document.title
      || (document.documentType ? this.agentDocLabels[document.documentType] : undefined)
      || 'Document';
  }

  documentTypeLabel(document: OnboardingDocument): string {
    return document.documentType ? this.agentDocLabels[document.documentType] : 'Piece jointe';
  }

  documentIcon(document: OnboardingDocument): string {
    return (document.documentType ? this.agentDocIcons[document.documentType] : undefined) ?? 'pi pi-file';
  }

  hasFile(document: OnboardingDocument): boolean {
    return !!document.fileUrl;
  }

  fileSizeLabel(document: OnboardingDocument): string {
    const size = document.fileSize;
    if (!size) return '';
    return size < 1024 * 1024
      ? `${Math.round(size / 1024)} Ko`
      : `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }

  // --- Counters for tab badges ---------------------------------------------

  totalDocumentsCount(): number {
    return this.documents.length + this.diplomes.length + this.formations.length;
  }

  totalValidatedCount(): number {
    const validated = this.documents.filter(d => d.status === 'VALIDATED').length;
    const diplomesWithScan = this.diplomes.filter(d => !!d.scanUrl).length;
    const formationsWithCert = this.formations.filter(f => !!f.certificateUrl).length;
    return validated + diplomesWithScan + formationsWithCert;
  }

  rejectedDocumentsCount(): number {
    return this.documents.filter(d => d.status === 'REJECTED').length;
  }

  /** Pièces encore à relire — ni validées, ni rejetées. */
  awaitingReviewCount(): number {
    return this.documents.filter(d => d.status === 'PENDING_REVIEW').length;
  }

  // --- Visionneuse ----------------------------------------------------------

  openPreview(document: OnboardingDocument): void {
    if (!this.hasFile(document)) return;
    this.previewedDocument = document;
    // URL assainie une seule fois : la recalculer à chaque détection de changement
    // rechargerait l'iframe en boucle (nouvelle identité d'objet à chaque cycle).
    this.previewFrameUrl = this.isPdf(document)
      ? this.sanitizer.bypassSecurityTrustResourceUrl(document.fileUrl!)
      : null;
  }

  closePreview(): void {
    this.previewedDocument = undefined;
    this.previewFrameUrl = null;
  }

  /** Les images s'affichent en clair ; les PDF dans un cadre ; le reste se télécharge. */
  isImage(document?: OnboardingDocument): boolean {
    return !!document?.fileContentType?.startsWith('image/');
  }

  isPdf(document?: OnboardingDocument): boolean {
    return document?.fileContentType === 'application/pdf';
  }

  // --- Verification OCR -----------------------------------------------------

  isAnalyzing(document: OnboardingDocument): boolean {
    return this.analyzing.has(document.id);
  }

  /** Une pièce sans fichier ou d'un type non comparable (photo) n'est jamais analysée. */
  canAnalyze(document: OnboardingDocument): boolean {
    return this.hasFile(document) && document.verifiable !== false;
  }

  analyzeDocument(document: OnboardingDocument): void {
    if (!this.onboarding || !this.canAnalyze(document)) return;
    this.analyzing.add(document.id);
    this.onboardingService.analyzeDocument(this.onboarding.id, document.id)
      .pipe(finalize(() => this.analyzing.delete(document.id)))
      .subscribe({
        next: (updated) => {
          this.applyDetail(updated);
          this.expandedChecks.add(document.id);
          ToastHelper.showSuccess(this.messageService, 'Document analyse.');
        },
        error: (error) => ToastHelper.handleApiError(
          this.messageService, error, 'Analyse du document impossible.')
      });
  }

  analyzeAllDocuments(): void {
    if (!this.onboarding) return;
    this.analyzingAll = true;
    this.onboardingService.analyzeAllDocuments(this.onboarding.id)
      .pipe(finalize(() => this.analyzingAll = false))
      .subscribe({
        next: (updated) => {
          this.applyDetail(updated);
          ToastHelper.showSuccess(this.messageService, 'Verification des documents terminee.');
        },
        error: (error) => ToastHelper.handleApiError(
          this.messageService, error, 'Verification des documents impossible.')
      });
  }

  toggleChecks(document: OnboardingDocument): void {
    if (this.expandedChecks.has(document.id)) {
      this.expandedChecks.delete(document.id);
    } else {
      this.expandedChecks.add(document.id);
    }
  }

  areChecksExpanded(document: OnboardingDocument): boolean {
    return this.expandedChecks.has(document.id);
  }

  verificationLabel(status?: DocumentVerificationStatus): string {
    return status ? this.verificationLabels[status] : 'Non verifie';
  }

  verificationSeverity(status?: DocumentVerificationStatus): PrimengSeverity {
    switch (status) {
      case 'MATCH': return 'success';
      case 'MISMATCH': return 'danger';
      case 'MISSING': return 'warn';
      case 'ERROR': return 'danger';
      default: return 'secondary';
    }
  }

  verificationIcon(status?: DocumentVerificationStatus): string {
    switch (status) {
      case 'MATCH': return 'pi pi-check-circle';
      case 'MISMATCH': return 'pi pi-times-circle';
      case 'MISSING': return 'pi pi-exclamation-triangle';
      case 'ERROR': return 'pi pi-ban';
      case 'UNSUPPORTED': return 'pi pi-minus-circle';
      default: return 'pi pi-question-circle';
    }
  }

  confidencePercent(document: OnboardingDocument): number | undefined {
    return document.confidenceScore == null ? undefined : Math.round(document.confidenceScore * 100);
  }

  // --- Dossier-level actions ------------------------------------------------

  resendInvitation(): void {
    if (!this.onboarding) return;
    this.onboardingService.resendInvitation(this.onboarding.id).subscribe({
      next: (status) => {
        if (this.onboarding) this.onboarding.invitation = status;
        ToastHelper.showSuccess(
          this.messageService,
          'Lien d\'activation envoye a l\'agent par email.'
        );
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Envoi de l\'invitation impossible.')
    });
  }

  /** Charge le statut d'invitation pour piloter l'affichage et les actions de gestion. */
  private refreshInvitationStatus(): void {
    this.onboardingService.getInvitationStatus(this.onboardingId)
      .pipe(catchError(() => of(undefined)))
      .subscribe(status => {
        if (this.onboarding && status) this.onboarding.invitation = status;
      });
  }

  /** Une invitation non encore activée (≠ USED) peut être corrigée ou annulée. */
  canManageInvitation(): boolean {
    const status = this.onboarding?.invitation?.status;
    return !!status && status !== 'USED';
  }

  /** Seule une invitation en attente (envoyée) peut être annulée. */
  canCancelInvitation(): boolean {
    return this.onboarding?.invitation?.status === 'PENDING';
  }

  openEditInvitationEmail(): void {
    this.invitationEmailValue = '';
    this.showInvitationEmailDialog = true;
  }

  saveInvitationEmail(): void {
    if (!this.onboarding) return;
    const email = (this.invitationEmailValue || '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ToastHelper.showError(this.messageService, 'Veuillez saisir un email valide.');
      return;
    }
    this.savingInvitation = true;
    this.onboardingService.updateInvitationEmail(this.onboarding.id, email)
      .pipe(finalize(() => this.savingInvitation = false))
      .subscribe({
        next: () => {
          this.showInvitationEmailDialog = false;
          ToastHelper.showSuccess(this.messageService, 'Email corrige : un nouveau lien a ete envoye.');
          this.load();
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Modification de l\'invitation impossible.')
      });
  }

  cancelInvitation(): void {
    if (!this.onboarding) return;
    ToastHelper.confirmAction(
      this.confirmationService,
      'Annuler cette invitation ? Le lien d\'activation deviendra invalide.',
      'Annulation de l\'invitation',
      () => {
        this.onboardingService.cancelInvitation(this.onboarding!.id).subscribe({
          next: (status) => {
            if (this.onboarding) this.onboarding.invitation = status;
            ToastHelper.showSuccess(this.messageService, 'Invitation annulee.');
            this.load();
          },
          error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Annulation de l\'invitation impossible.')
        });
      }
    );
  }

  startAssisted(): void {
    if (!this.onboarding) return;
    this.onboardingService.startAssisted(this.onboarding.id).subscribe({
      next: (updated) => {
        this.applyDetail(updated);
        ToastHelper.showSuccess(this.messageService, 'Mode assiste active.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Activation du mode assiste impossible.')
    });
  }

  validateDossier(): void {
    if (!this.onboarding) return;
    ToastHelper.confirmAction(
      this.confirmationService,
      'Confirmer la validation finale du dossier ?',
      'Validation onboarding',
      () => {
        this.onboardingService.validateDossier(this.onboarding!.id).subscribe({
          next: (updated) => {
            this.applyDetail(updated);
            ToastHelper.showSuccess(this.messageService, 'Dossier valide.');
          },
          error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Validation impossible.')
        });
      }
    );
  }

  askRejectDossier(): void {
    this.pendingReject = { kind: 'dossier' };
    this.rejectDialog?.show(this.onboarding?.rejectionReason ?? '');
  }

  // --- Document-level actions (Documents tab) -------------------------------

  validateDocument(document: OnboardingDocument): void {
    if (!this.onboarding) return;
    const warning = document.verificationStatus === 'MISMATCH' || document.verificationStatus === 'MISSING'
      ? `La verification automatique a releve un ecart (${this.verificationLabel(document.verificationStatus)}). `
        + 'Valider quand meme ce document ?'
      : null;

    const run = () => this.onboardingService.validateDocument(this.onboarding!.id, document.id).subscribe({
      next: (updated) => {
        this.applyDetail(updated);
        ToastHelper.showSuccess(this.messageService, 'Document valide.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Validation du document impossible.')
    });

    // Le verdict OCR n'interdit rien : il demande simplement une confirmation explicite.
    if (warning) {
      ToastHelper.confirmAction(this.confirmationService, warning, 'Validation malgre un ecart', run);
    } else {
      run();
    }
  }

  askRejectDocument(document: OnboardingDocument): void {
    this.pendingReject = { kind: 'document', documentId: document.id };
    this.rejectDialog?.show(document.rejectionReason ?? this.suggestedRejectionReason(document));
  }

  /** Pré-remplit le motif avec les écarts relevés par l'OCR : l'admin n'a plus qu'à confirmer. */
  private suggestedRejectionReason(document: OnboardingDocument): string {
    const issues = (document.verificationChecks ?? []).filter(c => c.status !== 'MATCH');
    if (!issues.length) return '';
    return 'Verification automatique : '
      + issues.map(c => c.status === 'MISSING'
          ? `${c.label} introuvable sur le document`
          : `${c.label} lu "${c.extracted}" au lieu de "${c.expected}"`)
        .join(' ; ')
      + '.';
  }

  confirmRejection(reason: string): void {
    if (!this.pendingReject || !this.onboarding) return;
    const target = this.pendingReject;
    this.pendingReject = undefined;

    if (target.kind === 'dossier') {
      this.onboardingService.rejectDossier(this.onboarding.id, reason).subscribe({
        next: (updated) => {
          this.applyDetail(updated);
          ToastHelper.showSuccess(this.messageService, 'Dossier rejete.');
        },
        error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Rejet impossible.')
      });
      return;
    }

    this.onboardingService.rejectDocument(this.onboarding.id, target.documentId, reason).subscribe({
      next: (updated) => {
        this.applyDetail(updated);
        ToastHelper.showSuccess(this.messageService, 'Document rejete.');
      },
      error: (error) => ToastHelper.handleApiError(this.messageService, error, 'Rejet du document impossible.')
    });
  }

  /**
   * Remplace le dossier affiché en conservant le statut d'invitation, chargé par un appel séparé
   * et absent des réponses de mutation. Garde aussi la visionneuse synchronisée avec le document
   * rafraîchi (statut et verdict OCR à jour sans refermer le dialogue).
   */
  private applyDetail(updated: OnboardingDetail): void {
    this.onboarding = { ...updated, invitation: this.onboarding?.invitation };
    if (this.previewedDocument) {
      this.previewedDocument = this.documents.find(d => d.id === this.previewedDocument!.id);
    }
  }

  // --- Derived helpers ------------------------------------------------------

  get progress(): number {
    return this.onboarding?.progressPercent ?? 0;
  }

  isPendingValidation(): boolean {
    return this.onboarding?.status === 'PENDING_VALIDATION';
  }

  documentsCount(): number {
    return this.onboarding?.documents?.length ?? 0;
  }

  validatedDocumentsCount(): number {
    return (this.onboarding?.documents ?? []).filter(d => d.status === 'VALIDATED').length;
  }

  pendingDocumentsCount(): number {
    return (this.onboarding?.documents ?? []).filter(d => d.status !== 'VALIDATED').length;
  }

  completedStepsCount(): number {
    return (this.onboarding?.steps ?? []).filter(s => s.status === 'COMPLETED').length;
  }

  totalStepsCount(): number {
    return this.onboarding?.steps?.length ?? 0;
  }

  headerMenu(): MenuItem[] {
    const o = this.onboarding;
    return [
      {
        label: 'Renvoyer l\'invitation',
        icon: 'pi pi-send',
        command: () => this.resendInvitation()
      },
      {
        label: 'Modifier l\'email de l\'invitation',
        icon: 'pi pi-pencil',
        disabled: !this.canManageInvitation(),
        command: () => this.openEditInvitationEmail()
      },
      {
        label: 'Annuler l\'invitation',
        icon: 'pi pi-ban',
        disabled: !this.canCancelInvitation(),
        command: () => this.cancelInvitation()
      },
      {
        label: 'Activer le mode assiste',
        icon: 'pi pi-user-edit',
        disabled: !o || o.completionMode === 'ASSISTED',
        command: () => this.startAssisted()
      },
      { separator: true },
      {
        label: 'Valider le dossier',
        icon: 'pi pi-check',
        disabled: !o || o.status !== 'PENDING_VALIDATION',
        command: () => this.validateDossier()
      },
      {
        label: 'Rejeter le dossier',
        icon: 'pi pi-times',
        disabled: !o || o.status !== 'PENDING_VALIDATION',
        command: () => this.askRejectDossier()
      }
    ];
  }

  agentName(): string {
    const agent = this.onboarding?.agent;
    return [agent?.prenom, agent?.nom].filter(Boolean).join(' ') || 'Agent non complete';
  }

  agentInitials(): string {
    const agent = this.onboarding?.agent;
    const a = (agent?.prenom || '').trim().charAt(0).toUpperCase();
    const b = (agent?.nom || '').trim().charAt(0).toUpperCase();
    return (a + b) || '?';
  }

  matricule(): string {
    return this.onboarding?.matricule?.matricule || this.onboarding?.agent?.matricule?.matricule || '-';
  }

  agentEmail(): string {
    return this.onboarding?.agent?.email
      || this.onboarding?.agent?.coordonneesProfessionnelles?.emailPro
      || this.onboarding?.invitation?.email
      || '-';
  }

  agentPhone(): string {
    return this.onboarding?.agent?.telephone
      || this.onboarding?.agent?.coordonneesProfessionnelles?.telPortable
      || '-';
  }

  principalAdresse(): string {
    const list = this.onboarding?.agent?.adresses ?? [];
    const principal = list.find(a => a.type === 'PRINCIPALE') ?? list[0];
    return principal?.adresse || '-';
  }

  principalVille(): string {
    const list = this.onboarding?.agent?.adresses ?? [];
    const principal = list.find(a => a.type === 'PRINCIPALE') ?? list[0];
    return principal?.ville || principal?.localite || '-';
  }

  stepLabel(step: OnboardingStep): string {
    const key = (step.stepType || step.stepKey) as OnboardingStepType | undefined;
    return key ? STEP_LABELS[key] ?? key : 'Etape';
  }

  stepIcon(step: OnboardingStep): string {
    const key = (step.stepType || step.stepKey) as OnboardingStepType | undefined;
    return key ? STEP_ICONS[key] ?? 'pi-circle' : 'pi-circle';
  }

  stepStateIcon(step: OnboardingStep): string {
    switch (step.status) {
      case 'COMPLETED': return 'pi-check';
      case 'IN_PROGRESS': return 'pi-clock';
      default: return 'pi-circle';
    }
  }

  stepStateLabel(step: OnboardingStep): string {
    switch (step.status) {
      case 'COMPLETED': return 'Termine';
      case 'IN_PROGRESS': return 'En cours';
      default: return 'En attente';
    }
  }

  actionLabel(action?: string): string {
    if (!action) return 'Activite';
    return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase());
  }

  actionIcon(action?: string): string {
    return action ? (ACTION_ICONS[action] ?? 'pi-circle-fill') : 'pi-circle-fill';
  }

  actionSeverity(action?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return action ? (ACTION_SEVERITY[action] ?? 'secondary') : 'secondary';
  }

  // --- Labels / severity ----------------------------------------------------

  private mapLabel(map: Record<string, string>, value?: string): string {
    return value ? (map[value] || value) : '-';
  }

  statusSeverity(status?: string): PrimengSeverity {
    return onboardingTagSeverity(status);
  }

  onboardingStatusLabel(status?: string): string { return this.mapLabel(this.onboardingLabels, status); }
  agentStatusLabel(status?: string): string { return this.mapLabel(this.agentLabels, status); }
  modeLabel(mode?: string): string { return this.mapLabel(this.modeLabels, mode); }
  documentStatusLabel(status?: string): string { return this.mapLabel(this.documentLabels, status); }
  invitationStatusLabel(status?: string): string { return this.mapLabel(this.invitationLabels, status) || 'Non creee'; }
}
