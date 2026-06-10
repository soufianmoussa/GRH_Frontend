import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TreeNode } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { Calendar } from 'primeng/calendar';
import { Tooltip } from 'primeng/tooltip';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { TypeUniteStructurelle } from '../../../../../enums/type-unite-structurelle.enum';
import { OrganigrammeService } from '../../../services/organigramme.service';
import { UniteStructurelleService } from '../../../services/unite-structurelle.service';
import { PosteService } from '../../../services/poste.service';
import { ResponsableUniteService } from '../../../services/responsable-unite.service';
import { AffectationAgentPosteService } from '../../../services/affectation-agent-poste.service';
import { FonctionService } from '../../../services/fonction.service';
import { PostesactivitesService } from '../../../../parametrage/services/postes-activites/postesactivites.service';
import {
  OrganigrammeNode,
  OrganigrammePoste,
  StatutResponsable
} from '../../../../../models/gestionOrganisationelle/organigramme.model';
import { AgentOption } from '../../../../../models/gestionOrganisationelle/responsable-unite.model';
import { PosteOption } from '../../../../../models/gestionOrganisationelle/affectation-agent-poste.model';

type TypeFilter = 'ALL' | TypeUniteStructurelle;

interface SummaryStats {
  totalUnites: number;
  responsablesActifs: number;
  postesOccupes: number;
  postesVacants: number;
}

interface UniteForm {
  id: number | null;
  code: string;
  abreviation: string;
  libelle: string;
  type: TypeUniteStructurelle;
  parentId: number | null;
}

interface ResponsableForm {
  uniteId: number | null;
  agentId: number | null;
  dateDebut: Date | null;
}

interface PosteForm {
  id: number | null;
  codeCourt: string;
  libelleDuPoste: string;
  dateCreation: Date | null;
  uniteStructurelleId: number | null;
  fonctionId: number | null;
  posteTravailId: number | null;
}

interface AffectationForm {
  posteId: number | null;
  agentId: number | null;
  date: Date | null;
  motif: string;
}

interface TransferForm {
  agentId: number | null;
  fromPosteId: number | null;
  toPosteId: number | null;
  dateTransfert: Date | null;
  motif: string;
}

interface Option { label: string; value: number; }

@Component({
  selector: 'app-organigramme',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    OrganizationChartModule,
    TableModule,
    Button,
    InputText,
    Toast,
    Dialog,
    DropdownModule,
    Calendar,
    Tooltip,
    FloatLabelModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './organigramme.component.html',
  styleUrls: ['./organigramme.component.scss']
})
export class OrganigrammeComponent implements OnInit {

  // ── Data / state ──────────────────────────────────────
  loading = false;
  loadError = false;

  roots: OrganigrammeNode[] = [];
  chartData: TreeNode[] = [];
  chartSelection: TreeNode | null = null;
  selectedUnit: OrganigrammeNode | null = null;

  /** 'list' = gestion quotidienne (arbre + détails) ; 'chart' = exploration visuelle plein écran. */
  viewMode: 'list' | 'chart' = 'list';
  /** Nœuds dépliés dans l'arbre de la Vue Liste. */
  listExpanded = new Set<number>();

  searchQuery = '';
  typeFilter: TypeFilter = 'ALL';

  zoom = 1;
  panX = 0;
  panY = 0;
  private panning = false;
  private panStartX = 0;
  private panStartY = 0;

  private matchIds = new Set<number>();
  private expandIds = new Set<number>();

  readonly typeFilters: { key: TypeFilter; labelKey: string }[] = [
    { key: 'ALL', labelKey: 'GESTION_ORGANISATIONELLE.ORGANIGRAMME.FILTER_ALL' },
    { key: TypeUniteStructurelle.DIRECTION, labelKey: 'GLOBAL.DIRECTION' },
    { key: TypeUniteStructurelle.DIVISION, labelKey: 'GLOBAL.DIVISION' },
    { key: TypeUniteStructurelle.SERVICE, labelKey: 'GLOBAL.SERVICE' }
  ];

  readonly typeOptions = [
    { label: 'GLOBAL.DIRECTION', value: TypeUniteStructurelle.DIRECTION },
    { label: 'GLOBAL.DIVISION', value: TypeUniteStructurelle.DIVISION },
    { label: 'GLOBAL.SERVICE', value: TypeUniteStructurelle.SERVICE }
  ];

  stats: SummaryStats = { totalUnites: 0, responsablesActifs: 0, postesOccupes: 0, postesVacants: 0 };

  // ── Referential dropdowns ─────────────────────────────
  fonctions: Option[] = [];
  postesTravail: Option[] = [];
  agentsForUnite: AgentOption[] = [];
  availableAgents: AgentOption[] = [];
  availablePostes: PosteOption[] = [];

  // ── Dialog state ──────────────────────────────────────
  showUnitDialog = false;
  unitDialogMode: 'add' | 'edit' = 'add';
  unitForm: UniteForm = this.emptyUniteForm();
  savingUnit = false;

  showResponsableDialog = false;
  responsableForm: ResponsableForm = { uniteId: null, agentId: null, dateDebut: new Date() };
  savingResponsable = false;

  showPosteDialog = false;
  posteDialogMode: 'add' | 'edit' = 'add';
  posteForm: PosteForm = this.emptyPosteForm();
  savingPoste = false;

  showAffectationDialog = false;
  affectationMode: 'assign' | 'change' = 'assign';
  affectationForm: AffectationForm = { posteId: null, agentId: null, date: new Date(), motif: '' };
  currentAffectationId: number | null = null;
  savingAffectation = false;

  showTransferDialog = false;
  transferForm: TransferForm = { agentId: null, fromPosteId: null, toPosteId: null, dateTransfert: new Date(), motif: '' };
  savingTransfer = false;

  constructor(
    private organigrammeService: OrganigrammeService,
    private uniteService: UniteStructurelleService,
    private posteService: PosteService,
    private responsableService: ResponsableUniteService,
    private affectationService: AffectationAgentPosteService,
    private fonctionService: FonctionService,
    private posteTravailService: PostesactivitesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadOrganigramme();
    this.loadReferentials();
  }

  // ── Loading ───────────────────────────────────────────
  loadOrganigramme(keepSelectionId?: number | null): void {
    this.loading = true;
    this.loadError = false;
    this.organigrammeService.getOrganigramme().subscribe({
      next: (data) => {
        this.roots = data ?? [];
        this.stats = this.computeStats(this.roots);
        this.expandAllList(this.roots);
        this.rebuildChart();
        if (keepSelectionId != null) {
          const found = this.findById(this.roots, keepSelectionId);
          this.selectedUnit = found;
          this.syncChartSelection();
        }
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.roots = [];
        this.chartData = [];
        this.stats = { totalUnites: 0, responsablesActifs: 0, postesOccupes: 0, postesVacants: 0 };
        this.loading = false;
        this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
      }
    });
  }

  private loadReferentials(): void {
    this.fonctionService.getAll(0, 1000).subscribe(res => {
      this.fonctions = (res.content || []).map(f => ({ label: f.libelle, value: f.id! }));
    });
    this.posteTravailService.getPostes().subscribe(res => {
      this.postesTravail = (res || []).map((p: any) => ({ label: p.designationObjet, value: p.id! }));
    });
  }

  refresh(): void {
    this.loadOrganigramme(this.selectedUnit?.id ?? null);
  }

  // ── Chart building ────────────────────────────────────
  private rebuildChart(): void {
    this.computeMatches();
    this.chartData = this.roots.map(r => this.toTreeNode(r));
    this.syncChartSelection();
  }

  private toTreeNode(node: OrganigrammeNode): TreeNode {
    const filterActive = this.hasActiveFilter();
    const isMatch = filterActive && this.matchIds.has(node.id);
    const isSelected = this.selectedUnit?.id === node.id;
    const classes = ['org-node', `org-node--${node.type?.toLowerCase()}`];
    if (isMatch) classes.push('is-match');
    if (isSelected) classes.push('is-selected');

    return {
      label: node.libelle,
      type: 'unit',
      expanded: filterActive ? (this.expandIds.has(node.id) || this.matchIds.has(node.id)) : true,
      data: node,
      styleClass: classes.join(' '),
      children: node.children.map(c => this.toTreeNode(c))
    };
  }

  private computeMatches(): void {
    this.matchIds.clear();
    this.expandIds.clear();
    if (!this.hasActiveFilter()) return;

    const walk = (node: OrganigrammeNode, ancestors: OrganigrammeNode[]): boolean => {
      const selfMatch = this.matchesFilters(node);
      let childMatch = false;
      for (const c of node.children) {
        childMatch = walk(c, [...ancestors, node]) || childMatch;
      }
      if (selfMatch) {
        this.matchIds.add(node.id);
        ancestors.forEach(a => this.expandIds.add(a.id));
      }
      if (childMatch) this.expandIds.add(node.id);
      return selfMatch || childMatch;
    };
    this.roots.forEach(r => walk(r, []));
  }

  private syncChartSelection(): void {
    if (!this.selectedUnit) { this.chartSelection = null; return; }
    this.chartSelection = this.findTreeNode(this.chartData, this.selectedUnit.id);
  }

  private findTreeNode(nodes: TreeNode[], id: number): TreeNode | null {
    for (const n of nodes) {
      if ((n.data as OrganigrammeNode)?.id === id) return n;
      if (n.children) {
        const found = this.findTreeNode(n.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  hasActiveFilter(): boolean {
    return this.typeFilter !== 'ALL' || !!this.searchQuery?.trim();
  }

  // ── View mode (Vue Liste / Vue Organigramme) ──────────
  setViewMode(mode: 'list' | 'chart'): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    if (mode === 'chart') {
      this.rebuildChart();
    } else if (this.selectedUnit) {
      this.expandAncestors(this.selectedUnit.id);
      this.scrollToSelected(this.selectedUnit.id);
    }
  }

  // ── Selection ─────────────────────────────────────────
  /** Clic sur un nœud du chart : bascule en Vue Liste, sélectionne et fait défiler jusqu'à l'unité. */
  onNodeSelect(event: { node: TreeNode }): void {
    const node = event.node?.data as OrganigrammeNode;
    if (!node) return;
    this.select(node);
    if (this.viewMode === 'chart') {
      this.viewMode = 'list';
      this.expandAncestors(node.id);
      this.scrollToSelected(node.id);
    }
  }

  /** Clic sur une ligne de l'arbre (Vue Liste). */
  selectFromList(node: OrganigrammeNode): void {
    this.select(node);
  }

  select(node: OrganigrammeNode | undefined | null): void {
    if (!node) return;
    this.selectedUnit = node;
    this.rebuildChart();
  }

  clearSelection(): void {
    this.selectedUnit = null;
    this.chartSelection = null;
    this.rebuildChart();
  }

  // ── List tree (expand / collapse / visibility) ────────
  private expandAllList(nodes: OrganigrammeNode[]): void {
    nodes.forEach(n => {
      this.listExpanded.add(n.id);
      this.expandAllList(n.children);
    });
  }

  isListExpanded(node: OrganigrammeNode): boolean {
    return this.listExpanded.has(node.id);
  }

  toggleNode(node: OrganigrammeNode, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.listExpanded.has(node.id)) this.listExpanded.delete(node.id);
    else this.listExpanded.add(node.id);
  }

  /** Un nœud est visible si lui-même ou un de ses descendants correspond au filtre. */
  isNodeVisible(node: OrganigrammeNode): boolean {
    if (this.matchesFilters(node)) return true;
    return node.children.some(c => this.isNodeVisible(c));
  }

  /** Le nœud correspond-il directement à la recherche / au filtre de type (pour le surlignage). */
  isMatch(node: OrganigrammeNode): boolean {
    return this.hasActiveFilter() && this.matchesFilters(node);
  }

  private expandAncestors(id: number): void {
    const acc: number[] = [];
    this.pathTo(this.roots, id, acc);
    acc.forEach(a => this.listExpanded.add(a));
  }

  private pathTo(nodes: OrganigrammeNode[], id: number, acc: number[]): boolean {
    for (const n of nodes) {
      if (n.id === id) return true;
      if (this.pathTo(n.children, id, acc)) { acc.push(n.id); return true; }
    }
    return false;
  }

  private scrollToSelected(id: number): void {
    setTimeout(() => {
      document.getElementById('org-tree-row-' + id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 90);
  }

  // ── Filtering ─────────────────────────────────────────
  setTypeFilter(t: TypeFilter): void {
    this.typeFilter = t;
    this.rebuildChart();
  }

  onSearchChange(): void {
    this.rebuildChart();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.rebuildChart();
  }

  private matchesFilters(node: OrganigrammeNode): boolean {
    const matchesType = this.typeFilter === 'ALL' || node.type === this.typeFilter;
    if (!matchesType) return false;
    const q = this.searchQuery?.trim().toLowerCase();
    if (!q) return true;
    return (
      (node.libelle ?? '').toLowerCase().includes(q) ||
      (node.code ?? '').toLowerCase().includes(q) ||
      (node.abreviation ?? '').toLowerCase().includes(q)
    );
  }

  // ── Zoom / pan ────────────────────────────────────────
  zoomIn(): void { this.zoom = Math.min(1.6, +(this.zoom + 0.15).toFixed(2)); }
  zoomOut(): void { this.zoom = Math.max(0.4, +(this.zoom - 0.15).toFixed(2)); }
  zoomReset(): void { this.zoom = 1; this.panX = 0; this.panY = 0; }

  onPanStart(event: MouseEvent): void {
    // Ignore drags that start on an interactive node card.
    if ((event.target as HTMLElement).closest('.org-node-card')) return;
    this.panning = true;
    this.panStartX = event.clientX - this.panX;
    this.panStartY = event.clientY - this.panY;
  }
  onPanMove(event: MouseEvent): void {
    if (!this.panning) return;
    this.panX = event.clientX - this.panStartX;
    this.panY = event.clientY - this.panStartY;
  }
  onPanEnd(): void { this.panning = false; }

  // ── Visual helpers ────────────────────────────────────
  typeIcon(type: TypeUniteStructurelle): string {
    if (type === TypeUniteStructurelle.DIRECTION) return 'pi pi-building';
    if (type === TypeUniteStructurelle.DIVISION) return 'pi pi-th-large';
    return 'pi pi-cog';
  }
  typeBadgeClass(type: TypeUniteStructurelle): string {
    if (type === TypeUniteStructurelle.DIRECTION) return 'badge badge-direction';
    if (type === TypeUniteStructurelle.DIVISION) return 'badge badge-division';
    return 'badge badge-service';
  }
  typeIconColorClass(type: TypeUniteStructurelle): string {
    if (type === TypeUniteStructurelle.DIRECTION) return 'icon-direction';
    if (type === TypeUniteStructurelle.DIVISION) return 'icon-division';
    return 'icon-service';
  }
  responsableBadgeClass(statut: StatutResponsable | undefined): string {
    return statut === 'ACTIF' ? 'pill pill-active' : 'pill pill-expired';
  }
  posteStatusClass(p: OrganigrammePoste): string {
    return p.statut === 'OCCUPE' ? 'pill pill-occupe' : 'pill pill-vacant';
  }
  nodeInitial(node: OrganigrammeNode): string {
    return (node.libelle || '?').charAt(0).toUpperCase();
  }

  // ── Counts ────────────────────────────────────────────
  countDirectChildren(node: OrganigrammeNode | null): number {
    return node?.children.length ?? 0;
  }
  countOccupes(node: OrganigrammeNode | null): number {
    return node?.postes.filter(p => p.statut === 'OCCUPE').length ?? 0;
  }
  countVacants(node: OrganigrammeNode | null): number {
    return node?.postes.filter(p => p.statut === 'VACANT').length ?? 0;
  }
  countAgents(node: OrganigrammeNode | null): number {
    if (!node) return 0;
    const local = node.postes.filter(p => p.statut === 'OCCUPE').length;
    return node.children.reduce((sum, c) => sum + this.countAgents(c), local);
  }
  parentLibelle(node: OrganigrammeNode | null): string {
    if (!node || node.parentId == null) return '—';
    const parent = this.findById(this.roots, node.parentId);
    return parent ? parent.libelle : '—';
  }

  // ════════════════════════════════════════════════════════
  //  UNIT dialog (create / edit / sub-unit)
  // ════════════════════════════════════════════════════════
  openAddUnit(parent: OrganigrammeNode | null): void {
    this.unitDialogMode = 'add';
    this.unitForm = this.emptyUniteForm();
    if (parent) {
      this.unitForm.parentId = parent.id;
      this.unitForm.type = this.childType(parent.type);
    }
    this.showUnitDialog = true;
  }

  openEditUnit(node: OrganigrammeNode): void {
    this.unitDialogMode = 'edit';
    this.unitForm = {
      id: node.id,
      code: node.code,
      abreviation: node.abreviation ?? '',
      libelle: node.libelle,
      type: node.type,
      parentId: node.parentId ?? null
    };
    this.showUnitDialog = true;
  }

  saveUnit(): void {
    if (!this.unitForm.code?.trim() || !this.unitForm.libelle?.trim() || !this.unitForm.type) {
      this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_REQUIRED');
      return;
    }
    const payload = {
      code: this.unitForm.code.trim(),
      abreviation: this.unitForm.abreviation?.trim() ?? '',
      libelle: this.unitForm.libelle.trim(),
      type: this.unitForm.type,
      parentId: this.unitForm.parentId
    };
    this.savingUnit = true;
    const req = this.unitDialogMode === 'add'
      ? this.uniteService.add(payload)
      : this.uniteService.update(this.unitForm.id!, payload);

    req.subscribe({
      next: (saved: any) => {
        this.savingUnit = false;
        this.showUnitDialog = false;
        this.toast('success', 'GLOBAL.SUCCES', this.unitDialogMode === 'add' ? 'GLOBAL.MESSAGE.SUCCES_ADD' : 'GLOBAL.MESSAGE.SUCCES_EDIT');
        const keep = this.unitDialogMode === 'edit' ? this.unitForm.id : (saved?.id ?? this.selectedUnit?.id);
        this.loadOrganigramme(keep);
      },
      error: (err) => {
        this.savingUnit = false;
        this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_SAVE', err?.error?.message);
      }
    });
  }

  confirmArchiveUnit(node: OrganigrammeNode): void {
    this.confirmationService.confirm({
      message: this.translate.instant('GESTION_ORGANISATIONELLE.ORGANIGRAMME.CONFIRM_ARCHIVE_UNIT', { libelle: node.libelle }),
      header: this.translate.instant('GESTION_ORGANISATIONELLE.ORGANIGRAMME.ACTION_ARCHIVE'),
      icon: 'pi pi-inbox',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-warning',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.uniteService.archive(node.id).subscribe({
        next: () => { this.toast('success', 'GLOBAL.SUCCES', 'GESTION_ORGANISATIONELLE.ORGANIGRAMME.MSG_ARCHIVED'); this.clearSelection(); this.loadOrganigramme(); },
        error: (err) => this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_SAVE', err?.error?.message)
      })
    });
  }

  confirmDeleteUnit(node: OrganigrammeNode): void {
    this.confirmationService.confirm({
      message: this.translate.instant('GESTION_ORGANISATIONELLE.ORGANIGRAMME.CONFIRM_DELETE_UNIT', { libelle: node.libelle }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.uniteService.delete(node.id).subscribe({
        next: () => { this.toast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE'); this.clearSelection(); this.loadOrganigramme(); },
        error: (err) => this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err?.error?.message)
      })
    });
  }

  // ════════════════════════════════════════════════════════
  //  RESPONSABLE dialog
  // ════════════════════════════════════════════════════════
  openResponsable(node: OrganigrammeNode): void {
    this.responsableForm = { uniteId: node.id, agentId: null, dateDebut: new Date() };
    this.agentsForUnite = [];
    this.responsableService.getAgentsByUnite(node.id).subscribe({
      next: (agents) => this.agentsForUnite = agents ?? [],
      error: () => this.agentsForUnite = []
    });
    this.showResponsableDialog = true;
  }

  saveResponsable(): void {
    if (!this.responsableForm.uniteId || !this.responsableForm.agentId || !this.responsableForm.dateDebut) {
      this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_REQUIRED');
      return;
    }
    this.savingResponsable = true;
    this.responsableService.create({
      uniteId: this.responsableForm.uniteId,
      agentId: this.responsableForm.agentId,
      dateDebut: this.toIso(this.responsableForm.dateDebut)!
    }).subscribe({
      next: () => {
        this.savingResponsable = false;
        this.showResponsableDialog = false;
        this.toast('success', 'GLOBAL.SUCCES', 'GESTION_ORGANISATIONELLE.ORGANIGRAMME.MSG_RESP_ASSIGNED');
        this.loadOrganigramme(this.responsableForm.uniteId);
      },
      error: (err) => {
        this.savingResponsable = false;
        this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_SAVE', err?.error?.message);
      }
    });
  }

  // ════════════════════════════════════════════════════════
  //  POSTE dialog (create / edit) + archive / delete
  // ════════════════════════════════════════════════════════
  openAddPoste(node: OrganigrammeNode): void {
    this.posteDialogMode = 'add';
    this.posteForm = this.emptyPosteForm();
    this.posteForm.uniteStructurelleId = node.id;
    this.showPosteDialog = true;
  }

  openEditPoste(poste: OrganigrammePoste, uniteId: number): void {
    // Fetch full poste to obtain fonction / poste-travail ids not present in the chart node.
    this.posteService.getById(poste.id).subscribe({
      next: (full) => {
        this.posteDialogMode = 'edit';
        this.posteForm = {
          id: full.id,
          codeCourt: full.codeCourt,
          libelleDuPoste: full.libelleDuPoste,
          dateCreation: this.fromIso(full.dateCreation),
          uniteStructurelleId: full.uniteStructurelleId ?? uniteId,
          fonctionId: full.fonctionId ?? null,
          posteTravailId: full.posteTravailId ?? null
        };
        this.showPosteDialog = true;
      },
      error: (err) => this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD', err?.error?.message)
    });
  }

  savePoste(): void {
    if (!this.posteForm.codeCourt?.trim() || !this.posteForm.libelleDuPoste?.trim()) {
      this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_REQUIRED');
      return;
    }
    const payload = {
      codeCourt: this.posteForm.codeCourt.trim(),
      libelleDuPoste: this.posteForm.libelleDuPoste.trim(),
      dateCreation: this.toIso(this.posteForm.dateCreation),
      uniteStructurelleId: this.posteForm.uniteStructurelleId,
      fonctionId: this.posteForm.fonctionId,
      posteTravailId: this.posteForm.posteTravailId
    };
    this.savingPoste = true;
    const req = this.posteDialogMode === 'add'
      ? this.posteService.create(payload)
      : this.posteService.update(this.posteForm.id!, payload);

    req.subscribe({
      next: () => {
        this.savingPoste = false;
        this.showPosteDialog = false;
        this.toast('success', 'GLOBAL.SUCCES', this.posteDialogMode === 'add' ? 'GLOBAL.MESSAGE.SUCCES_ADD' : 'GLOBAL.MESSAGE.SUCCES_EDIT');
        this.loadOrganigramme(this.posteForm.uniteStructurelleId ?? this.selectedUnit?.id);
      },
      error: (err) => {
        this.savingPoste = false;
        this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_SAVE', err?.error?.message);
      }
    });
  }

  confirmArchivePoste(poste: OrganigrammePoste): void {
    this.confirmationService.confirm({
      message: this.translate.instant('GESTION_ORGANISATIONELLE.ORGANIGRAMME.CONFIRM_ARCHIVE_POSTE', { libelle: poste.libelle }),
      header: this.translate.instant('GESTION_ORGANISATIONELLE.ORGANIGRAMME.ACTION_ARCHIVE'),
      icon: 'pi pi-inbox',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-warning',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.posteService.archive(poste.id).subscribe({
        next: () => { this.toast('success', 'GLOBAL.SUCCES', 'GESTION_ORGANISATIONELLE.ORGANIGRAMME.MSG_ARCHIVED'); this.loadOrganigramme(this.selectedUnit?.id); },
        error: (err) => this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_SAVE', err?.error?.message)
      })
    });
  }

  confirmDeletePoste(poste: OrganigrammePoste): void {
    this.confirmationService.confirm({
      message: this.translate.instant('GESTION_ORGANISATIONELLE.POSTES.CONFIRM_DELETE_MSG', { poste: poste.libelle }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.posteService.delete(poste.id).subscribe({
        next: () => { this.toast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE'); this.loadOrganigramme(this.selectedUnit?.id); },
        error: (err) => this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err?.error?.message)
      })
    });
  }

  // ════════════════════════════════════════════════════════
  //  AFFECTATION (assign / change agent on a poste)
  // ════════════════════════════════════════════════════════
  openAffecterAgent(poste: OrganigrammePoste): void {
    this.affectationMode = 'assign';
    this.currentAffectationId = null;
    this.affectationForm = { posteId: poste.id, agentId: null, date: new Date(), motif: '' };
    this.loadAvailableAgents();
    this.showAffectationDialog = true;
  }

  openChangerAgent(poste: OrganigrammePoste): void {
    this.affectationMode = 'change';
    this.affectationForm = { posteId: poste.id, agentId: null, date: new Date(), motif: '' };
    this.loadAvailableAgents();
    // Resolve the current active affectation so we can close it on save.
    this.affectationService.getByPoste(poste.id).subscribe({
      next: (list) => {
        const active = (list || []).find(a => a.statut === 'ACTIVE');
        this.currentAffectationId = active?.id ?? null;
      },
      error: () => this.currentAffectationId = null
    });
    this.showAffectationDialog = true;
  }

  private loadAvailableAgents(): void {
    this.availableAgents = [];
    this.affectationService.getAgents().subscribe({
      next: (agents) => this.availableAgents = agents ?? [],
      error: () => this.availableAgents = []
    });
  }

  saveAffectation(): void {
    if (!this.affectationForm.posteId || !this.affectationForm.agentId || !this.affectationForm.date) {
      this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_REQUIRED');
      return;
    }
    const dateIso = this.toIso(this.affectationForm.date)!;
    const create$ = this.affectationService.create({
      agentId: this.affectationForm.agentId,
      posteId: this.affectationForm.posteId,
      dateDebut: dateIso,
      motif: this.affectationForm.motif?.trim() || null
    });

    this.savingAffectation = true;

    if (this.affectationMode === 'change' && this.currentAffectationId != null) {
      // Close the current occupant the day before, then assign the new agent.
      this.affectationService.close(this.currentAffectationId, { dateFin: this.isoMinusOneDay(dateIso), motif: this.affectationForm.motif?.trim() || null })
        .pipe(switchMap(() => create$))
        .subscribe({
          next: () => this.afterAffectationSaved(),
          error: (err) => this.affectationError(err)
        });
    } else {
      create$.subscribe({
        next: () => this.afterAffectationSaved(),
        error: (err) => this.affectationError(err)
      });
    }
  }

  private afterAffectationSaved(): void {
    this.savingAffectation = false;
    this.showAffectationDialog = false;
    this.toast('success', 'GLOBAL.SUCCES', 'GESTION_ORGANISATIONELLE.ORGANIGRAMME.MSG_AGENT_ASSIGNED');
    this.loadOrganigramme(this.selectedUnit?.id);
  }
  private affectationError(err: any): void {
    this.savingAffectation = false;
    this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_SAVE', err?.error?.message);
  }

  confirmLibererPoste(poste: OrganigrammePoste): void {
    this.confirmationService.confirm({
      message: this.translate.instant('GESTION_ORGANISATIONELLE.ORGANIGRAMME.CONFIRM_RELEASE', { libelle: poste.libelle }),
      header: this.translate.instant('GESTION_ORGANISATIONELLE.ORGANIGRAMME.ACTION_RELEASE'),
      icon: 'pi pi-sign-out',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-warning',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.affectationService.getByPoste(poste.id).pipe(
          switchMap((list) => {
            const active = (list || []).find(a => a.statut === 'ACTIVE');
            if (!active?.id) return of(null);
            return this.affectationService.close(active.id, { dateFin: this.todayIso() });
          })
        ).subscribe({
          next: (res) => {
            if (res === null) { this.toast('warn', 'GLOBAL.ATTENTION', 'GESTION_ORGANISATIONELLE.ORGANIGRAMME.MSG_NO_ACTIVE'); return; }
            this.toast('success', 'GLOBAL.SUCCES', 'GESTION_ORGANISATIONELLE.ORGANIGRAMME.MSG_RELEASED');
            this.loadOrganigramme(this.selectedUnit?.id);
          },
          error: (err) => this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_SAVE', err?.error?.message)
        });
      }
    });
  }

  // ════════════════════════════════════════════════════════
  //  TRANSFER
  // ════════════════════════════════════════════════════════
  openTransfer(poste: OrganigrammePoste): void {
    this.transferForm = { agentId: null, fromPosteId: poste.id, toPosteId: null, dateTransfert: new Date(), motif: '' };
    this.availablePostes = [];
    // Resolve current occupant agentId + available target postes in parallel.
    forkJoin({
      affectations: this.affectationService.getByPoste(poste.id).pipe(catchError(() => of([]))),
      postes: this.affectationService.getPostes().pipe(catchError(() => of([] as PosteOption[])))
    }).subscribe(({ affectations, postes }) => {
      const active = (affectations || []).find(a => a.statut === 'ACTIVE');
      this.transferForm.agentId = active?.agentId ?? null;
      this.availablePostes = (postes || []).filter(p => p.id !== poste.id);
      this.showTransferDialog = true;
    });
  }

  saveTransfer(): void {
    if (!this.transferForm.agentId || !this.transferForm.fromPosteId || !this.transferForm.toPosteId || !this.transferForm.dateTransfert) {
      this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_REQUIRED');
      return;
    }
    this.savingTransfer = true;
    this.affectationService.transfer({
      agentId: this.transferForm.agentId,
      fromPosteId: this.transferForm.fromPosteId,
      toPosteId: this.transferForm.toPosteId,
      dateTransfert: this.toIso(this.transferForm.dateTransfert)!,
      motif: this.transferForm.motif?.trim() || null
    }).subscribe({
      next: () => {
        this.savingTransfer = false;
        this.showTransferDialog = false;
        this.toast('success', 'GLOBAL.SUCCES', 'GESTION_ORGANISATIONELLE.ORGANIGRAMME.MSG_TRANSFERRED');
        this.loadOrganigramme(this.selectedUnit?.id);
      },
      error: (err) => {
        this.savingTransfer = false;
        this.toast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_SAVE', err?.error?.message);
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────
  private emptyUniteForm(): UniteForm {
    return { id: null, code: '', abreviation: '', libelle: '', type: TypeUniteStructurelle.DIRECTION, parentId: null };
  }
  private emptyPosteForm(): PosteForm {
    return { id: null, codeCourt: '', libelleDuPoste: '', dateCreation: new Date(), uniteStructurelleId: null, fonctionId: null, posteTravailId: null };
  }

  private childType(parent: TypeUniteStructurelle): TypeUniteStructurelle {
    if (parent === TypeUniteStructurelle.DIRECTION) return TypeUniteStructurelle.DIVISION;
    return TypeUniteStructurelle.SERVICE;
  }

  private findById(nodes: OrganigrammeNode[], id: number): OrganigrammeNode | null {
    for (const n of nodes) {
      if (n.id === id) return n;
      const found = this.findById(n.children, id);
      if (found) return found;
    }
    return null;
  }

  private computeStats(nodes: OrganigrammeNode[]): SummaryStats {
    const acc: SummaryStats = { totalUnites: 0, responsablesActifs: 0, postesOccupes: 0, postesVacants: 0 };
    const walk = (n: OrganigrammeNode) => {
      acc.totalUnites += 1;
      if (n.responsable && n.responsable.statut === 'ACTIF') acc.responsablesActifs += 1;
      for (const p of n.postes) {
        if (p.statut === 'OCCUPE') acc.postesOccupes += 1;
        else acc.postesVacants += 1;
      }
      for (const c of n.children) walk(c);
    };
    nodes.forEach(walk);
    return acc;
  }

  private toIso(d: Date | null): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  private fromIso(v: any): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  private todayIso(): string {
    return this.toIso(new Date())!;
  }
  private isoMinusOneDay(iso: string): string {
    const d = new Date(iso);
    d.setDate(d.getDate() - 1);
    return this.toIso(d)!;
  }

  private toast(severity: string, summaryKey: string, detailKey: string, detailOverride?: string): void {
    this.messageService.add({
      severity,
      summary: this.translate.instant(summaryKey),
      detail: detailOverride || this.translate.instant(detailKey),
      icon: severity === 'success' ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle',
      life: severity === 'success' ? 3000 : 5000
    });
  }
}
