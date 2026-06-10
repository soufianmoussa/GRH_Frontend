import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { Toast } from 'primeng/toast';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { PanelModule } from 'primeng/panel';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { HistoriqueAffectationService } from '../../../services/historique-affectation.service';
import { PosteService } from '../../../services/poste.service';
import { ResponsableUniteService } from '../../../services/responsable-unite.service';
import { AgentService } from '../../../../dossier-agent/services/agent.service';

import {
  AuditCenterStats,
  HistoriqueAffectationDto,
  HistoriqueAffectationFilters,
  HistoriqueAffectationTimelineDto,
  MouvementType
} from '../../../../../models/gestionOrganisationelle/historique-affectation.model';
import { StatutAffectation } from '../../../../../models/gestionOrganisationelle/affectation-agent-poste.model';
import { Poste } from '../../../../../models/gestionOrganisationelle/poste.model';
import { AgentModel } from '../../../../../models/Agent.model';
import { UniteStructurelleOption } from '../../../../../models/gestionOrganisationelle/responsable-unite.model';
import { PageResponse } from '../../../../../models/PageResponse.model';

type QuickRange = 'today' | 'week' | 'month' | 'year' | null;

interface FilterFormState {
  global: string;
  agentId: number | null;
  matricule: string;
  uniteId: number | null;
  posteId: number | null;
  type: MouvementType | null;
  statut: StatutAffectation | null;
  performedBy: string;
  dateEffetFrom: Date | null;
  dateEffetTo: Date | null;
}

interface OptionItem<T = string> { label: string; value: T; }

@Component({
  selector: 'app-historique-affectations',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    InputText,
    TooltipModule,
    TagModule,
    TimelineModule,
    Toast,
    Select,
    DatePicker,
    PanelModule,
    PrimeTemplate,
    TranslateModule
  ],
  templateUrl: './historique-affectations.component.html',
  styleUrls: ['./historique-affectations.component.scss']
})
export class HistoriqueAffectationsComponent implements OnInit {

  loading = false;
  exporting = false;
  timelineLoading = false;

  rows: HistoriqueAffectationDto[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;

  stats: AuditCenterStats = {
    totalMouvements: 0,
    affectationsActives: 0,
    transferts: 0,
    postesLiberes: 0,
    affectationsCloturees: 0
  };

  selectedRow: HistoriqueAffectationDto | null = null;
  agentTimeline: HistoriqueAffectationTimelineDto[] = [];

  filters: FilterFormState = this.emptyFilters();
  activeQuickRange: QuickRange = null;

  agents: AgentModel[] = [];
  postes: Poste[] = [];
  unites: UniteStructurelleOption[] = [];

  agentOptions: OptionItem<number>[] = [];
  posteOptions: OptionItem<number>[] = [];
  uniteOptions: OptionItem<number>[] = [];
  typeOptions: OptionItem<MouvementType>[] = [];
  statutOptions: OptionItem<StatutAffectation>[] = [];

  constructor(
    private historiqueService: HistoriqueAffectationService,
    private agentService: AgentService,
    private posteService: PosteService,
    private uniteService: ResponsableUniteService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.buildEnumOptions();
    this.translate.onLangChange.subscribe(() => this.buildEnumOptions());
    this.loadFilterReferentials();
    this.loadStats();
  }

  // ---------------------------------------------------------------------------
  // Filter referentials + enum option labels
  // ---------------------------------------------------------------------------

  private buildEnumOptions(): void {
    const t = (key: string) => this.translate.instant(key);
    this.typeOptions = [
      { label: t('GESTION_ORGANISATIONELLE.HISTORIQUE_AFFECTATIONS.TYPE.CREATION'), value: 'CREATION' },
      { label: t('GESTION_ORGANISATIONELLE.HISTORIQUE_AFFECTATIONS.TYPE.TRANSFERT'), value: 'TRANSFERT' },
      { label: t('GESTION_ORGANISATIONELLE.HISTORIQUE_AFFECTATIONS.TYPE.CLOTURE'), value: 'CLOTURE' }
    ];
    this.statutOptions = [
      { label: t('GLOBAL.ACTIVE'), value: 'ACTIVE' },
      { label: t('GLOBAL.CLOSED'), value: 'CLOTUREE' }
    ];
  }

  private loadFilterReferentials(): void {
    this.agentService.getAll().subscribe({
      next: (list) => {
        this.agents = list || [];
        this.agentOptions = this.agents
          .filter(a => a.id != null)
          .map(a => ({
            label: `${a.prenom ?? ''} ${a.nom ?? ''} (${a.matricule ?? ''})`.trim(),
            value: a.id as number
          }));
      },
      error: () => { /* silent — filters degrade gracefully */ }
    });

    this.posteService.getAllNoPagination().subscribe({
      next: (list) => {
        this.postes = list || [];
        this.posteOptions = this.postes.map(p => ({
          label: `${p.libelleDuPoste} (${p.codeCourt})`,
          value: p.id
        }));
      },
      error: () => {}
    });

    this.uniteService.getUnites().subscribe({
      next: (list) => {
        this.unites = list || [];
        this.uniteOptions = this.unites.map(u => ({ label: u.libelle, value: u.id }));
      },
      error: () => {}
    });
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  loadStats(): void {
    this.historiqueService.getStats(this.toBackendFilters()).subscribe({
      next: (res) => this.stats = res,
      error: () => { /* keep last known stats */ }
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize;
    this.pageSize = rows;
    this.currentPage = Math.floor(first / rows);
    this.loadPage();
  }

  loadPage(): void {
    this.loading = true;
    const backendFilters = this.toBackendFilters();

    this.historiqueService.search(this.currentPage, this.pageSize, backendFilters).subscribe({
      next: (res: PageResponse<HistoriqueAffectationDto>) => {
        this.rows = res?.content ?? [];
        this.totalRecords = res?.totalElements ?? 0;
        this.loading = false;
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GESTION_ORGANISATIONELLE.HISTORIQUE_AFFECTATIONS.ERR_LOAD_LIST');
        this.loading = false;
        this.rows = [];
        this.totalRecords = 0;
      }
    });

    this.loadStats();
  }

  // ---------------------------------------------------------------------------
  // Filter actions
  // ---------------------------------------------------------------------------

  applyFilters(): void {
    this.currentPage = 0;
    this.selectedRow = null;
    this.agentTimeline = [];
    this.loadPage();
  }

  clearFilters(): void {
    this.filters = this.emptyFilters();
    this.activeQuickRange = null;
    this.selectedRow = null;
    this.agentTimeline = [];
    this.applyFilters();
  }

  applyQuickRange(range: Exclude<QuickRange, null>): void {
    if (this.activeQuickRange === range) {
      this.activeQuickRange = null;
      this.filters.dateEffetFrom = null;
      this.filters.dateEffetTo = null;
    } else {
      const [from, to] = this.computeRange(range);
      this.activeQuickRange = range;
      this.filters.dateEffetFrom = from;
      this.filters.dateEffetTo = to;
    }
    this.applyFilters();
  }

  // ---------------------------------------------------------------------------
  // Row selection + agent timeline
  // ---------------------------------------------------------------------------

  onRowSelect(row: HistoriqueAffectationDto): void {
    this.selectedRow = row;
    if (row?.agentId) {
      this.loadAgentTimeline(row.agentId);
    } else {
      this.agentTimeline = [];
    }
  }

  private loadAgentTimeline(agentId: number): void {
    this.timelineLoading = true;
    this.historiqueService.getAgentTimeline(agentId).subscribe({
      next: (events) => {
        this.agentTimeline = events || [];
        this.timelineLoading = false;
      },
      error: () => {
        this.timelineLoading = false;
        this.showToast('error', 'GLOBAL.ERREUR', 'GESTION_ORGANISATIONELLE.HISTORIQUE_AFFECTATIONS.ERR_LOAD_TIMELINE');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  exportExcel(): void {
    this.exporting = true;
    this.historiqueService.exportExcel(this.toBackendFilters()).subscribe({
      next: (blob) => {
        this.exporting = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-affectations.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exporting = false;
        this.showToast('error', 'GLOBAL.ERREUR', 'GESTION_ORGANISATIONELLE.HISTORIQUE_AFFECTATIONS.ERR_EXPORT');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Presentation helpers
  // ---------------------------------------------------------------------------

  getTypeSeverity(type?: MouvementType | null): 'info' | 'warn' | 'danger' | 'secondary' {
    switch (type) {
      case 'CREATION': return 'info';
      case 'TRANSFERT': return 'warn';
      case 'CLOTURE': return 'danger';
      default: return 'secondary';
    }
  }

  getTypeIcon(type?: MouvementType | null): string {
    switch (type) {
      case 'CREATION': return 'pi pi-plus-circle';
      case 'TRANSFERT': return 'pi pi-arrow-right-arrow-left';
      case 'CLOTURE': return 'pi pi-times-circle';
      default: return 'pi pi-circle';
    }
  }

  getTypeLabel(type?: MouvementType | null): string {
    if (!type) return '—';
    return this.translate.instant('GESTION_ORGANISATIONELLE.HISTORIQUE_AFFECTATIONS.TYPE.' + type);
  }

  getStatutSeverity(statut?: StatutAffectation | null): 'success' | 'danger' {
    return statut === 'ACTIVE' ? 'success' : 'danger';
  }

  getStatutLabel(statut?: StatutAffectation | null): string {
    return statut === 'ACTIVE'
      ? this.translate.instant('GLOBAL.ACTIVE')
      : this.translate.instant('GLOBAL.CLOSED');
  }

  getInitials(nom?: string, prenom?: string): string {
    return ((prenom?.charAt(0) ?? '') + (nom?.charAt(0) ?? '')).toUpperCase();
  }

  agentFullName(row?: HistoriqueAffectationDto | null): string {
    if (!row) return '';
    const parts = [row.agentPrenom, row.agentNom].filter(Boolean);
    return parts.length ? parts.join(' ') : (row.matricule ?? '');
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private emptyFilters(): FilterFormState {
    return {
      global: '',
      agentId: null,
      matricule: '',
      uniteId: null,
      posteId: null,
      type: null,
      statut: null,
      performedBy: '',
      dateEffetFrom: null,
      dateEffetTo: null
    };
  }

  private toBackendFilters(): HistoriqueAffectationFilters {
    const f = this.filters;
    return {
      global: f.global?.trim() || undefined,
      agentId: f.agentId ?? undefined,
      matricule: f.matricule?.trim() || undefined,
      uniteId: f.uniteId ?? undefined,
      posteId: f.posteId ?? undefined,
      type: f.type ?? undefined,
      statut: f.statut ?? undefined,
      performedBy: f.performedBy?.trim() || undefined,
      dateEffetFrom: this.toIsoDate(f.dateEffetFrom),
      dateEffetTo: this.toIsoDate(f.dateEffetTo)
    };
  }

  private toIsoDate(d: Date | null): string | undefined {
    if (!d) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private computeRange(range: Exclude<QuickRange, null>): [Date, Date] {
    const now = new Date();
    const start = new Date(now);
    switch (range) {
      case 'today':
        break;
      case 'week': {
        const dow = (now.getDay() + 6) % 7; // Monday-first
        start.setDate(now.getDate() - dow);
        break;
      }
      case 'month':
        start.setDate(1);
        break;
      case 'year':
        start.setMonth(0, 1);
        break;
    }
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(0, 0, 0, 0);
    return [start, end];
  }

  private showToast(severity: 'success' | 'error' | 'info' | 'warn', summaryKey: string, detailKey: string): void {
    this.messageService.add({
      severity,
      summary: this.translate.instant(summaryKey),
      detail: this.translate.instant(detailKey),
      icon: severity === 'success' ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle',
      life: severity === 'success' ? 3000 : 5000
    });
  }
}
