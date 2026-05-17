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
import { AgentcardComponent } from '../../shared/components/agent-card/agent-card.component';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Toast } from 'primeng/toast';
import { ToastHelper } from '../../shared/utils/toast-helper';
import { Diplome, DiplomeCreateUpdateRequest } from '../../models/diplomes/diplome.model';
import { DiplomesService } from '../../services/AdminService/Diplomes/diplomes.service';
import { TypeEtablissementService } from '../../services/AdminService/Diplomes/type-etablissement.service';
import { FormationInitialeService } from '../../services/AdminService/Diplomes/formation-initiale.service';
import { EtablissementService } from '../../services/AdminService/Diplomes/etablissement.service';
import { NiveauDiplomeService } from '../../services/AdminService/Diplomes/niveau-diplome.service';
import { SpecialiteService } from '../../services/AdminService/Diplomes/specialite.service';
import { TypeEtablissement } from '../../models/diplomes/type-etablissement.model';
import { FormationInitiale } from '../../models/diplomes/formation-initiale.model';
import { Etablissement } from '../../models/diplomes/etablissement.model';
import { NiveauDiplome } from '../../models/diplomes/niveau-diplome.model';
import { Specialite } from '../../models/diplomes/specialite.model';

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

  typesEtablissement: TypeEtablissement[] = [];
  specialites: Specialite[] = [];
  etablissements: Etablissement[] = [];
  niveaux: NiveauDiplome[] = [];
  formationsInitiales: FormationInitiale[] = [];

  mentions = [
    { code: 'Passable', label: 'Passable' },
    { code: 'Assez bien', label: 'Assez bien' },
    { code: 'Bien', label: 'Bien' },
    { code: 'Très bien', label: 'Très bien' }
  ];

  // File upload
  selectedFile: File | null = null;

  constructor(
    private diplomesService: DiplomesService,
    private typeEtablissementService: TypeEtablissementService,
    private formationInitialeService: FormationInitialeService,
    private etablissementService: EtablissementService,
    private niveauDiplomeService: NiveauDiplomeService,
    private specialiteService: SpecialiteService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDiplomes();
    this.loadDropdownData();
  }

  loadDropdownData() {
    this.typeEtablissementService.getAll(0, 1000).subscribe(res => this.typesEtablissement = res.content);
    this.specialiteService.getAll(0, 1000).subscribe(res => this.specialites = res.content);
    this.etablissementService.getAll(0, 1000).subscribe(res => this.etablissements = res.content);
    this.niveauDiplomeService.getAll(0, 1000).subscribe(res => this.niveaux = res.content);
    this.formationInitialeService.getAll(0, 1000).subscribe(res => this.formationsInitiales = res.content);
  }

  get filteredSpecialites(): Specialite[] {
    if (!this.formDiplome.formationInitialeId) {
      return this.specialites;
    }
    return this.specialites.filter(s => s.formationInitiale?.id === this.formDiplome.formationInitialeId);
  }

  loadDiplomes(): void {
    this.diplomesService.getAll().subscribe({
      next: (page) => {
        this.diplomes = page.content;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des diplômes:', err);
      }
    });
  }

  onViewDiplome(item: Diplome) {
    this.selectedDiplome = {
      ...item,
      dateObtention: item.dateObtention ? new Date(item.dateObtention) : null as any
    };
    this.displayViewDialog = true;
  }

  applySearch() {

  }

  clear(table: Table) {
    this.searchDiplome = '';
    table.clear();
    this.applySearch();
  }

  showAddDialog() {
    this.dialogMode = 'add';
    this.editDiplomeId = null;
    this.selectedFile = null;
    this.formDiplome = {
      agentId: 1,
      agentMatricule: 'EMP001',
      dateObtention: null,
      formationInitialeId: null,
      niveauId: null,
      etablissementId: null,
      specialiteId: null,
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
        formationInitialeId: null,
        niveauId: null,
        etablissementId: null,
        specialiteId: null,
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
      formationInitialeId: d.specialite?.formationInitiale?.id,
      niveauId: d.niveau?.id,
      etablissementId: d.etablissement?.id,
      specialiteId: d.specialite?.id,
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
      niveauId: this.formDiplome.niveauId,
      etablissementId: this.formDiplome.etablissementId,
      specialiteId: this.formDiplome.specialiteId,
      codePays: this.formDiplome.codePays,
      mention: this.formDiplome.mention,
      moyenne: this.formDiplome.moyenne
    };

    if (this.dialogMode === 'add') {
      this.diplomesService.add(payload).subscribe({
        next: (created) => {
          if (this.selectedFile) {
            this.diplomesService.uploadScan(created.id, this.selectedFile).subscribe({
              next: () => {
                this.displayDialog = false;
                ToastHelper.showAdd(this.messageService);
                this.loadDiplomes();
              },
              error: (err) => {
                console.error('Erreur lors de l\'upload du scan:', err);
                this.displayDialog = false;
                ToastHelper.showAdd(this.messageService);
                this.loadDiplomes();
              }
            });
          } else {
            this.displayDialog = false;
            ToastHelper.showAdd(this.messageService);
            this.loadDiplomes();
          }
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du diplôme:', err);
        }
      });
    } else if (this.dialogMode === 'edit' && this.editDiplomeId !== null) {
      this.diplomesService.update(this.editDiplomeId, payload).subscribe({
        next: () => {
          if (this.selectedFile) {
            this.diplomesService.uploadScan(this.editDiplomeId!, this.selectedFile).subscribe({
              next: () => {
                this.displayDialog = false;
                ToastHelper.showEdit(this.messageService);
                this.loadDiplomes();
              },
              error: (err) => {
                console.error('Erreur lors de l\'upload du scan:', err);
                this.displayDialog = false;
                ToastHelper.showEdit(this.messageService);
                this.loadDiplomes();
              }
            });
          } else {
            this.displayDialog = false;
            ToastHelper.showEdit(this.messageService);
            this.loadDiplomes();
          }
        },
        error: (err) => {
          console.error('Erreur lors de la modification du diplôme:', err);
        }
      });
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
          error: (err) => {
            console.error('Erreur lors de la suppression du scan:', err);
          }
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
        error: (err) => {
          console.error('Erreur lors de la suppression du diplôme:', err);
        }
      });
    });
  }

  private validateForm(form: any): boolean {
    return !!(form.dateObtention && form.formationInitialeId && form.niveauId && form.etablissementId && form.specialiteId && form.codePays?.trim() && form.mention?.trim());
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
