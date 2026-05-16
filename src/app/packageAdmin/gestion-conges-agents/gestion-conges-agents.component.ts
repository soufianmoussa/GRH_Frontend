import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Table, TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';

import { environment } from '../../../../environment.prod';
import { SoldeCongeService } from '../../services/AdminService/SoldeConge/solde-conge.service';
import { UniteStructurelleService } from '../../services/AdminService/GestionOrganisationelle/unite-structurelle.service';
import { UniteStructurelle } from '../../models/gestionOrganisationelle/unite-structurelle.model';
import {
  AdjustSoldeRequest,
  AgentSoldeSummary,
  HistoriqueSoldeConge,
  LeaveType,
  SoldeConge,
  TypeOperationSoldeConge
} from '../../models/soldeConge.model';
import { ToastHelper } from '../../shared/toast-helper';
import { TypeConge } from '../../models/typeConge.model';
import { TypeCongeService } from '../../services/AdminService/TypeConge/type-conge.service';

interface DemandeCongeDto {
  id: number;
  agentId: number;
  agentNom: string;
  agentPrenom: string;
  agentMatricule: string;
  type: LeaveType;
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'ANNULEE';
  dateDebut: string;
  dateFin: string;
  duree: number;
  dateCreation: string;
  commentaire: string | null;
}

interface StoredFileDto {
  id: number;
  originalFileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  fileCategory: string;
  agentId: number | null;
  demandeCongeId: number | null;
  url: string;
}

@Component({
  selector: 'app-gestion-conges-agents',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, FormsModule, TableModule, Dialog, Button, ButtonDirective,
    InputText, Textarea, DropdownModule, FloatLabelModule, TooltipModule,
    Toast, ConfirmDialogModule, TagModule, Tab, TabList, TabPanel, TabPanels, Tabs, PrimeTemplate
  ],
  templateUrl: './gestion-conges-agents.component.html',
  styleUrl: './gestion-conges-agents.component.scss'
})
export class GestionCongesAgentsComponent implements OnInit {

  private readonly API_BASE = `${environment.apiUrl}`;

  leaveTypes: { label: string; short: string; value: LeaveType }[] = [];
  typeCongeMap: Record<string, TypeConge> = {};

  readonly operationTypes: { label: string; value: TypeOperationSoldeConge }[] = [
    { label: 'Ajouter des jours', value: 'AJOUT' },
    { label: 'Déduire des jours', value: 'DEDUCTION' },
    { label: 'Ajustement (valeur cible)', value: 'AJUSTEMENT' }
  ];

  // Filtres globaux
  anneesDropdown: { label: string; value: number }[] = [];
  unitesDropdown: UniteStructurelle[] = [];
  selectedAnnee: number = new Date().getFullYear();
  selectedUniteId: number | null = null;
  search = '';

  // Liste maître
  loading = false;
  initializing = false;
  rows: AgentSoldeSummary[] = [];
  pageSize = 10;

  getSoldeByType(row: AgentSoldeSummary, type: LeaveType): number {
    return row.soldesParType?.[type] ?? 0;
  }

  // Sélection courante
  selectedAgent: AgentSoldeSummary | null = null;
  activeTab: string = '0';

  // Onglet demandes
  demandes: DemandeCongeDto[] = [];
  loadingDemandes = false;

  // Détail d'une demande
  readonly fileCategories = [
    { label: 'Justificatif de congé', value: 'LEAVE_JUSTIFICATION' },
    { label: 'Certificat médical', value: 'MEDICAL_CERTIFICATE' },
    { label: 'Pièce jointe', value: 'LEAVE_ATTACHMENT' }
  ];
  displayDemandeDetail = false;
  selectedDemande: DemandeCongeDto | null = null;
  demandeDocuments: StoredFileDto[] = [];
  loadingDocuments = false;

  // Dialogues d'action dédiés
  displayApprove = false;
  displayReject = false;
  displayCancel = false;
  pendingDemande: DemandeCongeDto | null = null;
  actionInProgress = false;

  // Onglet historique
  historyRows: HistoriqueSoldeConge[] = [];
  loadingHistory = false;

  // Dialogs
  displayAdjust = false;

  /**
   * Formulaire d'ajustement simplifié :
   * - annee : année cible
   * - jours : entier signé (ex. 2 ou -1). 0 interdit.
   * - motif : texte libre reporté dans l'historique.
   * Le type de congé est fixé à ANNUEL (seul type modifiable ici).
   */
  adjustForm: {
    annee: number;
    typeConge: LeaveType;
    jours: number | null;
    motif: string;
  } = {
    annee: this.selectedAnnee,
    typeConge: 'ANNUEL',
    jours: null,
    motif: ''
  };
  @ViewChild('adjustFormRef') adjustFormRef?: NgForm;

  constructor(
    private http: HttpClient,
    private soldeService: SoldeCongeService,
    private uniteService: UniteStructurelleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private typeCongeService: TypeCongeService
  ) {}

  ngOnInit(): void {
    const current = new Date().getFullYear();
    for (let y = current - 3; y <= current + 1; y++) {
      this.anneesDropdown.push({ label: String(y), value: y });
    }
    this.loadLeaveTypes();
    this.loadUnites();
    this.loadSummary();
  }

  loadLeaveTypes(): void {
    this.typeCongeService.getAll().subscribe({
      next: (types: TypeConge[]) => {
        this.leaveTypes = types.map(t => ({
          label: t.label,
          short: t.label.replace(/^Congé\s+(de\s+)?/i, '').replace(/^\w/, c => c.toUpperCase()),
          value: t.code as LeaveType
        }));
        types.forEach(t => this.typeCongeMap[t.code] = t);
      },
      error: () => ToastHelper.showError(this.messageService, 'Erreur lors du chargement des types de congé.')
    });
  }

  // ─────────────────────── Master list ───────────────────────

  loadUnites() {
    this.uniteService.getAll(0, 1000).subscribe({
      next: (res) => { this.unitesDropdown = res.content || []; },
      error: () => { /* non-blocking */ }
    });
  }

  loadSummary() {
    this.loading = true;
    this.soldeService.getSummary(this.selectedAnnee, this.search, this.selectedUniteId).subscribe({
      next: (res) => {
        this.rows = res || [];
        this.loading = false;
        // Si l'agent actuellement sélectionné n'est plus dans la liste filtrée, déselectionner.
        if (this.selectedAgent && !this.rows.find(r => r.agentId === this.selectedAgent!.agentId)) {
          this.selectedAgent = null;
        }
      },
      error: () => {
        this.rows = [];
        this.loading = false;
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  applySearch() { this.loadSummary(); }

  clearFilters(table: Table) {
    this.search = '';
    this.selectedUniteId = null;
    table.clear();
    this.loadSummary();
  }

  // ─────────────────────── Selection ───────────────────────

  selectAgent(row: AgentSoldeSummary) {
    this.selectedAgent = row;
    this.activeTab = '0';
    this.loadDemandes(row.agentId);
  }

  closeDetail() {
    this.selectedAgent = null;
    this.demandes = [];
    this.historyRows = [];
  }

  onTabChange(event: any) {
    const newValue = (event && typeof event === 'object' && 'value' in event) ? event.value : event;
    this.activeTab = newValue;
    if (!this.selectedAgent) return;
    if (this.activeTab === '1') {
      this.loadDemandes(this.selectedAgent.agentId);
    } else if (this.activeTab === '2') {
      this.loadHistory(this.selectedAgent.agentId);
    }
  }

  // ─────────────────────── Soldes helpers ───────────────────────

  getDetailList(row: AgentSoldeSummary | null): { type: LeaveType; label: string; solde: SoldeConge | null; total: number }[] {
    if (!row) return [];
    return this.leaveTypes.map(t => ({
      type: t.value,
      label: t.label,
      solde: row.detailsParType?.[t.value] || null,
      total: row.soldesParType?.[t.value] ?? 0
    }));
  }

  getLeaveTypeLabel(type: LeaveType): string {
    return this.leaveTypes.find(t => t.value === type)?.label || type;
  }

  getOperationLabel(op: TypeOperationSoldeConge): string {
    return this.operationTypes.find(o => o.value === op)?.label || op;
  }

  getOperationSeverity(op: TypeOperationSoldeConge): 'success' | 'danger' | 'info' | 'warn' {
    switch (op) {
      case 'AJOUT': return 'success';
      case 'DEDUCTION': return 'danger';
      case 'INITIALISATION': return 'info';
      case 'AJUSTEMENT': return 'warn';
    }
  }

  // ─────────────────────── Demandes ───────────────────────

  loadDemandes(agentId: number) {
    this.loadingDemandes = true;
    this.http.get<DemandeCongeDto[]>(`${this.API_BASE}/demandes-conges/agent/${agentId}`).subscribe({
      next: (res) => {
        this.demandes = (res || []).sort((a, b) =>
          new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
        );
        this.loadingDemandes = false;
      },
      error: () => {
        this.demandes = [];
        this.loadingDemandes = false;
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  getStatusLabel(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'APPROUVEE': 'Approuvée',
      'REJETEE': 'Refusée',
      'ANNULEE': 'Annulée'
    };
    return map[statut] || statut;
  }

  getStatusSeverity(statut: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    switch (statut) {
      case 'APPROUVEE': return 'success';
      case 'REJETEE': return 'danger';
      case 'EN_ATTENTE': return 'warn';
      case 'ANNULEE': return 'secondary';
      default: return 'info';
    }
  }

  pendingCount(row: AgentSoldeSummary): number {
    // Approximation : ce compteur est mis à jour en live uniquement après sélection.
    if (!this.selectedAgent || this.selectedAgent.agentId !== row.agentId) return 0;
    return this.demandes.filter(d => d.statut === 'EN_ATTENTE').length;
  }

  // ── Détail d'une demande ──────────────────────────────────

  openDemandeDetail(d: DemandeCongeDto) {
    this.selectedDemande = d;
    this.demandeDocuments = [];
    this.displayDemandeDetail = true;
    this.loadDemandeDocuments(d.id);
  }

  closeDemandeDetail() {
    this.displayDemandeDetail = false;
    this.selectedDemande = null;
    this.demandeDocuments = [];
  }

  loadDemandeDocuments(demandeId: number) {
    this.loadingDocuments = true;
    this.http.get<StoredFileDto[]>(`${this.API_BASE}/demandes-conges/${demandeId}/documents`).subscribe({
      next: (res) => {
        this.demandeDocuments = res || [];
        this.loadingDocuments = false;
      },
      error: () => {
        this.demandeDocuments = [];
        this.loadingDocuments = false;
      }
    });
  }

  onViewDocument(doc: StoredFileDto) {
    window.open(doc.url, '_blank');
  }

  getCategoryLabel(category: string): string {
    return this.fileCategories.find(c => c.value === category)?.label || category;
  }

  getCategorySeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (category) {
      case 'MEDICAL_CERTIFICATE': return 'danger';
      case 'LEAVE_JUSTIFICATION': return 'warn';
      case 'LEAVE_ATTACHMENT': return 'info';
      default: return 'secondary';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  // ── Actions sur demandes (dialogues dédiés) ───────────────

  askApprove(d: DemandeCongeDto, event?: Event) {
    event?.stopPropagation();
    this.pendingDemande = d;
    this.displayApprove = true;
  }

  askReject(d: DemandeCongeDto, event?: Event) {
    event?.stopPropagation();
    this.pendingDemande = d;
    this.displayReject = true;
  }

  askCancel(d: DemandeCongeDto, event?: Event) {
    event?.stopPropagation();
    this.pendingDemande = d;
    this.displayCancel = true;
  }

  confirmApprove() {
    if (!this.pendingDemande) return;
    const d = this.pendingDemande;
    this.actionInProgress = true;
    this.http.post<DemandeCongeDto>(`${this.API_BASE}/demandes-conges/${d.id}/approve`, {}).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Demande approuvée.');
        this.displayApprove = false;
        this.pendingDemande = null;
        this.actionInProgress = false;
        if (this.selectedAgent) {
          this.loadDemandes(this.selectedAgent.agentId);
          this.loadSummary();
        }
      },
      error: (err) => {
        this.actionInProgress = false;
        ToastHelper.showUpdateError(this.messageService, err?.error?.message);
      }
    });
  }

  confirmReject() {
    if (!this.pendingDemande) return;
    const d = this.pendingDemande;
    this.actionInProgress = true;
    this.http.post<DemandeCongeDto>(`${this.API_BASE}/demandes-conges/${d.id}/reject`, {}).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Demande refusée.');
        this.displayReject = false;
        this.pendingDemande = null;
        this.actionInProgress = false;
        if (this.selectedAgent) this.loadDemandes(this.selectedAgent.agentId);
      },
      error: (err) => {
        this.actionInProgress = false;
        ToastHelper.showUpdateError(this.messageService, err?.error?.message);
      }
    });
  }

  confirmCancel() {
    if (!this.pendingDemande) return;
    const d = this.pendingDemande;
    this.actionInProgress = true;
    this.http.post<DemandeCongeDto>(`${this.API_BASE}/demandes-conges/${d.id}/cancel`, {}).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Demande annulée.');
        this.displayCancel = false;
        this.pendingDemande = null;
        this.actionInProgress = false;
        if (this.selectedAgent) {
          this.loadDemandes(this.selectedAgent.agentId);
          this.loadSummary();
        }
      },
      error: (err) => {
        this.actionInProgress = false;
        ToastHelper.showUpdateError(this.messageService, err?.error?.message);
      }
    });
  }

  // ─────────────────────── Historique ───────────────────────

  loadHistory(agentId: number) {
    this.loadingHistory = true;
    this.soldeService.getHistoryByAgent(agentId, this.selectedAnnee).subscribe({
      next: (res) => {
        this.historyRows = res || [];
        this.loadingHistory = false;
      },
      error: () => {
        this.historyRows = [];
        this.loadingHistory = false;
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  // ─────────────────────── Initialiser (agent sélectionné) ───────────────────────

  /**
   * Ré-initialise les soldes de congé de l'agent actuellement sélectionné
   * pour l'année en cours, après une simple confirmation.
   */
  initializeCurrentAgent() {
    if (!this.selectedAgent) return;
    const agent = this.selectedAgent;
    ToastHelper.confirmAction(
      this.confirmationService,
      `Confirmer la réinitialisation des soldes de congé de ${agent.nom} ${agent.prenom} pour l'année ${this.selectedAnnee} ?`,
      'Confirmation',
      () => {
        this.initializing = true;
        this.soldeService.initializeForAgent(agent.agentId, this.selectedAnnee, true).subscribe({
          next: (res) => {
            this.initializing = false;
            ToastHelper.showSuccess(
              this.messageService,
              `Soldes réinitialisés : ${res.soldesCreated} créés, ${res.soldesUpdated} mis à jour.`
            );
            this.loadSummary();
            this.loadHistory(agent.agentId);
          },
          error: (err) => {
            this.initializing = false;
            ToastHelper.showUpdateError(this.messageService, err?.error?.message);
          }
        });
      }
    );
  }

  // ─────────────────────── Ajuster (par agent) ───────────────────────

  showAdjustDialog() {
    if (!this.selectedAgent) return;
    this.adjustForm = {
      annee: this.selectedAnnee,
      typeConge: 'ANNUEL',
      jours: null,
      motif: ''
    };
    this.displayAdjust = true;
    setTimeout(() => this.adjustFormRef?.resetForm(this.adjustForm));
  }

  saveAdjust() {
    if (!this.selectedAgent) return;
    const f = this.adjustForm;
    if (f.annee == null || f.jours == null || f.jours === 0) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const nombreJours = Math.abs(f.jours);
    const typeOperation: TypeOperationSoldeConge = f.jours > 0 ? 'AJOUT' : 'DEDUCTION';

    const payload: AdjustSoldeRequest = {
      agentId: this.selectedAgent.agentId,
      annee: f.annee,
      typeConge: f.typeConge,
      typeOperation,
      nombreJours,
      ...(f.motif?.trim() ? { commentaire: f.motif.trim() } : {})
    };
    this.soldeService.adjust(payload).subscribe({
      next: () => {
        this.displayAdjust = false;
        ToastHelper.showSuccess(this.messageService, 'Solde mis à jour avec succès.');
        this.loadSummary();
        if (this.selectedAgent) this.loadHistory(this.selectedAgent.agentId);
      },
      error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
    });
  }
}
