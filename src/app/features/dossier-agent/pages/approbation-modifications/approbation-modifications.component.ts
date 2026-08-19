import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Textarea } from 'primeng/textarea';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DemandeModificationService } from '../../services/demande-modification.service';
import {
  DemandeModificationDto,
  StatutModification
} from '../../../../models/demande-modification.model';
import {
  CoordonneesBancairesDto,
  EnfantDto
} from '../../../../models/agent-full.model';
import {
  DocumentVerificationStatus,
  VERIFICATION_STATUS_LABELS
} from '../../../../models/onboarding.model';
import { DocumentVerificationPanelComponent } from '../../../../shared/components/document-verification-panel/document-verification-panel.component';

@Component({
  selector: 'app-approbation-modifications',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, FormsModule,
    TableModule, TagModule, ButtonModule,
    Dialog, InputTextModule, TooltipModule, Toast,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    ConfirmDialog, Textarea,
    TranslateModule,
    DocumentVerificationPanelComponent
  ],
  templateUrl: './approbation-modifications.component.html',
  styleUrl: './approbation-modifications.component.scss'
})
export class ApprobationModificationsComponent implements OnInit {

  allRequests: DemandeModificationDto[] = [];
  pendingRequests: DemandeModificationDto[] = [];
  treatedRequests: DemandeModificationDto[] = [];
  loading = false;

  // Detail dialog
  showDetailDialog = false;
  selectedRequest: DemandeModificationDto | null = null;
  parsedPayload: any = null;

  // Action dialog
  showActionDialog = false;
  actionType: 'approve' | 'reject' = 'approve';
  actionComment = '';
  actionLoading = false;

  // Verification OCR du justificatif
  verifying = false;

  // Search
  searchText = '';

  private readonly P = 'GESTION_PERSONNELLE.APPROBATION_MODIFICATIONS.';

  constructor(
    private demandeService: DemandeModificationService,
    private msgService: MessageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.demandeService.all().subscribe({
      next: (data) => {
        this.allRequests = data;
        this.pendingRequests = data.filter(r => r.statut === 'EN_ATTENTE');
        this.treatedRequests = data.filter(r => r.statut !== 'EN_ATTENTE');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.msgService.add({
          severity: 'error',
          summary: this.translate.instant('GLOBAL.ERREUR'),
          detail: this.translate.instant(this.P + 'ERR_LOAD')
        });
      }
    });
  }

  // ── Detail ─────────────────────────────────────────────────────────
  openDetail(req: DemandeModificationDto): void {
    this.selectedRequest = req;
    try {
      this.parsedPayload = JSON.parse(req.payload);
    } catch {
      this.parsedPayload = null;
    }
    this.showDetailDialog = true;
  }

  isBancaire(req: DemandeModificationDto): boolean {
    return req.type === 'BANCAIRE';
  }

  getBancairePayload(): CoordonneesBancairesDto | null {
    return this.parsedPayload as CoordonneesBancairesDto;
  }

  getEnfantPayload(): EnfantDto | null {
    return this.parsedPayload as EnfantDto;
  }

  // ── Verification OCR du justificatif ───────────────────────────────
  // Le document est analyse automatiquement au depot ; ce bouton sert a relancer
  // l'analyse quand elle a echoue (OCR indisponible, document juge illisible).

  verdictOf(req: DemandeModificationDto): DocumentVerificationStatus | undefined {
    return req.documents?.[0]?.verificationStatus;
  }

  verdictLabel(status: DocumentVerificationStatus): string {
    return VERIFICATION_STATUS_LABELS[status];
  }

  verdictIcon(status: DocumentVerificationStatus): string {
    switch (status) {
      case 'MATCH': return 'pi pi-check-circle';
      case 'MISMATCH': return 'pi pi-times-circle';
      case 'MISSING': return 'pi pi-exclamation-triangle';
      case 'ERROR': return 'pi pi-ban';
      default: return 'pi pi-minus-circle';
    }
  }

  verdictTooltip(req: DemandeModificationDto): string {
    return req.documents?.[0]?.verificationMessage
      ?? 'Verification automatique du justificatif';
  }

  verifyDocument(): void {
    if (!this.selectedRequest) return;
    this.verifying = true;
    this.demandeService.verify(this.selectedRequest.id)
      .pipe(finalize(() => this.verifying = false))
      .subscribe({
        next: (updated) => {
          this.selectedRequest = updated;
          this.replaceInLists(updated);
          this.msgService.add({
            severity: 'success', summary: this.translate.instant('GLOBAL.SUCCES'),
            detail: updated.documents?.[0]?.verificationMessage ?? 'Document analyse.'
          });
        },
        error: (err) => this.msgService.add({
          severity: 'error', summary: this.translate.instant('GLOBAL.ERREUR'),
          detail: err?.error?.message ?? 'Analyse du document impossible.'
        })
      });
  }

  /** Garde les trois listes (toutes / en attente / traitees) alignees sur la demande rafraichie. */
  private replaceInLists(updated: DemandeModificationDto): void {
    const swap = (list: DemandeModificationDto[]) =>
      list.map(r => r.id === updated.id ? updated : r);
    this.allRequests = swap(this.allRequests);
    this.pendingRequests = swap(this.pendingRequests);
    this.treatedRequests = swap(this.treatedRequests);
  }

  // ── Approve / Reject ───────────────────────────────────────────────
  openAction(req: DemandeModificationDto, type: 'approve' | 'reject'): void {
    this.selectedRequest = req;
    this.actionType = type;
    this.actionComment = '';
    this.showActionDialog = true;
  }

  confirmAction(): void {
    if (!this.selectedRequest) return;
    this.actionLoading = true;

    const obs = this.actionType === 'approve'
      ? this.demandeService.approve(this.selectedRequest.id, this.actionComment)
      : this.demandeService.reject(this.selectedRequest.id, this.actionComment);

    obs.subscribe({
      next: () => {
        this.actionLoading = false;
        this.showActionDialog = false;
        this.showDetailDialog = false;
        const msgKey = this.actionType === 'approve'
          ? this.P + 'MSG_SUCCESS_APPROVE'
          : this.P + 'MSG_SUCCESS_REJECT';
        this.msgService.add({
          severity: 'success',
          summary: this.translate.instant('GLOBAL.SUCCES'),
          detail: this.translate.instant(msgKey)
        });
        this.loadAll();
      },
      error: (err) => {
        this.actionLoading = false;
        this.msgService.add({
          severity: 'error',
          summary: this.translate.instant('GLOBAL.ERREUR'),
          detail: err.error?.message || this.translate.instant(this.P + 'ERR_ACTION')
        });
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────
  typeLabel(type: string): string {
    return type === 'BANCAIRE'
      ? this.translate.instant(this.P + 'TYPE_BANCAIRE')
      : this.translate.instant(this.P + 'TYPE_ENFANT');
  }

  typeIcon(type: string): string {
    return type === 'BANCAIRE' ? 'pi pi-wallet' : 'pi pi-child';
  }

  statutSeverity(statut: StatutModification): 'warn' | 'success' | 'danger' | 'info' {
    switch (statut) {
      case 'EN_ATTENTE': return 'warn';
      case 'APPROUVEE':  return 'success';
      case 'REJETEE':    return 'danger';
      default:           return 'info';
    }
  }

  statutLabel(statut: StatutModification): string {
    switch (statut) {
      case 'EN_ATTENTE': return this.translate.instant(this.P + 'STATUT_EN_ATTENTE');
      case 'APPROUVEE':  return this.translate.instant(this.P + 'STATUT_APPROUVEE');
      case 'REJETEE':    return this.translate.instant(this.P + 'STATUT_REJETEE');
      default:           return statut;
    }
  }

  sexeLabel(sexe?: string): string {
    if (sexe === 'M') return this.translate.instant('GLOBAL.MASCULIN');
    if (sexe === 'F') return this.translate.instant('GLOBAL.FEMININ');
    return '—';
  }
}
