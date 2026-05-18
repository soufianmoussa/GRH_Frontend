import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Button, ButtonDirective } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { Dialog } from 'primeng/dialog';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';

import { Competence, GroupeCompetence } from '../../../../models/ReferentielCompetences.model';
import { GroupeCompetenceService } from '../../services/referentiel-competences/groupe-competence.service';
import { CompetenceService } from '../../services/referentiel-competences/competence.service';
import { PageResponse } from '../../../../models/PageResponse.model';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

@Component({
  selector: 'app-referentiel-des-groupes-de-competences',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Button, ButtonDirective,
    TableModule,
    InputText,
    InputTextarea,
    TooltipModule,
    DropdownModule,
    Dialog,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    PrimeTemplate,
    NgClass,
    NgIf
  ],
  templateUrl: './referentiel-des-groupes-de-competences.component.html',
  styleUrl: './referentiel-des-groupes-de-competences.component.scss'
})
export class ReferentielDesGroupesDeCompetencesComponent implements OnInit {

  activeTab = '0';

  loadingGroupes = false;
  loadingCompetences = false;

  groupes: GroupeCompetence[] = [];
  groupesTotal = 0;
  groupesPageSize = 5;
  groupesPage = 0;

  displayDialogGroupe = false;
  dialogModeGroupe: 'add' | 'edit' = 'add';
  formGroupe: any = {};

  competences: Competence[] = [];
  competencesTotal = 0;
  competencesPageSize = 5;
  competencesPage = 0;
  selectedGroupeId: number | null = null;

  displayDialogCompetence = false;
  dialogModeCompetence: 'add' | 'edit' = 'add';
  formCompetence: any = {};

  displayView = false;
  selectedItem: any = null;

  searchGlobal = '';

  constructor(
    private groupeService: GroupeCompetenceService,
    private competenceService: CompetenceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadGroupes(0, this.groupesPageSize);
  }

  onTabChange(event: any) {
    const newValue = event?.value ?? this.activeTab;
    this.activeTab = newValue;

    if (this.activeTab === '1') {
      if (this.selectedGroupeId && this.competences.length === 0) {
        this.loadCompetences(0, this.competencesPageSize);
      }
    }
  }

  loadGroupes(page: number, size: number) {
    this.groupesPage = page;
    this.groupesPageSize = size;
    this.loadingGroupes = true;

    this.groupeService.getAll(page, size, this.searchGlobal).subscribe({
      next: (res: PageResponse<GroupeCompetence>) => {
        this.groupes = res.content ?? [];
        this.groupesTotal = res.totalElements ?? 0;
        this.loadingGroupes = false;

        if (this.groupes.length > 0 && (this.selectedGroupeId === null || this.selectedGroupeId === undefined)) {
          this.selectedGroupeId = this.groupes[0].id ?? null;
          if (this.selectedGroupeId !== null) {
            this.loadCompetences(0, this.competencesPageSize);
          }
        }
      },
      error: () => {
        this.loadingGroupes = false;
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  onGroupesPageChange(event: any) {
    this.loadGroupes(Math.floor(event.first / event.rows), event.rows);
  }

  loadCompetences(page: number, size: number) {
    if (this.selectedGroupeId === null || this.selectedGroupeId === undefined) return;

    this.loadingCompetences = true;
    this.competencesPage = page;
    this.competencesPageSize = size;

    this.competenceService.getAllByGroupe(this.selectedGroupeId, page, size).subscribe({
      next: (res: PageResponse<Competence>) => {
        this.competences = res.content ?? [];
        this.competencesTotal = res.totalElements ?? 0;
        this.loadingCompetences = false;
      },
      error: () => {
        this.loadingCompetences = false;
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  onCompetencesPageChange(event: any) {
    this.loadCompetences(Math.floor(event.first / event.rows), event.rows);
  }

  onSelectGroupeForCompetences() {
    this.loadCompetences(0, this.competencesPageSize);
  }

  onView(item: any) {
    this.selectedItem = item;
    this.displayView = true;
  }

  showAddGroupeDialog() {
    this.dialogModeGroupe = 'add';
    this.formGroupe = {};
    this.displayDialogGroupe = true;
  }

  showEditGroupeDialog(item: GroupeCompetence) {
    this.dialogModeGroupe = 'edit';
    this.formGroupe = { ...item };
    this.displayDialogGroupe = true;
  }

  saveGroupe() {
    const f = this.formGroupe;
    if (!f.name?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      name: f.name.trim(),
      description: (f.description ?? '').trim(),
    };

    if (this.dialogModeGroupe === 'add') {
      this.groupeService.create(payload).subscribe({
        next: () => {
          this.displayDialogGroupe = false;
          ToastHelper.showAdd(this.messageService);
          this.loadGroupes(this.groupesPage, this.groupesPageSize);
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      this.groupeService.update(f.id, payload).subscribe({
        next: () => {
          this.displayDialogGroupe = false;
          ToastHelper.showEdit(this.messageService);
          this.loadGroupes(this.groupesPage, this.groupesPageSize);
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  deleteGroupe(item: GroupeCompetence) {
    if (!item?.id) return;
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.groupeService.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          if (this.selectedGroupeId === item.id) {
            this.selectedGroupeId = null;
            this.competences = [];
            this.competencesTotal = 0;
          }
          this.loadGroupes(this.groupesPage, this.groupesPageSize);
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer le groupe "${item.name}" ?`);
  }

  showAddCompetenceDialog() {
    if (!this.selectedGroupeId) {
      ToastHelper.showError(this.messageService, 'Veuillez choisir un groupe d’abord');
      return;
    }
    this.dialogModeCompetence = 'add';
    this.formCompetence = { groupeId: this.selectedGroupeId };
    this.displayDialogCompetence = true;
  }

  showEditCompetenceDialog(item: Competence) {
    this.dialogModeCompetence = 'edit';
    this.formCompetence = { ...item };
    this.displayDialogCompetence = true;
  }

  saveCompetence() {
    const f = this.formCompetence;
    if (!f.competence?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      competence: f.competence.trim(),
      description: (f.description ?? '').trim(),
      groupeId: this.selectedGroupeId ?? f.groupeId,
    };

    if (this.dialogModeCompetence === 'add') {
      this.competenceService.create(payload).subscribe({
        next: () => {
          this.displayDialogCompetence = false;
          ToastHelper.showAdd(this.messageService);
          this.loadCompetences(this.competencesPage, this.competencesPageSize);
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      this.competenceService.update(f.id, payload).subscribe({
        next: () => {
          this.displayDialogCompetence = false;
          ToastHelper.showEdit(this.messageService);
          this.loadCompetences(this.competencesPage, this.competencesPageSize);
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  deleteCompetence(item: Competence) {
    if (!item?.id) return;
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.competenceService.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadCompetences(this.competencesPage, this.competencesPageSize);
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer la compétence "${item.competence}" ?`);
  }

  applySearch() {
    this.loadGroupes(0, this.groupesPageSize);
  }

  @ViewChild('dtGroupes') tableGroupes!: Table;
  @ViewChild('dtCompetences') tableCompetences!: Table;

  clearTable(table: Table) {
    this.searchGlobal = '';
    table.clear();
    if (table === this.tableGroupes) {
      this.loadGroupes(0, this.groupesPageSize);
    } else {
      this.loadCompetences(0, this.competencesPageSize);
    }
  }
}
