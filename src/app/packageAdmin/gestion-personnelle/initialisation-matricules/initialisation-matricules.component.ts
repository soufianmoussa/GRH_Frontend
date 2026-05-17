import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { NgIf, CommonModule, DatePipe } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { DropdownModule } from 'primeng/dropdown';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { Matricule } from '../../../models/initialisation-matricules.model';
import { InitialisationMatriculesService } from '../../../services/AdminService/InitialisationMatricules/initialisation-matricules.service';
import { ToastHelper } from '../../../shared/utils/toast-helper';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-initialisation-matricules',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    Button,
    ButtonDirective,
    Dialog,
    ConfirmDialogModule,
    InputText,
    NgIf,
    PrimeTemplate,
    ReactiveFormsModule,
    TableModule,
    FormsModule,
    DropdownModule,
    Toast,
    DatePicker,
    FloatLabelModule,
    FloatLabelModule,
    TooltipModule,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    TagModule,
    TranslateModule
  ],
  templateUrl: './initialisation-matricules.component.html',
  styleUrl: './initialisation-matricules.component.scss'
})
export class InitialisationMatriculesComponent implements OnInit {
  matricules: Matricule[] = [];
  loading = true;

  searchValue = '';

  displayView = false;
  displayDialog = false;

  selectedItem: Matricule | null = null;
  newItem: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  constructor(
    private matriculesService: InitialisationMatriculesService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) { }

  /** Redirige vers le wizard de création d'agent (matricule saisi dans le stepper). */
  goToAgentCreation(): void {
    this.router.navigate(['/dossiers-agents/new']);
  }

  ngOnInit(): void {
    this.initializeData();
  }

  initializeData() {
    this.loading = true;

    const criteria: any = {};
    if (this.searchValue && this.searchValue.trim().length > 0) {
      criteria.global = this.searchValue.trim();
    }

    this.matriculesService.getAll(0, 500, criteria).subscribe({
      next: (res) => {
        this.matricules = res?.content ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading matricules:', err);
        ToastHelper.showLoadError(this.messageService);
        this.matricules = [];
        this.loading = false;
      }
    });
  }

  applySearch() {
    this.initializeData();
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
    this.applySearch();
  }

  onView(item: Matricule) {
    this.selectedItem = {
      ...item,
      dateRecrutement: this.fromIsoDate(item.dateRecrutement) as any
    };
    this.displayView = true;
  }

  onEdit(item: Matricule) {
    this.newItem = {
      ...item,
      dateRecrutement: this.fromIsoDate(item.dateRecrutement) as any
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.newItem);
    });
  }

  save() {
    if (this.addForm?.invalid) {
      this.addForm.form.markAllAsTouched();
      ToastHelper.showFormError(this.messageService);
      return;
    }
    if (!this.validateForm(this.newItem)) {
      ToastHelper.showFormError(this.messageService);
      return;
    }
    if (!this.newItem.id) return;

    const payload = {
      ...this.newItem,
      dateRecrutement: this.toIsoDate(this.newItem.dateRecrutement as any)!
    };

    this.matriculesService.update(this.newItem.id, payload).subscribe({
      next: () => {
        ToastHelper.showEdit(this.messageService);
        this.displayDialog = false;
        this.newItem = {};
        this.initializeData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Update failed:', err);
        ToastHelper.showUpdateError(this.messageService, err.error?.message);
      }
    });
  }

  private validateForm(item: any): boolean {
    if (!item) return false;

    const requiredFields = [
      'matricule', 'dateRecrutement', 'domaine', 'sousDomaine',
      'categorie', 'typeContrat'
    ];

    for (const field of requiredFields) {
      const value = item[field];
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
    }

    return true;
  }

  onDelete(id: number) {
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.matriculesService.delete(id).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.initializeData();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          ToastHelper.showDeleteError(this.messageService, err.error?.message);
        }
      });
    });
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
