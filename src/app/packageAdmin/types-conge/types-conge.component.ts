import { Component, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { NgIf, CommonModule } from '@angular/common';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../shared/toast-helper';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TypeConge, TypeCongeCreateUpdateRequest } from '../../models/typeConge.model';
import { TypeCongeService } from '../../services/AdminService/TypeConge/type-conge.service';

@Component({
  selector: 'app-types-conge',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    TableModule,
    Button,
    InputText,
    FormsModule,
    ButtonDirective,
    TooltipModule,
    Dialog,
    NgIf,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    PrimeTemplate,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    CheckboxModule,
    TagModule
  ],
  templateUrl: './types-conge.component.html',
  styleUrl: './types-conge.component.scss'
})
export class TypesCongeComponent implements OnInit {

  searchText = '';
  loading = false;

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selectedItem: TypeConge | null = null;
  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  typesConge: TypeConge[] = [];
  filteredTypes: TypeConge[] = [];

  constructor(
    private typeCongeService: TypeCongeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.typeCongeService.getAll().subscribe({
      next: (data) => {
        this.typesConge = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchText.trim()) {
      this.filteredTypes = [...this.typesConge];
    } else {
      const q = this.searchText.toLowerCase();
      this.filteredTypes = this.typesConge.filter(t =>
        t.code.toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q)
      );
    }
  }

  @ViewChild('dtTypes') table!: Table;

  clearTable(table: Table): void {
    this.searchText = '';
    table.clear();
    this.applyFilter();
  }

  onView(item: TypeConge): void {
    this.selectedItem = item;
    this.displayView = true;
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.form = {
      code: '',
      label: '',
      deductible: false,
      requiresAttachment: false,
      requiresMedicalCertificate: false,
      maxDurationDays: null,
      minAdvanceNoticeDays: null,
      active: true,
      countsWorkingDaysOnly: true,
      requiresApproval: true,
      defaultBaseDays: 0
    };
    this.displayDialog = true;
    setTimeout(() => this.addForm?.resetForm(this.form));
  }

  onEdit(item: TypeConge): void {
    this.dialogMode = 'edit';
    this.form = { ...item };
    this.displayDialog = true;
    setTimeout(() => this.addForm?.resetForm(this.form));
  }

  save(): void {
    const f = this.form;
    if (!f.code?.trim() || !f.label?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: TypeCongeCreateUpdateRequest = {
      code: f.code.trim().toUpperCase(),
      label: f.label.trim(),
      deductible: f.deductible ?? false,
      requiresAttachment: f.requiresAttachment ?? false,
      requiresMedicalCertificate: f.requiresMedicalCertificate ?? false,
      maxDurationDays: f.maxDurationDays || null,
      minAdvanceNoticeDays: f.minAdvanceNoticeDays || null,
      active: f.active ?? true,
      countsWorkingDaysOnly: f.countsWorkingDaysOnly ?? true,
      requiresApproval: f.requiresApproval ?? true,
      defaultBaseDays: f.defaultBaseDays ?? 0
    };

    if (this.dialogMode === 'add') {
      this.typeCongeService.create(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showAdd(this.messageService);
          this.loadData();
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      this.typeCongeService.update(f.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showEdit(this.messageService);
          this.loadData();
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  onDelete(item: TypeConge): void {
    if (!item?.id) return;
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.typeCongeService.delete(item.id).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadData();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer le type "${item.label}" ?`);
  }
}
