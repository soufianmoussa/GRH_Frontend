import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule, NgForm } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { InputTextarea } from 'primeng/inputtextarea';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { AffectationAgentPosteService } from '../../../services/AdminService/GestionOrganisationelle/affectation-agent-poste.service';
import {
  AffectationAgentPosteDto,
  AffectationAgentPosteCreateRequest,
  AffectationAgentPosteUpdateRequest,
  PosteOption
} from '../../../models/gestionOrganisationelle/affectation-agent-poste.model';
import { AgentOption } from '../../../models/gestionOrganisationelle/responsable-unite.model';
import { PageResponse } from '../../../models/PageResponse.model';

type AffectationForm = {
  id?: number;
  agentId: number | null;
  posteId: number | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  motif: string;
};

@Component({
  selector: 'app-affectation-agent-poste',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    TableModule,
    Button,
    ButtonDirective,
    Dialog,
    InputText,
    TooltipModule,
    FormsModule,
    NgIf,
    PrimeTemplate,
    DatePicker,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    FloatLabelModule,
    DropdownModule,
    TagModule,
    InputTextarea,
    Toast,
    ConfirmDialogModule,
    TranslateModule
  ],
  templateUrl: './affectation-agent-poste.component.html',
  styleUrls: ['./affectation-agent-poste.component.scss']
})
export class AffectationAgentPosteComponent implements OnInit {
  loading = false;
  search = '';

  affectations: AffectationAgentPosteDto[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;

  postes: PosteOption[] = [];
  agents: AgentOption[] = [];

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selected: AffectationAgentPosteDto | null = null;
  form: AffectationForm = this.emptyForm();

  @ViewChild('addForm') addForm?: NgForm;

  constructor(
    private service: AffectationAgentPosteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();
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

  loadDropdowns(): void {
    this.service.getPostes().subscribe({
      next: (res) => this.postes = res || [],
      error: () => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD')
    });

    this.service.getAgents().subscribe({
      next: (res) => this.agents = res || [],
      error: () => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD')
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
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows);
    const size = event.rows;
    this.loadPage(page, size);
  }

  refreshTable(): void {
    this.loadPage(this.currentPage, this.pageSize);
  }

  applySearch(): void {
    this.loadPage(0, this.pageSize);
  }

  clearTable(table: Table): void {
    table.clear();
    this.search = '';
    this.applySearch();
  }

  onView(item: AffectationAgentPosteDto): void {
    this.selected = item;
    this.displayView = true;
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.form = this.emptyForm();
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(item: AffectationAgentPosteDto): void {
    this.dialogMode = 'edit';
    this.form = {
      id: item.id,
      agentId: item.agentId,
      posteId: item.posteId,
      dateDebut: this.fromIsoDate(item.dateDebut),
      dateFin: this.fromIsoDate(item.dateFin),
      motif: item.motif || ''
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  save(): void {
    if (this.addForm?.invalid) {
      this.addForm.form.markAllAsTouched();
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }

    if (!this.form.agentId || !this.form.posteId || !this.form.dateDebut) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }

    this.loading = true;

    if (this.dialogMode === 'add') {
      const payload: AffectationAgentPosteCreateRequest = {
        agentId: this.form.agentId,
        posteId: this.form.posteId,
        dateDebut: this.toIsoDate(this.form.dateDebut)!,
        dateFin: this.toIsoDate(this.form.dateFin),
        motif: this.form.motif || null
      };

      this.service.create(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.refreshTable();
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err?.error?.message);
          this.loading = false;
        }
      });
    } else {
      if (!this.form.id) return;

      const payload: AffectationAgentPosteUpdateRequest = {
        dateDebut: this.toIsoDate(this.form.dateDebut)!,
        dateFin: this.toIsoDate(this.form.dateFin),
        motif: this.form.motif || null
      };

      this.service.update(this.form.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.refreshTable();
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err?.error?.message);
          this.loading = false;
        }
      });
    }
  }

  onClose(item: AffectationAgentPosteDto): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant('GESTION_ORGANISATIONELLE.AFFECTATION_AGENT_POSTE.CONFIRM_CLOSE_MSG', { agent: `${item.agentNom} ${item.agentPrenom}`, poste: item.posteLibelle }),
      header: this.translate.instant('GESTION_ORGANISATIONELLE.AFFECTATION_AGENT_POSTE.CONFIRM_CLOSE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loading = true;
        const today = new Date();
        const dateFin = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        this.service.close(item.id!, { dateFin }).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GESTION_ORGANISATIONELLE.AFFECTATION_AGENT_POSTE.SUCCESS_CLOSE');
            this.refreshTable();
          },
          error: (err) => {
            this.showToast('error', 'GLOBAL.ERREUR', 'GESTION_ORGANISATIONELLE.AFFECTATION_AGENT_POSTE.ERR_CLOSE', err?.error?.message);
            this.loading = false;
          }
        });
      }
    });
  }

  onDelete(item: AffectationAgentPosteDto): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant('GLOBAL.CONFIRM.DELETE_MSG'),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loading = true;
        this.service.delete(item.id!).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.refreshTable();
          },
          error: (err: any) => {
            this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err?.error?.message);
            this.loading = false;
          }
        });
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

  private emptyForm(): AffectationForm {
    return {
      id: undefined,
      agentId: null,
      posteId: null,
      dateDebut: null,
      dateFin: null,
      motif: ''
    };
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromIsoDate(value: any): Date | null {
    if (!value) return null;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
