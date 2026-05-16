import { Component, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { NgIf, CommonModule, NgClass } from '@angular/common';
import { Echelle } from '../../models/Echelle.model';
import { EchelleService } from '../../services/AdminService/Echelle/echelle.service';
import { PageResponse } from '../../models/PageResponse.model';
import { DropdownModule } from 'primeng/dropdown';
import { NiveauDiplome } from '../../models/diplomes/niveau-diplome.model';
import { NiveauDiplomeService } from '../../services/AdminService/Diplomes/niveau-diplome.service';
import { Textarea } from "primeng/textarea";
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../shared/toast-helper';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';

@Component({
  selector: 'app-echelle',
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
    DropdownModule,
    Textarea,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    PrimeTemplate,
    Tabs, TabList, Tab, TabPanels, TabPanel
  ],
  templateUrl: './echelle.component.html',
  styleUrl: './echelle.component.scss'
})
export class EchelleComponent implements OnInit {

  searchEchelle = '';
  loading = false;

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selectedEchelle: Echelle | null = null;
  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  situationEchelle: Echelle[] = [];
  niveauxDiplome: NiveauDiplome[] = [];

  totalRecords = 0;
  pageSize = 5;
  currentPage = 0;

  constructor(
    private echelleService: EchelleService,
    private niveauDiplomeService: NiveauDiplomeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadPage(0, this.pageSize);
    this.loadNiveauxDiplome();
  }

  loadNiveauxDiplome() {
    this.niveauDiplomeService.getAll(0, 100).subscribe({
      next: (res) => {
        this.niveauxDiplome = res.content || [];
      },
      error: (err) => console.error('Erreur chargement niveaux diplome', err)
    });
  }

  loadPage(page: number, size: number) {
    this.loading = true;
    this.currentPage = page;
    this.pageSize = size;

    this.echelleService.getAll(page, size).subscribe({
      next: (res: PageResponse<Echelle>) => {
        this.situationEchelle = res.content ?? [];
        this.totalRecords = res.totalElements ?? 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement echelles', err);
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      },
    });
  }

  applySearch() {
    this.loadPage(0, this.pageSize);
  }

  onPageChange(event: any) {
    const page = Math.floor(event.first / event.rows);
    this.loadPage(page, event.rows);
  }

  refreshTable() {
    this.loadPage(this.currentPage, this.pageSize);
  }

  @ViewChild('dtEchelle') table!: Table;

  clearTable(table: Table) {
    this.searchEchelle = '';
    table.clear();
    this.applySearch();
  }

  onViewEchelle(item: Echelle) {
    this.selectedEchelle = item;
    this.displayView = true;
  }

  showAddEchelleDialog() {
    this.dialogMode = 'add';
    this.form = {};
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEditEchelle(item: Echelle) {
    this.dialogMode = 'edit';
    this.form = {
      id: item.id,
      echelle: item.echelle,
      description: item.description || '',
      niveauDiplomeId: item.niveauDiplome?.id || null
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  save(): void {
    const f = this.form;
    if (!f.echelle?.trim() || !f.niveauDiplomeId) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: any = {
      ...f,
      echelle: f.echelle.trim(),
      description: (f.description || '').trim()
    };

    if (this.dialogMode === 'add') {
      this.echelleService.create(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showAdd(this.messageService);
          this.refreshTable();
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      this.echelleService.update(f.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showEdit(this.messageService);
          this.refreshTable();
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  onDeleteEchelle(item: Echelle) {
    if (!item?.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.echelleService.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.refreshTable();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer l’échelle ${item.echelle} ?`);
  }
}
