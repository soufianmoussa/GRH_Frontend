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
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Toast } from 'primeng/toast';
import { ToastHelper } from '../../shared/utils/toast-helper';
import { Formation } from '../../models/formation.model';
import { FormationService } from '../../services/AdminService/Formation/formation.service';

@Component({
  selector: 'app-consultation-formations',
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
    DatePicker,
    FloatLabelModule,
    Toast
  ],
  templateUrl: './consultation-formations.component.html',
  styleUrls: ['./consultation-formations.component.scss']
})
export class ConsultationFormationsComponent implements OnInit {
  @ViewChild('formationForm') formationForm?: NgForm;
  searchTerm: string = '';
  displayViewDialog: boolean = false;
  selectedFormation: Formation | null = null;

  formations: Formation[] = [];

  displayDialog: boolean = false;
  dialogMode: 'add' | 'edit' = 'add';
  editFormationId: number | null = null;

  currentFormation: Partial<Formation> = this.emptyForm();

  // File upload
  selectedFile: File | null = null;

  constructor(
    private formationService: FormationService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.formationService.getAll().subscribe({
      next: (page) => {
        this.formations = page.content;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des formations:', err);
      }
    });
  }

  onViewFormation(f: Formation) {
    this.selectedFormation = {
      ...f,
      dateDebut: f.dateDebut ? new Date(f.dateDebut) : null as any,
      dateFin: f.dateFin ? new Date(f.dateFin) : null as any
    };
    this.displayViewDialog = true;
  }

  applySearch() {

  }

  clear(table: Table) {
    this.searchTerm = '';
    table.clear();
    this.applySearch();
  }

  showAddDialog() {
    this.dialogMode = 'add';
    this.editFormationId = null;
    this.selectedFile = null;
    this.currentFormation = this.emptyForm();
    this.displayDialog = true;
    setTimeout(() => {
      this.formationForm?.resetForm();
      this.currentFormation = this.emptyForm();
    });
  }

  onEditFormation(f: Formation) {
    this.dialogMode = 'edit';
    this.editFormationId = f.id;
    this.selectedFile = null;
    this.currentFormation = {
      intituleStage: f.intituleStage,
      dateDebut: f.dateDebut ? new Date(f.dateDebut) : null as any,
      dateFin: f.dateFin ? new Date(f.dateFin) : null as any,
      intituleFormation: f.intituleFormation,
      certificateFileName: f.certificateFileName,
      certificateUrl: f.certificateUrl
    };
    this.displayDialog = true;
    setTimeout(() => {
      const saved = { ...this.currentFormation };
      this.formationForm?.control.markAsPristine();
      this.formationForm?.control.markAsUntouched();
      this.currentFormation = saved;
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

  saveFormation() {
    if (!this.validateForm(this.currentFormation)) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.currentFormation,
      dateDebut: this.toIsoDate(this.currentFormation.dateDebut),
      dateFin: this.toIsoDate(this.currentFormation.dateFin)
    };

    if (this.dialogMode === 'add') {
      this.formationService.add(payload).subscribe({
        next: (created) => {
          if (this.selectedFile) {
            this.formationService.uploadCertificate(created.id, this.selectedFile).subscribe({
              next: () => {
                this.displayDialog = false;
                ToastHelper.showAdd(this.messageService);
                this.loadFormations();
              },
              error: (err) => {
                console.error('Erreur lors de l\'upload du certificat:', err);
                this.displayDialog = false;
                ToastHelper.showAdd(this.messageService);
                this.loadFormations();
              }
            });
          } else {
            this.displayDialog = false;
            ToastHelper.showAdd(this.messageService);
            this.loadFormations();
          }
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de la formation:', err);
        }
      });
    } else if (this.dialogMode === 'edit' && this.editFormationId !== null) {
      this.formationService.update(this.editFormationId, payload).subscribe({
        next: () => {
          if (this.selectedFile) {
            this.formationService.uploadCertificate(this.editFormationId!, this.selectedFile).subscribe({
              next: () => {
                this.displayDialog = false;
                ToastHelper.showEdit(this.messageService);
                this.loadFormations();
              },
              error: (err) => {
                console.error('Erreur lors de l\'upload du certificat:', err);
                this.displayDialog = false;
                ToastHelper.showEdit(this.messageService);
                this.loadFormations();
              }
            });
          } else {
            this.displayDialog = false;
            ToastHelper.showEdit(this.messageService);
            this.loadFormations();
          }
        },
        error: (err) => {
          console.error('Erreur lors de la modification de la formation:', err);
        }
      });
    }
  }

  onDeleteCertificate(f: Formation) {
    this.confirmationService.confirm({
      message: 'Supprimer le certificat de cette formation ?',
      accept: () => {
        this.formationService.deleteCertificate(f.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Certificat supprimé' });
            this.loadFormations();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression du certificat:', err);
          }
        });
      }
    });
  }

  onDeleteCertificateById(id: number | null) {
    if (id) this.onDeleteCertificate({ id } as Formation);
  }

  onDeleteFormation(f: Formation) {
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.formationService.delete(f.id).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadFormations();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la formation:', err);
        }
      });
    });
  }

  private validateForm(form: any): boolean {
    return !!(form.intituleStage?.trim() && form.dateDebut && form.dateFin && form.intituleFormation?.trim());
  }

  private emptyForm(): Partial<Formation> {
    return {
      intituleStage: '',
      dateDebut: '',
      dateFin: '',
      intituleFormation: ''
    };
  }

  private toIsoDate(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
