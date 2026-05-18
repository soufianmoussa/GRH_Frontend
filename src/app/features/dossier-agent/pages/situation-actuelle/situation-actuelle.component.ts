import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentcardComponent } from '../../../../shared/components/agent-card/agent-card.component';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule, NgForm } from '@angular/forms';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { NgIf } from '@angular/common';
import { PrimeTemplate, MessageService, ConfirmationService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { TextareaModule } from 'primeng/textarea';

import { SituationActuelleService } from '../../services/situation-actuelle/situation-actuelle.service';
import { SituationActuelle } from '../../../../models/situationActuelle.model';
import { PageResponse } from '../../../../models/PageResponse.model';

type SituationForm = {
  id?: number;
  ordre: number | null;
  structure: string;
  fonction: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  observation: string;
};

@Component({
  selector: 'app-situation-actuelle',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    AgentcardComponent,
    TableModule,
    Button,
    Dialog,
    InputText,
    TooltipModule,
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
    TextareaModule
  ],
  templateUrl: './situation-actuelle.component.html',
  styleUrls: ['./situation-actuelle.component.scss']
})
export class SituationActuelleComponent implements OnInit {
  @ViewChild('situationForm') situationForm?: NgForm;

  loading = false;
  search = '';

  situations: SituationActuelle[] = [];
  totalRecords = 0;
  pageSize = 5;
  currentPage = 0;

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selected: SituationActuelle | null = null;
  currentSituation: SituationForm = this.emptyForm();

  constructor(
    private situationActuelleService: SituationActuelleService,
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

    this.situationActuelleService.getAll(page, size, this.search).subscribe({
      next: (res: PageResponse<SituationActuelle>) => {
        this.situations = res?.content ?? [];
        this.totalRecords = res?.totalElements ?? 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur load situations', err);
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

  onView(item: SituationActuelle): void {
    this.selected = {
      ...item,
      dateDebut: this.fromIsoDate(item.dateDebut) as any,
      dateFin: this.fromIsoDate(item.dateFin) as any
    };
    this.displayView = true;
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.currentSituation = this.emptyForm();
    this.displayDialog = true;
    setTimeout(() => {
      this.situationForm?.resetForm();
      this.currentSituation = this.emptyForm();
    });
  }

  onEdit(item: SituationActuelle): void {
    this.dialogMode = 'edit';
    this.currentSituation = {
      id: item.id,
      ordre: item.ordre,
      structure: item.structure ?? '',
      fonction: item.fonction ?? '',
      dateDebut: this.fromIsoDate(item.dateDebut),
      dateFin: this.fromIsoDate(item.dateFin),
      observation: item.observation ?? ''
    };
    this.displayDialog = true;
    setTimeout(() => {
      const saved = { ...this.currentSituation };
      this.situationForm?.control.markAsPristine();
      this.situationForm?.control.markAsUntouched();
      this.currentSituation = saved;
    });
  }

  save(): void {
    if (!this.validateForm(this.currentSituation)) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: Partial<SituationActuelle> = {
      ordre: this.currentSituation.ordre ?? 0,
      structure: this.currentSituation.structure.trim(),
      fonction: this.currentSituation.fonction.trim(),
      dateDebut: this.toIsoDate(this.currentSituation.dateDebut) ?? '',
      dateFin: this.toIsoDate(this.currentSituation.dateFin) ?? '',
      observation: this.currentSituation.observation
    };

    this.loading = true;
    if (this.dialogMode === 'add') {
      this.situationActuelleService.add(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.loading = false;
          ToastHelper.showAdd(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur create situation', err);
          this.loading = false;
        }
      });
    } else {
      if (!this.currentSituation.id) return;
      this.situationActuelleService.update(this.currentSituation.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.loading = false;
          ToastHelper.showEdit(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur update situation', err);
          this.loading = false;
        }
      });
    }
  }

  onDelete(item: SituationActuelle): void {
    if (!item?.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.loading = true;
      this.situationActuelleService.delete(item.id!).subscribe({
        next: () => {
          this.loading = false;
          ToastHelper.showDelete(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur delete situation', err);
          this.loading = false;
        }
      });
    });
  }

  private validateForm(form: SituationForm): boolean {
    if (!form) return false;
    if (form.ordre === null || form.ordre === undefined) return false;
    if (!form.structure || !form.structure.trim()) return false;
    if (!form.fonction || !form.fonction.trim()) return false;
    if (!form.dateDebut) return false;
    if (!form.dateFin) return false;
    return true;
  }

  private emptyForm(): SituationForm {
    return {
      ordre: null,
      structure: '',
      fonction: '',
      dateDebut: null,
      dateFin: null,
      observation: ''
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
