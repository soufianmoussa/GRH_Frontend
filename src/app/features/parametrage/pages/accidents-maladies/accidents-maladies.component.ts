import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { AccidentMaladie } from '../../../../models/AccidentMaladie.model';
import { AccidentMaladieService } from '../../services/accident-maladie/accident-maladie.service';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { PageResponse } from '../../../../models/PageResponse.model';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { AgentService } from '../../../dossier-agent/services/agent.service';

@Component({
  selector: 'app-accidents-maladies',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    TableModule,
    Button,
    Dialog,
    InputText,
    FormsModule,
    TooltipModule,
    ButtonDirective,
    DropdownModule,
    DatePicker,
    Textarea,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    NgIf,
    PrimeTemplate
  ],
  templateUrl: './accidents-maladies.component.html',
  styleUrl: './accidents-maladies.component.scss'
})
export class AccidentsMaladiesComponent implements OnInit {
  loading = false;
  accidents: any[] = [];
  agents: any[] = [];

  totalRecords = 0;
  pageSize = 5;
  currentPage = 0;

  searchGlobal = '';

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selected: AccidentMaladie | null = null;
  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  constructor(
    private service: AccidentMaladieService,
    private agentService: AgentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadAgents();
    this.loadPage(0, this.pageSize);
  }

  loadAgents() {
    this.agentService.getAll().subscribe({
      next: (res: any) => {
        this.agents = res || [];
      },
      error: (err) => console.error('Error loading agents:', err)
    });
  }

  applySearch() {
    this.loadPage(0, this.pageSize);
  }

  loadPage(page: number, size: number): void {
    this.currentPage = page;
    this.pageSize = size;
    this.loading = true;

    this.service.getAll(page, size, this.searchGlobal).subscribe({
      next: (res: PageResponse<AccidentMaladie>) => {
        this.accidents = res?.content ?? [];
        this.totalRecords = res?.totalElements ?? 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        ToastHelper.showLoadError(this.messageService);
      },
    });
  }

  onPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows);
    this.loadPage(page, event.rows);
  }

  refreshTable(): void {
    this.loadPage(this.currentPage, this.pageSize);
  }

  onView(item: AccidentMaladie): void {
    this.selected = item;
    this.displayView = true;
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.form = {};
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(item: AccidentMaladie): void {
    this.dialogMode = 'edit';
    this.form = {
      ...item,
      dateDebutArret: this.fromIsoDate(item.dateDebutArret),
      dateFinArret: this.fromIsoDate(item.dateFinArret),
      dateNotification: this.fromIsoDate(item.dateNotification),
      dateConseil: this.fromIsoDate(item.dateConseil),
      dateCommission: this.fromIsoDate(item.dateCommission),
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  save(): void {
    const f = this.form;
    if (!f.agentId || !f.categorieMaladie?.trim() || !f.dateDebutArret ||
      !f.dateFinArret || !f.dateNotification || !f.caracteristiqueArret?.trim() ||
      !f.numConseil?.trim() || !f.dateConseil || !f.dateCommission) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: any = {
      ...f,
      agentId: f.agentId,
      categorieMaladie: f.categorieMaladie.trim(),
      caracteristiqueArret: f.caracteristiqueArret.trim(),
      numConseil: f.numConseil.trim(),
      dateDebutArret: this.toIsoDate(f.dateDebutArret),
      dateFinArret: this.toIsoDate(f.dateFinArret),
      dateNotification: this.toIsoDate(f.dateNotification),
      dateConseil: this.toIsoDate(f.dateConseil),
      dateCommission: this.toIsoDate(f.dateCommission),
    };
    delete payload.matricule;

    if (this.dialogMode === 'add') {
      this.service.create(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showAdd(this.messageService);
          this.refreshTable();
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      this.service.update(f.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showEdit(this.messageService);
          this.refreshTable();
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  onDelete(item: AccidentMaladie): void {
    if (!item.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.service.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.refreshTable();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer l'arrêt de travail pour l'agent ${item.agentMatricule} ?`);
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d || !(d instanceof Date)) return d as any;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromIsoDate(v?: string | null): Date | null {
    if (!v) return null;
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? null : dt;
  }

  @ViewChild('dt') table!: Table;

  clearTable(table: Table): void {
    this.searchGlobal = '';
    table.clear();
    this.applySearch();
  }
}
