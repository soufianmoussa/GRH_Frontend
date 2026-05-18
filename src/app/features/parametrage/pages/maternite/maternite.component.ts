import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Select } from 'primeng/select';
import {CategorieNaissance, CongeMaternite} from '../../../../models/congeMaternite.model';
import {PageResponse} from '../../../../models/PageResponse.model';
import {CongeMaterniteService} from '../../services/conge-maternite/conge-maternite.service';
import { AgentModel } from '../../../../models/Agent.model';
import { AgentService } from '../../../dossier-agent/services/agent.service';
import { DatePicker } from 'primeng/datepicker';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

type CongeMaterniteForm = {
  id?: number;
  agentId: number | null;

  dateDebut: Date | null;
  dateFin: Date | null;

  dateDeclarationEmployeur: Date | null;
  dateAccouchementPrevue: Date | null;
  dateAccouchementEffective: Date | null;
  dateDeclarationAutorite: Date | null;

  categorieNaissance: CategorieNaissance | null;
};

@Component({
  selector: 'app-maternite',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    TableModule,
    Button,
    Dialog,
    InputText,
    FormsModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ButtonDirective,
    Select,
    DatePicker,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    TooltipModule,
    PrimeTemplate
  ],
  templateUrl: './maternite.component.html',
  styleUrl: './maternite.component.scss'
})
export class MaterniteComponent implements OnInit {
  loading = false;
  agents: AgentModel[] = [];

  maternites: CongeMaternite[] = [];

  searchValue = '';

  displayView = false;
  selected: CongeMaternite | null = null;

  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  form: CongeMaterniteForm = this.emptyForm();
  @ViewChild('addForm') addForm?: NgForm;

  categories = [
    { label: 'Normale', value: 'NORMALE' },
    { label: 'Césarienne', value: 'CESARIENNE' },
    { label: 'Multiple', value: 'MULTIPLE' },
    { label: 'Prématurée', value: 'PREMATUREE' }
  ];

  constructor(
    private service: CongeMaterniteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private agentService: AgentService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadAgents();
  }

  loadAgents(): void {
    this.agentService.getAll().subscribe({
      next: (res: AgentModel[]) => this.agents = res || [],
      error: (err: any) => console.error('Erreur load agents', err)
    });
  }

  loadData(): void {
    this.loading = true;
    this.service.getAll(0, 1000, '').subscribe({
      next: (res: PageResponse<CongeMaternite>) => {
        this.maternites = res?.content ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur load maternites', err);
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      }
    });
  }

  refreshTable(): void {
    this.loadData();
  }

  applySearch(): void {
    this.loadData();
  }

  clearTable(table: Table): void {
    table.clear();
    this.searchValue = '';
    this.applySearch();
  }

  onView(item: CongeMaternite): void {
    this.selected = {
      ...item,
      dateDebut: this.fromIso(item.dateDebut) as any,
      dateFin: this.fromIso(item.dateFin) as any,
      dateDeclarationEmployeur: this.fromIso(item.dateDeclarationEmployeur) as any,
      dateAccouchementPrevue: this.fromIso(item.dateAccouchementPrevue) as any,
      dateAccouchementEffective: this.fromIso(item.dateAccouchementEffective) as any,
      dateDeclarationAutorite: this.fromIso(item.dateDeclarationAutorite) as any
    };
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

  onEdit(item: CongeMaternite): void {
    this.dialogMode = 'edit';
    this.form = {
      id: item.id,
      agentId: item.agentId || null,
      dateDebut: this.fromIso(item.dateDebut),
      dateFin: this.fromIso(item.dateFin),
      dateDeclarationEmployeur: this.fromIso(item.dateDeclarationEmployeur),
      dateAccouchementPrevue: this.fromIso(item.dateAccouchementPrevue),
      dateAccouchementEffective: this.fromIso(item.dateAccouchementEffective),
      dateDeclarationAutorite: this.fromIso(item.dateDeclarationAutorite),
      categorieNaissance: item.categorieNaissance
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  save(): void {
    if (!this.form.agentId || !this.form.dateDebut || !this.form.dateFin ||
        !this.form.dateDeclarationEmployeur || !this.form.dateAccouchementPrevue ||
        !this.form.dateAccouchementEffective || !this.form.dateDeclarationAutorite ||
        !this.form.categorieNaissance) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: Partial<CongeMaternite> = {
      agentId: this.form.agentId!,
      dateDebut: this.toIso(this.form.dateDebut),
      dateFin: this.toIso(this.form.dateFin),
      dateDeclarationEmployeur: this.toIso(this.form.dateDeclarationEmployeur),
      dateAccouchementPrevue: this.toIso(this.form.dateAccouchementPrevue),
      dateAccouchementEffective: this.toIso(this.form.dateAccouchementEffective),
      dateDeclarationAutorite: this.toIso(this.form.dateDeclarationAutorite),
      categorieNaissance: this.form.categorieNaissance
    };

    this.loading = true;

    if (this.dialogMode === 'add') {
      this.service.create(payload).subscribe({
        next: () => {
          this.loading = false;
          this.displayDialog = false;
          ToastHelper.showAdd(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur create maternité', err);
          ToastHelper.showAddError(this.messageService, err?.error?.message);
          this.loading = false;
        }
      });
      return;
    }

    if (!this.form.id) return;

    this.service.update(this.form.id, payload).subscribe({
      next: () => {
        this.loading = false;
        this.displayDialog = false;
        ToastHelper.showEdit(this.messageService);
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur update maternité', err);
        ToastHelper.showUpdateError(this.messageService, err?.error?.message);
        this.loading = false;
      }
    });
  }

  onDelete(item: CongeMaternite): void {
    if (!item?.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.loading = true;
      this.service.delete(item.id!).subscribe({
        next: () => {
          this.loading = false;
          ToastHelper.showDelete(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur delete maternité', err);
          ToastHelper.showDeleteError(this.messageService, err?.error?.message);
          this.loading = false;
        }
      });
    }, `Supprimer la maternité de l'agent matricule ${item.agentMatricule} ?`);
  }

  private emptyForm(): CongeMaterniteForm {
    return {
      agentId: null,
      dateDebut: null,
      dateFin: null,
      dateDeclarationEmployeur: null,
      dateAccouchementPrevue: null,
      dateAccouchementEffective: null,
      dateDeclarationAutorite: null,
      categorieNaissance: null
    };
  }

  private toIso(d: Date | null): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromIso(v: string | null | undefined): Date | null {
    if (!v) return null;
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
