import {Component, OnInit} from '@angular/core';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {Table, TableModule} from 'primeng/table';
import {NgIf, CommonModule} from '@angular/common';
import {Button, ButtonDirective} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {TooltipModule} from 'primeng/tooltip';
import {Dialog} from 'primeng/dialog';
import {Textarea} from 'primeng/textarea';
import {MessageService, ConfirmationService} from 'primeng/api';
import {Toast} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {FloatLabelModule} from 'primeng/floatlabel';

import {CompetenceService} from '../../services/AdminService/ReferentielCompetences/competence.service';
import {GroupeCompetenceService} from '../../services/AdminService/ReferentielCompetences/groupe-competence.service';
import {Competence, GroupeCompetence} from '../../models/ReferentielCompetences.model';
import {PageResponse} from '../../models/PageResponse.model';
import {ToastHelper} from '../../shared/toast-helper';

@Component({
  selector: 'app-referentiel-competences',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    TableModule,
    NgIf,
    Button,
    InputText,
    ButtonDirective,
    TooltipModule,
    Dialog,
    Textarea,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule
  ],
  templateUrl: './referentiel-competences.component.html',
  styleUrl: './referentiel-competences.component.scss'
})
export class ReferentielCompetencesComponent implements OnInit {

  loading = false;

  searchCompetence = '';

  groupes: GroupeCompetence[] = [];
  selectedGroupeId: number | null = null;

  competences: Competence[] = [];
  totalRecords = 0;
  pageSize = 5;
  currentPage = 0;

  displayView = false;
  displayAdd = false;
  displayEdit = false;

  selectedCompetence: Competence | null = null;

  newCompetence: Competence = this.emptyCompetence();
  editCompetence: Competence | null = null;

  constructor(
    private groupeService: GroupeCompetenceService,
    private competenceService: CompetenceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadGroupes();
  }

  selectedGroupe: GroupeCompetence | null = null;
  loadGroupes() {
    this.groupeService.getAll(0, 200).subscribe({
      next: (res: PageResponse<GroupeCompetence>) => {
        this.groupes = res.content ?? [];
        if (this.groupes.length > 0 && !this.selectedGroupeId) {
          this.selectedGroupeId = this.groupes[0].id ?? null;
        }
        this.loadPage(0, this.pageSize);
      },
      error: (err) => {
        console.error('Erreur load groupes', err);
        ToastHelper.showLoadError(this.messageService);
      },
    });
  }

  onGroupeChange(): void {
    this.loadPage(0, this.pageSize);
  }

  loadPage(page: number, size: number): void {
    if (!this.selectedGroupeId) {
      this.competences = [];
      this.totalRecords = 0;
      return;
    }

    this.loading = true;
    this.currentPage = page;
    this.pageSize = size;

    const filters = this.searchCompetence.trim() ? { competence: this.searchCompetence.trim() } : undefined;

    this.competenceService.getAllByGroupe(this.selectedGroupeId, page, size, filters).subscribe({
      next: (res: PageResponse<Competence>) => {
        this.competences = res?.content ?? [];
        this.totalRecords = res?.totalElements ?? 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur load competences', err);
        this.loading = false;
        ToastHelper.showLoadError(this.messageService);
      },
    });
  }

  onPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows);
    const size = event.rows;
    this.loadPage(page, size);
  }

  applySearch(): void {
    this.loadPage(0, this.pageSize);
  }

  refreshTable(): void {
    this.loadPage(this.currentPage, this.pageSize);
  }

  clearCompetences(table: Table): void {
    this.searchCompetence = '';
    table.clear();
    this.applySearch();
  }

  onViewCompetence(item: Competence): void {
    this.selectedCompetence = item;
    this.displayView = true;
  }

  showAddDialog(): void {
    this.newCompetence = this.emptyCompetence();
    this.displayAdd = true;
  }

  createCompetence(): void {
    if (!this.selectedGroupeId) {
      ToastHelper.showError(this.messageService, 'Veuillez choisir un groupe d’abord');
      return;
    }

    if (!this.newCompetence.competence?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: Partial<Competence> = {
      competence: this.newCompetence.competence.trim(),
      description: (this.newCompetence.description ?? '').trim(),
      groupeId: this.selectedGroupeId,
    };

    this.loading = true;
    this.competenceService.create(payload).subscribe({
      next: () => {
        this.displayAdd = false;
        this.loading = false;
        ToastHelper.showAdd(this.messageService);
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur create competence', err);
        this.loading = false;
        ToastHelper.showAddError(this.messageService, err?.error?.message);
      },
    });
  }

  onEditCompetence(item: Competence): void {
    this.editCompetence = {
      id: item.id,
      competence: item.competence,
      description: item.description,
      groupeId: item.groupeId ?? this.selectedGroupeId ?? undefined,
    };
    this.displayEdit = true;
  }

  updateCompetence(): void {
    if (!this.editCompetence) return;

    const id = this.editCompetence.id;
    if (!id) return;

    if (!this.editCompetence.competence?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: Partial<Competence> = {
      competence: this.editCompetence.competence.trim(),
      description: (this.editCompetence.description ?? '').trim(),
      groupeId: this.selectedGroupeId ?? this.editCompetence.groupeId,
    };

    this.loading = true;
    this.competenceService.update(id, payload).subscribe({
      next: () => {
        this.displayEdit = false;
        this.editCompetence = null;
        this.loading = false;
        ToastHelper.showEdit(this.messageService);
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur update competence', err);
        this.loading = false;
        ToastHelper.showUpdateError(this.messageService, err?.error?.message);
      },
    });
  }

  onDeleteCompetence(item: Competence): void {
    if (!item?.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.loading = true;
      this.competenceService.delete(item.id!).subscribe({
        next: () => {
          this.loading = false;
          ToastHelper.showDelete(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur delete competence', err);
          this.loading = false;
          ToastHelper.showDeleteError(this.messageService, err?.error?.message);
        },
      });
    }, `Supprimer la compétence "${item.competence}" ?`);
  }

  private emptyCompetence(): Competence {
    return { competence: '', description: '' , groupeId : 0};
  }
}
