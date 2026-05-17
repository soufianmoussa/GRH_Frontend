import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { NgIf, CommonModule } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastHelper } from '../../../shared/utils/toast-helper';
import { FormationInitiale, FormationInitialeCreateUpdateRequest } from '../../../models/diplomes/formation-initiale.model';
import { FormationInitialeService } from '../../../services/AdminService/Diplomes/formation-initiale.service';
import { PageResponse } from '../../../models/PageResponse.model';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-formation-initiale',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, Button, ButtonDirective, Dialog, FormsModule, InputText,
    NgIf, PrimeTemplate, TableModule, Toast, ConfirmDialogModule,
    FloatLabelModule, Tabs, TabList, Tab, TabPanels, TabPanel, TooltipModule
  ],
  templateUrl: './formation-initiale.component.html',
  styleUrls: ['./formation-initiale.component.scss']
})
export class FormationInitialeComponent implements OnInit {
  list: FormationInitiale[] = [];
  total = 0;
  page = 0;
  size = 5;
  loading = false;
  searchValue = '';

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selected: FormationInitiale | null = null;
  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  constructor(
    private service: FormationInitialeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.page = page;
    this.service.getAll(this.page, this.size, this.searchValue).subscribe({
      next: (res: PageResponse<FormationInitiale>) => {
        this.list = res?.content ?? [];
        this.total = res?.totalElements ?? 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        ToastHelper.showLoadError(this.messageService);
        this.list = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    this.loadPage(0);
  }

  onPageChange(event: any): void {
    this.size = event.rows;
    const newPage = Math.floor(event.first / event.rows);
    this.loadPage(newPage);
  }

  @ViewChild('dt') table!: Table;

  clearTable(table: Table): void {
    this.searchValue = '';
    table.clear();
    this.applySearch();
  }

  onView(item: FormationInitiale): void {
    this.selected = item;
    this.displayView = true;
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.form = { code: '', libelle: '' };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(item: FormationInitiale): void {
    this.dialogMode = 'edit';
    this.form = {
      id: item.id,
      code: item.code ?? '',
      libelle: item.libelle ?? ''
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  save(): void {
    const f = this.form;
    if (!f.libelle?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: FormationInitialeCreateUpdateRequest = {
      code: (f.code || '').trim(),
      libelle: f.libelle.trim()
    };

    if (this.dialogMode === 'add') {
      this.service.add(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showAdd(this.messageService);
          this.loadPage(0);
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      this.service.update(f.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showEdit(this.messageService);
          this.loadPage(this.page);
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  onDelete(item: FormationInitiale): void {
    if (!item?.id) return;
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.service.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadPage(0);
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer la formation initiale ${item.libelle} ?`);
  }
}
