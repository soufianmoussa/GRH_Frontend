import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import {Button, ButtonDirective} from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import {Dialog} from 'primeng/dialog';
import {DropdownModule} from 'primeng/dropdown';
import {DatePicker} from 'primeng/datepicker';
import {Diplome, DiplomeCreateUpdateRequest} from '../../../models/diplomes/diplome.model';
import {DiplomesService} from '../../../services/diplomes/diplomes.service';
import {TypeEtablissementService} from '../../../services/diplomes/type-etablissement.service';
import {FormationInitialeService} from '../../../services/diplomes/formation-initiale.service';
import {EtablissementService} from '../../../services/diplomes/etablissement.service';
import {NiveauDiplomeService} from '../../../services/diplomes/niveau-diplome.service';
import {SpecialiteService} from '../../../services/diplomes/specialite.service';
import {TypeEtablissement} from '../../../models/diplomes/type-etablissement.model';
import {FormationInitiale} from '../../../models/diplomes/formation-initiale.model';
import {Etablissement} from '../../../models/diplomes/etablissement.model';
import {NiveauDiplome} from '../../../models/diplomes/niveau-diplome.model';
import {Specialite} from '../../../models/diplomes/specialite.model';
import {AgentService} from '../../../../dossier-agent/services/agent.service';
import {AgentModel} from '../../../../../models/Agent.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../../../../shared/utils/toast-helper';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-diplomes',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, TableModule, Button, InputText, FormsModule, PrimeTemplate,
    Dialog, DropdownModule, ButtonDirective, DatePicker, Toast,
    ConfirmDialogModule, FloatLabelModule, Tabs, TabList, Tab, TabPanels,
    TabPanel, TooltipModule, NgIf
  ],
  templateUrl: './diplomes.component.html',
  styleUrls: ['./diplomes.component.scss']
})
export class DiplomesComponent implements OnInit {

  diplomes: Diplome[] = [];
  loading = true;
  searchValue = '';

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selectedDiplome: Diplome | null = null;
  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  typesEtablissement: TypeEtablissement[] = [];
  specialites: Specialite[] = [];
  etablissements: Etablissement[] = [];
  niveaux: NiveauDiplome[] = [];
  formationsInitiales: FormationInitiale[] = [];
  agents: AgentModel[] = [];

  // File upload
  selectedFile: File | null = null;

  constructor(
    private diplomesService: DiplomesService,
    private typeEtablissementService: TypeEtablissementService,
    private formationInitialeService: FormationInitialeService,
    private etablissementService: EtablissementService,
    private niveauDiplomeService: NiveauDiplomeService,
    private specialiteService: SpecialiteService,
    private agentService: AgentService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadDiplomes();
    this.loadDropdownData();
  }

  onMoyenneChange() {
    const value = this.form.moyenne;
    if (value == null) {
      this.form.mention = null;
    } else if (value > 20) {
      this.form.mention = null;
    } else if (value >= 16) {
      this.form.mention = 'Très Bien';
    } else if (value >= 14) {
      this.form.mention = 'Bien';
    } else if (value >= 12) {
      this.form.mention = 'Assez Bien';
    } else if (value >= 10) {
      this.form.mention = 'Passable';
    } else {
      this.form.mention = null;
    }
  }

  loadDropdownData() {
    this.typeEtablissementService.getAll(0, 1000).subscribe(res => this.typesEtablissement = res.content);
    this.specialiteService.getAll(0, 1000).subscribe(res => this.specialites = res.content);
    this.etablissementService.getAll(0, 1000).subscribe(res => this.etablissements = res.content);
    this.niveauDiplomeService.getAll(0, 1000).subscribe(res => this.niveaux = res.content);
    this.formationInitialeService.getAll(0, 1000).subscribe(res => this.formationsInitiales = res.content);
    this.agentService.getAll().subscribe(res => this.agents = res);
  }

  loadDiplomes() {
    this.loading = true;
    this.diplomesService.getAll(0, 500).subscribe({
      next: (res) => {
        this.diplomes = res?.content ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        ToastHelper.showLoadError(this.messageService);
        this.diplomes = [];
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    this.loadDiplomes();
  }

  @ViewChild('dtDip') table!: Table;

  clearTable(table: Table) {
    this.searchValue = '';
    table.clear();
    this.applySearch();
  }

  onView(dp: Diplome) {
    this.selectedDiplome = dp;
    this.displayView = true;
  }

  showAddDiplome() {
    this.dialogMode = 'add';
    this.selectedFile = null;
    this.form = { codePays: 'MA', moyenne: null, mention: null };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(dp: Diplome) {
    this.dialogMode = 'edit';
    this.selectedFile = null;
    this.form = {
      id: dp.id,
      agentId: dp.agentId,
      dateObtention: dp.dateObtention ? new Date(dp.dateObtention) : null,
      niveauId: dp.niveau?.id,
      etablissementId: dp.etablissement?.id,
      specialiteId: dp.specialite?.id,
      codePays: dp.codePays,
      mention: dp.mention,
      moyenne: dp.moyenne,
      scanFileName: dp.scanFileName,
      scanUrl: dp.scanUrl
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
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

  onDeleteScan(dp: Diplome) {
    this.confirmationService.confirm({
      message: 'Supprimer le scan de ce diplôme ?',
      accept: () => {
        this.diplomesService.deleteScan(dp.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Scan supprimé' });
            this.loadDiplomes();
            // Also update the form if editing
            if (this.form.id === dp.id) {
              this.form.scanFileName = null;
              this.form.scanUrl = null;
            }
          },
          error: (err) => ToastHelper.showDeleteError(this.messageService, err.error?.message)
        });
      }
    });
  }

  onDeleteScanById(id: number) {
    this.onDeleteScan({ id } as Diplome);
  }

  save() {
    const f = this.form;
    if (!f.agentId || !f.dateObtention || !f.niveauId ||
        !f.etablissementId || !f.specialiteId || !f.codePays?.trim() || f.moyenne == null) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    if (f.moyenne < 10 || f.moyenne > 20) {
      ToastHelper.showError(this.messageService, 'La moyenne doit être comprise entre 10 et 20');
      return;
    }

    const payload: DiplomeCreateUpdateRequest = {
      agentId: f.agentId,
      dateObtention: this.toIsoDate(f.dateObtention),
      niveauId: f.niveauId,
      etablissementId: f.etablissementId,
      specialiteId: f.specialiteId,
      codePays: f.codePays.trim(),
      mention: f.mention,
      moyenne: f.moyenne
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
        error: (err) => ToastHelper.showAddError(this.messageService, err.error?.message)
      });
    } else {
      this.diplomesService.update(f.id, payload).subscribe({
        next: () => {
          if (this.selectedFile) {
            this.diplomesService.uploadScan(f.id, this.selectedFile).subscribe({
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
        error: (err) => ToastHelper.showUpdateError(this.messageService, err.error?.message)
      });
    }
  }

  onDelete(dp: Diplome) {
    if (!dp.id) return;
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.diplomesService.delete(dp.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadDiplomes();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err.error?.message)
      });
    }, `Supprimer ce diplôme ?`);
  }

  private toIsoDate(value: any): string  {
    if (!value || !(value instanceof Date)) return value;
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
