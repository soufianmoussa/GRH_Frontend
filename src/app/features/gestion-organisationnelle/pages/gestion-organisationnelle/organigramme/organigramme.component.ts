import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ToastHelper } from '../../../../../shared/utils/toast-helper';
import { TypeUniteStructurelle } from '../../../../../enums/type-unite-structurelle.enum';
import { OrganigrammeService } from '../../../services/organigramme.service';
import {
  OrganigrammeNode,
  OrganigrammePoste,
  StatutResponsable
} from '../../../../../models/gestionOrganisationelle/organigramme.model';

type TypeFilter = 'ALL' | TypeUniteStructurelle;

interface SummaryStats {
  totalUnites: number;
  responsablesActifs: number;
  postesOccupes: number;
  postesVacants: number;
}

@Component({
  selector: 'app-organigramme',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    InputText,
    Toast,
    ProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './organigramme.component.html',
  styleUrls: ['./organigramme.component.scss']
})
export class OrganigrammeComponent implements OnInit {

  loading = false;
  loadError = false;

  roots: OrganigrammeNode[] = [];

  searchQuery = '';
  typeFilter: TypeFilter = 'ALL';

  selectedUnit: OrganigrammeNode | null = null;
  expanded = new Set<number>();

  readonly typeFilters: { key: TypeFilter; labelKey: string }[] = [
    { key: 'ALL', labelKey: 'GESTION_ORGANISATIONELLE.ORGANIGRAMME.FILTER_ALL' },
    { key: TypeUniteStructurelle.DIRECTION, labelKey: 'GLOBAL.DIRECTION' },
    { key: TypeUniteStructurelle.DIVISION, labelKey: 'GLOBAL.DIVISION' },
    { key: TypeUniteStructurelle.SERVICE, labelKey: 'GLOBAL.SERVICE' }
  ];

  stats: SummaryStats = {
    totalUnites: 0,
    responsablesActifs: 0,
    postesOccupes: 0,
    postesVacants: 0
  };

  constructor(
    private organigrammeService: OrganigrammeService,
    private messageService: MessageService,
    private router: Router,
    private translate: TranslateService
  ) {}

  showToast(severity: string, summaryKey: string, detailKey: string) {
    this.messageService.add({
      severity: severity,
      summary: this.translate.instant(summaryKey),
      detail: this.translate.instant(detailKey),
      icon: severity === 'success' ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle',
      life: severity === 'success' ? 3000 : 5000
    });
  }

  ngOnInit(): void {
    this.loadOrganigramme();
  }

  loadOrganigramme(): void {
    this.loading = true;
    this.loadError = false;
    this.organigrammeService.getOrganigramme().subscribe({
      next: (data) => {
        this.roots = data ?? [];
        this.stats = this.computeStats(this.roots);
        this.expandRootsByDefault(this.roots);
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.roots = [];
        this.stats = { totalUnites: 0, responsablesActifs: 0, postesOccupes: 0, postesVacants: 0 };
        this.loading = false;
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
      }
    });
  }

  refresh(): void {
    this.selectedUnit = null;
    this.loadOrganigramme();
  }

  // ---------- Tree state ----------

  toggle(node: OrganigrammeNode, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.expanded.has(node.id)) this.expanded.delete(node.id);
    else this.expanded.add(node.id);
  }

  isExpanded(node: OrganigrammeNode): boolean {
    return this.expanded.has(node.id);
  }

  select(node: OrganigrammeNode): void {
    this.selectedUnit = node;
    if (node.children.length > 0) {
      this.expanded.add(node.id);
    }
  }

  clearSelection(): void {
    this.selectedUnit = null;
  }

  // ---------- Filtering ----------

  setTypeFilter(t: TypeFilter): void {
    this.typeFilter = t;
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  /** Returns true if this node (or any of its descendants) matches the active search/type filter. */
  isNodeVisible(node: OrganigrammeNode): boolean {
    if (this.matchesFilters(node)) return true;
    return node.children.some((c) => this.isNodeVisible(c));
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

  // ---------- Visual helpers ----------

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

  // ---------- Counts for the detail panel ----------

  countDirectChildren(node: OrganigrammeNode | null): number {
    return node?.children.length ?? 0;
  }

  countAgents(node: OrganigrammeNode | null): number {
    if (!node) return 0;
    const local = node.postes.filter((p) => p.statut === 'OCCUPE').length;
    return node.children.reduce((sum, c) => sum + this.countAgents(c), local);
  }

  parentLibelle(node: OrganigrammeNode | null): string {
    if (!node || node.parentId == null) return '—';
    const parent = this.findById(this.roots, node.parentId);
    return parent ? parent.libelle : '—';
  }

  // ---------- Actions ----------

  goToFiche(node: OrganigrammeNode | null): void {
    if (!node) return;
    // Existing list page; the dedicated unit-detail page is not yet wired here.
    this.router.navigate(['/UniteStructurelle']);
  }

  goToAjouterPoste(node: OrganigrammeNode | null): void {
    if (!node) return;
    this.router.navigate(['/Postes/ajouter']);
  }

  goToAffecterResponsable(node: OrganigrammeNode | null): void {
    if (!node) return;
    this.router.navigate(['/ResponsableUs']);
  }

  goToModifier(node: OrganigrammeNode | null): void {
    if (!node) return;
    // TODO: open the edit dialog directly when a deep-link to the unit form becomes available.
    this.router.navigate(['/UniteStructurelle']);
  }

  // ---------- Internals ----------

  private computeStats(nodes: OrganigrammeNode[]): SummaryStats {
    const acc: SummaryStats = {
      totalUnites: 0,
      responsablesActifs: 0,
      postesOccupes: 0,
      postesVacants: 0
    };
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

  private expandRootsByDefault(nodes: OrganigrammeNode[]): void {
    nodes.forEach((n) => this.expanded.add(n.id));
  }

  private findById(nodes: OrganigrammeNode[], id: number): OrganigrammeNode | null {
    for (const n of nodes) {
      if (n.id === id) return n;
      const found = this.findById(n.children, id);
      if (found) return found;
    }
    return null;
  }
}
