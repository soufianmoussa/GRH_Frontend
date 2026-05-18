import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { NgIf } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';

import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../../../../shared/utils/toast-helper';

import { TypeEtablissement, TypeEtablissementCreateUpdateRequest } from '../../../models/diplomes/type-etablissement.model';
import { TypeEtablissementService } from '../../../services/diplomes/type-etablissement.service';
import { PageResponse } from '../../../../../models/PageResponse.model';

@Component({
  selector: 'app-type-etablissement',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    Button,
    ButtonDirective,
    Dialog,
    FormsModule,
    InputText,
    NgIf,

    PrimeTemplate,
    TableModule,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule
  ],
  templateUrl: './type-etablissement.component.html',
  styleUrls: ['./type-etablissement.component.scss']
})
export class TypeEtablissementComponent implements OnInit {
  list: TypeEtablissement[] = [];
  total = 0;
  page = 0;
  size = 5;
  loading = false;
  searchValue = '';

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selected: TypeEtablissement | null = null;
  form: TypeEtablissementCreateUpdateRequest = this.emptyForm();
  currentId: number | null = null;
  @ViewChild('addForm') addForm?: NgForm;

  constructor(
    private service: TypeEtablissementService,
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
      next: (res: PageResponse<TypeEtablissement>) => {
        this.list = res?.content ?? [];
        this.total = res?.totalElements ?? 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading types d\'établissement:', err);
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

  clearTable(table: Table): void {
    table.clear();
    this.searchValue = '';
    this.applySearch();
  }

  onView(item: TypeEtablissement): void {
    this.selected = item;
    this.displayView = true;
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.form = this.emptyForm();
    this.currentId = null;
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(item: TypeEtablissement): void {
    this.dialogMode = 'edit';
    this.currentId = item.id ?? null;
    this.form = {
      code: item.code ?? '',
      libelle: item.libelle ?? ''
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  save(): void {
    if (!this.form.libelle) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    this.loading = true;

    if (this.dialogMode === 'add') {
      this.service.add(this.form).subscribe({
        next: () => {
          ToastHelper.showAdd(this.messageService);
          this.displayDialog = false;
          this.loadPage(0);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Add failed:', err);
          ToastHelper.showAddError(this.messageService, err.error?.message);
          this.loading = false;
        }
      });
    } else {
      if (!this.currentId) return;
      this.service.update(this.currentId, this.form).subscribe({
        next: () => {
          ToastHelper.showEdit(this.messageService);
          this.displayDialog = false;
          this.loadPage(this.page);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Update failed:', err);
          ToastHelper.showUpdateError(this.messageService, err.error?.message);
          this.loading = false;
        }
      });
    }
  }

  onDelete(item: TypeEtablissement): void {
    if (!item?.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.loading = true;
      this.service.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadPage(0);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          ToastHelper.showDeleteError(this.messageService, err.error?.message);
          this.loading = false;
        }
      });
    });
  }

  private emptyForm(): TypeEtablissementCreateUpdateRequest {
    return { code: '', libelle: '' };
  }
}
