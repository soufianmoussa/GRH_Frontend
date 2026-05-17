import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { NgIf, CommonModule } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastHelper } from '../../../shared/utils/toast-helper';
import { Etablissement, EtablissementCreateUpdateRequest } from '../../../models/diplomes/etablissement.model';
import { EtablissementService } from '../../../services/AdminService/Diplomes/etablissement.service';
import { TypeEtablissementService } from '../../../services/AdminService/Diplomes/type-etablissement.service';
import { TypeEtablissement } from '../../../models/diplomes/type-etablissement.model';
import { PageResponse } from '../../../models/PageResponse.model';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-etablissement',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, Button, ButtonDirective, Dialog, FormsModule, InputText,
    NgIf, PrimeTemplate, TableModule, Toast, ConfirmDialogModule,
    DropdownModule, FloatLabelModule, Tabs, TabList, Tab, TabPanels, TabPanel,
    TooltipModule
  ],
  templateUrl: './etablissement.component.html',
  styleUrls: ['./etablissement.component.scss']
})
export class EtablissementComponent implements OnInit {
  list: Etablissement[] = [];
  typeEtabList: TypeEtablissement[] = [];
  total = 0;
  page = 0;
  size = 5;
  loading = false;
  searchValue = '';

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selected: Etablissement | null = null;
  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  constructor(
    private service: EtablissementService,
    private typeEtabService: TypeEtablissementService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
    this.loadTypeEtab();
  }

  loadTypeEtab(): void {
    this.typeEtabService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.typeEtabList = res?.content ?? [];
      }
    });
  }

  loadPage(page: number): void {
    this.loading = true;
    this.page = page;
    this.service.getAll(this.page, this.size, this.searchValue).subscribe({
      next: (res: PageResponse<Etablissement>) => {
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

  onView(item: Etablissement): void {
    this.selected = item;
    this.displayView = true;
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.form = { code: '', libelle: '', typeEtabId: null };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(item: Etablissement): void {
    this.dialogMode = 'edit';
    this.form = {
      id: item.id,
      code: item.code ?? '',
      libelle: item.libelle ?? '',
      typeEtabId: item.typeEtab?.id
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  save(): void {
    const f = this.form;
    if (!f.libelle?.trim() || !f.typeEtabId) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: EtablissementCreateUpdateRequest = {
      code: (f.code || '').trim(),
      libelle: f.libelle.trim(),
      typeEtabId: f.typeEtabId
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

  onDelete(item: Etablissement): void {
    if (!item?.id) return;
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.service.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadPage(0);
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer l'établissement ${item.libelle} ?`);
  }
}
