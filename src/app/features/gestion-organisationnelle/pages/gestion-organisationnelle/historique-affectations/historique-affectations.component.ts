import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { Toast } from 'primeng/toast';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AffectationAgentPosteService } from '../../../services/affectation-agent-poste.service';
import {
  AffectationAgentPosteDto
} from '../../../../../models/gestionOrganisationelle/affectation-agent-poste.model';
import { PageResponse } from '../../../../../models/PageResponse.model';

interface TimelineEvent {
  agentNom: string;
  agentPrenom: string;
  agentMatricule: string;
  dateDebut: string;
  dateFin: string | null;
  statut: string;
  motif: string | null;
  duration: string;
}

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
    PrimeTemplate,
    TranslateModule
  ],
  templateUrl: './historique-affectations.component.html',
  styleUrls: ['./historique-affectations.component.scss']
})
export class HistoriqueAffectationsComponent implements OnInit {

  loading = false;
  search = '';

  affectations: AffectationAgentPosteDto[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;

  stats = { total: 0, active: 0, cloturee: 0 };

  selectedRow: AffectationAgentPosteDto | null = null;
  timeline: TimelineEvent[] = [];
  timelineLoading = false;
  selectedPosteDetail: { libelle: string; codeCourt: string; unite: string } | null = null;

  constructor(
    private service: AffectationAgentPosteService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadPage(0, this.pageSize);
  }

  showToast(severity: string, summaryKey: string, detailKey: string, detailOverride?: string) {
    this.messageService.add({
      severity: severity,
      summary: this.translate.instant(summaryKey),
      detail: detailOverride || this.translate.instant(detailKey),
      icon: severity === 'success' ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle',
      life: severity === 'success' ? 3000 : 5000
    });
  }

  loadStats(): void {
    this.service.getStats().subscribe({
      next: (res) => this.stats = res,
      error: () => {}
    });
  }

  loadPage(page: number, size: number): void {
    this.currentPage = page;
    this.pageSize = size;
    this.loading = true;

    this.service.getAll(page, size, this.search).subscribe({
      next: (res: PageResponse<AffectationAgentPosteDto>) => {
        this.affectations = res?.content ?? [];
        this.totalRecords = res?.totalElements ?? 0;
        this.loading = false;
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GESTION_ORGANISATIONELLE.HISTORIQUE_AFFECTATIONS.ERR_LOAD_LIST');
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows);
    this.loadPage(page, event.rows);
  }

  applyFilters(): void {
    this.loadPage(0, this.pageSize);
  }

  clearFilters(): void {
    this.search = '';
    this.selectedRow = null;
    this.timeline = [];
    this.selectedPosteDetail = null;
    this.applyFilters();
  }

  onRowSelect(item: AffectationAgentPosteDto): void {
    this.selectedRow = item;
    this.selectedPosteDetail = {
      libelle: item.posteLibelle || '',
      codeCourt: item.posteCodeCourt || '',
      unite: item.uniteLibelle || ''
    };
    this.loadTimeline(item.posteId);
  }

  loadTimeline(posteId: number): void {
    this.timelineLoading = true;
    this.service.getByPoste(posteId).subscribe({
      next: (res) => {
        this.timeline = (res || []).map(a => ({
          agentNom: a.agentNom || '',
          agentPrenom: a.agentPrenom || '',
          agentMatricule: a.agentMatricule || '',
          dateDebut: a.dateDebut,
          dateFin: a.dateFin || null,
          statut: a.statut,
          motif: a.motif || null,
          duration: this.calcDuration(a.dateDebut, a.dateFin || null)
        }));
        this.timelineLoading = false;
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GESTION_ORGANISATIONELLE.HISTORIQUE_AFFECTATIONS.ERR_LOAD_TIMELINE');
        this.timelineLoading = false;
      }
    });
  }

  getStatutSeverity(statut: string): 'success' | 'danger' {
    return statut === 'ACTIVE' ? 'success' : 'danger';
  }

  getStatutLabel(statut: string): string {
    return statut === 'ACTIVE'
      ? this.translate.instant('GLOBAL.ACTIVE')
      : this.translate.instant('GLOBAL.CLOSED');
  }

  getTimelineColor(statut: string): string {
    return statut === 'ACTIVE' ? '#22c55e' : '#94a3b8';
  }

  getTimelineIcon(statut: string): string {
    return statut === 'ACTIVE' ? 'pi pi-check-circle' : 'pi pi-clock';
  }

  calcDuration(start: string, end: string | null): string {
    const d1 = new Date(start);
    const d2 = end ? new Date(end) : new Date();
    const diffMs = d2.getTime() - d1.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const t = (key: string) => this.translate.instant('GESTION_ORGANISATIONELLE.HISTORIQUE_AFFECTATIONS.DURATION.' + key);

    if (days < 30) return `${days} ${days > 1 ? t('DAYS') : t('DAY')}`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} ${t('MONTH')}`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const yStr = `${years} ${years > 1 ? t('YEARS') : t('YEAR')}`;
    if (remainingMonths === 0) return yStr;
    return `${yStr} ${t('AND')} ${remainingMonths} ${t('MONTH')}`;
  }

  getInitials(nom: string, prenom: string): string {
    return ((prenom?.charAt(0) || '') + (nom?.charAt(0) || '')).toUpperCase();
  }
}
