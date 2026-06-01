import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { NgIf } from '@angular/common';
import { PrimeTemplate, ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AgentcardComponent } from '../../../../shared/components/agent-card/agent-card.component';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Toast } from 'primeng/toast';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { Diplome, DiplomeCreateUpdateRequest } from '../../models/diplomes/diplome.model';
import { DiplomesService } from '../../services/diplomes/diplomes.service';
import {
  DIPLOME_ETABLISSEMENTS,
  DIPLOME_MENTIONS,
  DIPLOME_NIVEAUX,
  DIPLOME_SPECIALITES
} from '../../../onboarding/constants/diplome-options.constants';

@Component({
  selector: 'app-consultation-des-diplomes',
  standalone: true,
  providers: [ConfirmationService, MessageService],
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Dialog,
    InputText,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    NgIf,
    PrimeTemplate,
    AgentcardComponent,
    TableModule,
    ButtonDirective,
    TooltipModule,
    ConfirmDialogModule,
    DropdownModule,
    AutoCompleteModule,
    DatePicker,
    FloatLabelModule,
    Toast
  ],
  templateUrl: './consultation-des-diplomes.component.html',
  styleUrls: ['./consultation-des-diplomes.component.scss']
})
export class ConsultationDesDiplomesComponent implements OnInit {
  @ViewChild('diplomeForm') diplomeForm?: NgForm;
  searchDiplome = '';
  displayViewDialog = false;
  selectedDiplome: Diplome | null = null;

  diplomes: Diplome[] = [];

  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editDiplomeId: number | null = null;

  formDiplome: any = {};

  readonly niveauxList: string[] = DIPLOME_NIVEAUX;
  readonly specialitesList: string[] = DIPLOME_SPECIALITES;
  readonly etablissementsList: string[] = DIPLOME_ETABLISSEMENTS;
  readonly mentionsList: string[] = DIPLOME_MENTIONS;

  niveauSuggestions: string[] = [];
  specialiteSuggestions: string[] = [];
  etablissementSuggestions: string[] = [];

  selectedFile: File | null = null;

  constructor(
    private diplomesService: DiplomesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDiplomes();
  }

  loadDiplomes(): void {
    this.diplomesService.getAll().subscribe({
      next: (page) => {
        this.diplomes = page.content;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur lors du chargement des diplômes:', err)
    });
  }

  onViewDiplome(item: Diplome) {
    this.selectedDiplome = {
      ...item,
      dateObtention: item.dateObtention ? (new Date(item.dateObtention) as any) : null as any
    };
    this.displayViewDialog = true;
  }

  applySearch() { /* server-side filtering not wired yet */ }

  clear(table: Table) {
    this.searchDiplome = '';
    table.clear();
    this.applySearch();
  }

  filterNiveau(event: { query: string }) {
    this.niveauSuggestions = this.filterList(this.niveauxList, event.query);
  }
  filterSpecialite(event: { query: string }) {
    this.specialiteSuggestions = this.filterList(this.specialitesList, event.query);
  }
  filterEtablissement(event: { query: string }) {
    this.etablissementSuggestions = this.filterList(this.etablissementsList, event.query);
  }
  private filterList(list: string[], q: string): string[] {
    const needle = (q || '').trim().toLowerCase();
    if (!needle) return list.slice(0, 30);
    return list.filter(v => v.toLowerCase().includes(needle));
  }

  showAddDialog() {
    this.dialogMode = 'add';
    this.editDiplomeId = null;
    this.selectedFile = null;
    this.formDiplome = {
      agentId: 1,
      agentMatricule: 'EMP001',
      dateObtention: null,
      niveau: '',
      etablissement: '',
      specialite: '',
      codePays: 'MA',
      mention: '',
      moyenne: undefined
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.diplomeForm?.resetForm();
      this.formDiplome = {
        agentId: 1,
        agentMatricule: 'EMP001',
        dateObtention: null,
        niveau: '',
        etablissement: '',
        specialite: '',
        codePays: 'MA',
        mention: '',
        moyenne: undefined
      };
    });
  }

  onEditDiplome(d: Diplome) {
    this.dialogMode = 'edit';
    this.editDiplomeId = d.id;
    this.selectedFile = null;
    this.formDiplome = {
      agentId: d.agentId || 1,
      agentMatricule: d.agentMatricule,
      dateObtention: d.dateObtention ? new Date(d.dateObtention) : null,
      niveau: d.niveau || '',
      etablissement: d.etablissement || '',
      specialite: d.specialite || '',
      codePays: d.codePays,
      mention: d.mention,
      moyenne: d.moyenne,
      scanFileName: d.scanFileName,
      scanUrl: d.scanUrl
    };
    this.displayDialog = true;
    setTimeout(() => {
      const saved = { ...this.formDiplome };
      this.diplomeForm?.control.markAsPristine();
      this.diplomeForm?.control.markAsUntouched();
      this.formDiplome = saved;
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        ToastHelper.showError(this.messageService, 'Type de fichier non autorisé. Types acceptés : PDF, JPEG, PNG');
        input.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        ToastHelper.showError(this.messageService, 'La taille du fichier dépasse la limite de 10 MB');
        input.value = '';
        return;
      }
      this.selectedFile = file;
    }
  }

  clearFile(fileInput: HTMLInputElement) {
    this.selectedFile = null;
    fileInput.value = '';
  }

  saveDiplome() {
    if (!this.validateForm(this.formDiplome)) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: DiplomeCreateUpdateRequest = {
      agentId: this.formDiplome.agentId,
      dateObtention: this.toIsoDate(this.formDiplome.dateObtention),
      niveau: (this.formDiplome.niveau || '').trim(),
      etablissement: (this.formDiplome.etablissement || '').trim() || undefined,
      specialite: (this.formDiplome.specialite || '').trim() || undefined,
      codePays: this.formDiplome.codePays,
      mention: this.formDiplome.mention,
      moyenne: this.formDiplome.moyenne
    };

    if (this.dialogMode === 'add') {
      this.diplomesService.add(payload).subscribe({
        next: (created) => this.afterCreateUpdate(created.id, true),
        error: (err) => console.error('Erreur lors de l\'ajout du diplôme:', err)
      });
    } else if (this.dialogMode === 'edit' && this.editDiplomeId !== null) {
      this.diplomesService.update(this.editDiplomeId, payload).subscribe({
        next: () => this.afterCreateUpdate(this.editDiplomeId!, false),
        error: (err) => console.error('Erreur lors de la modification du diplôme:', err)
      });
    }
  }

  private afterCreateUpdate(id: number, isAdd: boolean) {
    const success = () => {
      this.displayDialog = false;
      isAdd ? ToastHelper.showAdd(this.messageService) : ToastHelper.showEdit(this.messageService);
      this.loadDiplomes();
    };
    if (this.selectedFile) {
      this.diplomesService.uploadScan(id, this.selectedFile).subscribe({
        next: success,
        error: success
      });
    } else {
      success();
    }
  }

  onDeleteScan(d: Diplome) {
    this.confirmationService.confirm({
      message: 'Supprimer le scan de ce diplôme ?',
      accept: () => {
        this.diplomesService.deleteScan(d.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Scan supprimé' });
            this.loadDiplomes();
          },
          error: (err) => console.error('Erreur lors de la suppression du scan:', err)
        });
      }
    });
  }

  onDeleteScanById(id: number | null) {
    if (id) this.onDeleteScan({ id } as Diplome);
  }

  onDeleteDiplome(d: Diplome) {
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.diplomesService.delete(d.id).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadDiplomes();
        },
        error: (err) => console.error('Erreur lors de la suppression du diplôme:', err)
      });
    });
  }

  private validateForm(form: any): boolean {
    return !!(form.dateObtention && form.niveau && form.codePays?.trim() && form.mention?.trim());
  }

  private toIsoDate(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
