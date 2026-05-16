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
import { DropdownModule } from 'primeng/dropdown';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ResponsableUniteService } from '../../../services/AdminService/GestionOrganisationelle/responsable-unite.service';
import {
  ResponsableUniteDto,
  ResponsableUniteCreateUpdateRequest,
  UniteStructurelleOption,
  AgentOption
} from '../../../models/gestionOrganisationelle/responsable-unite.model';
import { PageResponse } from '../../../models/PageResponse.model';

type ResponsableForm = {
  id?: number;
  uniteId: number | null;
  agentId: number | null;
  dateDebut: Date | null;
  dateFin: Date | null;
};

@Component({
  selector: 'app-responsable-us',
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
    DropdownModule,
    Toast,
    ConfirmDialogModule,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    FloatLabelModule,
    TranslateModule
  ],
  templateUrl: './responsable-us.component.html',
  styleUrls: ['./responsable-us.component.scss']
})
export class ResponsableUsComponent implements OnInit {
  loading = false;
  search = '';

  activeTab = '0';
  readonly tabTypes = ['DIRECTION', 'DIVISION', 'SERVICE'] as const;

  responsables: ResponsableUniteDto[] = [];
  totalRecords = 0;
  pageSize = 5;
  currentPage = 0;

  allUnites: UniteStructurelleOption[] = [];
  filteredUnites: UniteStructurelleOption[] = [];
  agents: AgentOption[] = [];

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selected: ResponsableUniteDto | null = null;
  form: ResponsableForm = this.emptyForm();

  @ViewChild('addForm') addForm?: NgForm;

  constructor(
    private service: ResponsableUniteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

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

  get activeTypeUnite(): string {
    return this.tabTypes[+this.activeTab];
  }

  loadDropdowns(): void {
    this.service.getUnites().subscribe({
      next: (res) => {
        this.allUnites = res || [];
        this.filterUnitesByTab();
      },
      error: () => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD')
    });
  }

  filterUnitesByTab(): void {
    this.filteredUnites = this.allUnites.filter(u => u.type === this.activeTypeUnite);
  }

  onTabChange(index: string): void {
    this.activeTab = index;
    this.search = '';
    this.currentPage = 0;
    this.filterUnitesByTab();
    this.loadPage(0, this.pageSize);
  }

  loadPage(page: number, size: number): void {
    this.currentPage = page;
    this.pageSize = size;
    this.loading = true;

    this.service.getAll(page, size, this.search, this.activeTypeUnite).subscribe({
      next: (res: PageResponse<ResponsableUniteDto>) => {
        this.responsables = res?.content ?? [];
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

  onView(item: ResponsableUniteDto): void {
    this.selected = item;
    this.displayView = true;
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.form = this.emptyForm();
    this.agents = []; // Clear agents until an unit is selected
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(item: ResponsableUniteDto): void {
    this.dialogMode = 'edit';
    this.form = {
      id: item.id,
      uniteId: item.uniteId,
      agentId: item.agentId,
      dateDebut: this.fromIsoDate(item.dateDebut),
      dateFin: this.fromIsoDate(item.dateFin)
    };
    if (item.uniteId) {
       this.fetchAgentsByUnite(item.uniteId);
    }
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onUniteChange(uniteId: number): void {
    this.form.agentId = null;
    this.agents = [];
    if (uniteId) {
      this.fetchAgentsByUnite(uniteId);
    }
  }

  private fetchAgentsByUnite(uniteId: number): void {
    this.service.getAgentsByUnite(uniteId).subscribe({
      next: (res) => this.agents = res || [],
      error: () => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD')
    });
  }

  save(): void {
    if (this.addForm?.invalid) {
      this.addForm.form.markAllAsTouched();
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.REQUIRED_FIELDS');
      return;
    }

    if (!this.form.uniteId || !this.form.agentId || !this.form.dateDebut) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.REQUIRED_FIELDS');
      return;
    }

    const payload: ResponsableUniteCreateUpdateRequest = {
      uniteId: this.form.uniteId,
      agentId: this.form.agentId,
      dateDebut: this.toIsoDate(this.form.dateDebut)!,
      dateFin: this.toIsoDate(this.form.dateFin)
    };

    this.loading = true;

    if (this.dialogMode === 'add') {
      this.service.create(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.refreshTable();
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err.error?.message);
          this.loading = false;
        }
      });
    } else {
      if (!this.form.id) return;
      this.service.update(this.form.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.refreshTable();
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err.error?.message);
          this.loading = false;
        }
      });
    }
  }

  onDelete(item: ResponsableUniteDto): void {
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
            this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err.error?.message);
            this.loading = false;
          }
        });
      }
    });
  }

  getTabLabel(): string {
    const g = 'GESTION_ORGANISATIONELLE.GLOBAL.';
    switch (this.activeTypeUnite) {
      case 'DIRECTION': return this.translate.instant(g + 'DIRECTIONS');
      case 'DIVISION': return this.translate.instant(g + 'DIVISIONS');
      case 'SERVICE': return this.translate.instant(g + 'SERVICES');
      default: return '';
    }
  }

  private emptyForm(): ResponsableForm {
    return {
      id: undefined,
      uniteId: null,
      agentId: null,
      dateDebut: null,
      dateFin: null
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
