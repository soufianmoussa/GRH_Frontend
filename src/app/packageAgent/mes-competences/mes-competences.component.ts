import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentcardComponent } from '../agentcard/agentcard.component';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { NgIf } from '@angular/common';
import { PrimeTemplate, MessageService, ConfirmationService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastHelper } from '../../shared/toast-helper';
import { TooltipModule } from 'primeng/tooltip';

import { MesCompetencesService } from '../../services/AdminService/MesCompetences/mes-competences.service';
import { MesCompetences } from '../../models/mesCompetences.model';
import { PageResponse } from '../../models/PageResponse.model';

type CompetenceForm = {
  id?: number;
  competence: string;
  type: string;
  niveau: string;
  dateAcquisition: Date | null;
  dateDerniereMiseAJour: Date | null;
};

@Component({
  selector: 'app-mes-competences',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    AgentcardComponent,
    TableModule,
    Button,
    Dialog,
    InputText,
    FormsModule,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    NgIf,
    PrimeTemplate,
    ButtonDirective,
    DatePicker,
    FloatLabelModule,
    Toast,
    ConfirmDialogModule,
    TooltipModule
  ],
  templateUrl: './mes-competences.component.html',
  styleUrls: ['./mes-competences.component.scss']
})
export class MesCompetencesComponent implements OnInit {
  @ViewChild('competenceForm') competenceForm?: NgForm;

  loading = false;
  search = '';

  mesCompetences: MesCompetences[] = [];
  totalRecords = 0;
  pageSize = 5;
  currentPage = 0;

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selected: MesCompetences | null = null;
  currentCompetence: CompetenceForm = this.emptyForm();

  constructor(
    private mesCompetencesService: MesCompetencesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPage(0, this.pageSize);
  }

  loadPage(page: number, size: number): void {
    this.currentPage = page;
    this.pageSize = size;
    this.loading = true;

    this.mesCompetencesService.getAll(page, size, this.search).subscribe({
      next: (res: PageResponse<MesCompetences>) => {
        this.mesCompetences = res?.content ?? [];
        this.totalRecords = res?.totalElements ?? 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur load competences', err);
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

  onView(item: MesCompetences): void {
    this.selected = {
      ...item,
      dateAcquisition: this.fromIsoDate(item.dateAcquisition) as any,
      dateDerniereMiseAJour: this.fromIsoDate(item.dateDerniereMiseAJour) as any
    };
    this.displayView = true;
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.currentCompetence = this.emptyForm();
    this.displayDialog = true;
    setTimeout(() => {
      this.competenceForm?.resetForm();
      this.currentCompetence = this.emptyForm();
    });
  }

  onEdit(item: MesCompetences): void {
    this.dialogMode = 'edit';
    this.currentCompetence = {
      id: item.id,
      competence: item.competence ?? '',
      type: item.type ?? '',
      niveau: item.niveau ?? '',
      dateAcquisition: this.fromIsoDate(item.dateAcquisition),
      dateDerniereMiseAJour: this.fromIsoDate(item.dateDerniereMiseAJour)
    };
    this.displayDialog = true;
    setTimeout(() => {
      const saved = { ...this.currentCompetence };
      this.competenceForm?.control.markAsPristine();
      this.competenceForm?.control.markAsUntouched();
      this.currentCompetence = saved;
    });
  }

  save(): void {
    if (!this.validateForm(this.currentCompetence)) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: Partial<MesCompetences> = {
      competence: this.currentCompetence.competence.trim(),
      type: this.currentCompetence.type.trim(),
      niveau: this.currentCompetence.niveau.trim(),
      dateAcquisition: this.toIsoDate(this.currentCompetence.dateAcquisition) ?? '',
      dateDerniereMiseAJour: this.toIsoDate(this.currentCompetence.dateDerniereMiseAJour) ?? ''
    };

    this.loading = true;
    if (this.dialogMode === 'add') {
      this.mesCompetencesService.add(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.loading = false;
          ToastHelper.showAdd(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur create competence', err);
          this.loading = false;
        }
      });
    } else {
      if (!this.currentCompetence.id) return;
      this.mesCompetencesService.update(this.currentCompetence.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.loading = false;
          ToastHelper.showEdit(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur update competence', err);
          this.loading = false;
        }
      });
    }
  }

  onDelete(item: MesCompetences): void {
    if (!item?.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.loading = true;
      this.mesCompetencesService.delete(item.id!).subscribe({
        next: () => {
          this.loading = false;
          ToastHelper.showDelete(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur delete competence', err);
          this.loading = false;
        }
      });
    });
  }

  private validateForm(form: CompetenceForm): boolean {
    return !!(form.competence?.trim() && form.type?.trim() && form.niveau?.trim() && form.dateAcquisition);
  }

  private emptyForm(): CompetenceForm {
    return {
      competence: '',
      type: '',
      niveau: '',
      dateAcquisition: null,
      dateDerniereMiseAJour: null
    };
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d || !(d instanceof Date)) return d as any;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromIsoDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
