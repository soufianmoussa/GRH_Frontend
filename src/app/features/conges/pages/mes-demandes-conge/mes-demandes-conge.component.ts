import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatePipe, NgIf, NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonDirective } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { Calendar } from 'primeng/calendar';
import { Toast } from 'primeng/toast';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { DemandeCongeDto, DemandeCongeRequest } from '../conge/conge.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../../core/auth/auth.service';

export interface StoredFileDto {
  id: number;
  originalFileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  fileCategory: string;
  agentId: number | null;
  demandeCongeId: number | null;
  url: string;
}

@Component({
  selector: 'app-mes-demandes-conge',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TagModule,
    ButtonDirective,
    DialogModule,
    DropdownModule,
    Calendar,
    Toast,
    ConfirmDialogModule,
    InputText,
    InputTextarea,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './mes-demandes-conge.component.html',
  styleUrl: './mes-demandes-conge.component.scss'
})
export class MesDemandesCongeComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('editFileInput') editFileInput!: ElementRef<HTMLInputElement>;


  private agentId: number | null = null;
  private readonly API_BASE = 'http://localhost:8080/api';

  demandes: DemandeCongeDto[] = [];
  loading = true;
  searchValue = '';


  viewDialogVisible = false;
  selectedDemande: DemandeCongeDto | null = null;


  editDialogVisible = false;
  editForm!: FormGroup;
  editingDemande: DemandeCongeDto | null = null;


  cancelDialogVisible = false;
  cancellingDemande: DemandeCongeDto | null = null;

  categories = [
    { label: 'Cong� annuel', value: 'ANNUEL' },
    { label: 'Cong� de maladie', value: 'MALADIE' },
    { label: 'Cong� de maternit�', value: 'MATERNITE' },
    { label: 'Cong� de paternit�', value: 'PATERNITE' },
    { label: 'Cong� sans solde', value: 'SANS_SOLDE' },
    { label: 'Cong� exceptionnel', value: 'EXCEPTIONNEL' },
    { label: 'Cong� compensatoire', value: 'COMPENSATOIRE' }
  ];


  documents: StoredFileDto[] = [];
  documentsLoading = false;


  editDocuments: StoredFileDto[] = [];
  editDocumentsLoading = false;
  editSelectedFile: File | null = null;
  editDocCategory: string | null = null;
  editUploading = false;


  deleteDocDialogVisible = false;
  deletingDocument: StoredFileDto | null = null;

  fileCategories = [
    { label: 'Justificatif de cong�', value: 'LEAVE_JUSTIFICATION' },
    { label: 'Certificat m�dical', value: 'MEDICAL_CERTIFICATE' },
    { label: 'Pi�ce jointe', value: 'LEAVE_ATTACHMENT' }
  ];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.editForm = this.fb.group({
      type: [null],
      dateDebut: [null],
      dateFin: [null],
      commentaire: ['']
    });
    this.agentId = this.authService.getAgentId();
    if (this.agentId == null) {
      this.loading = false;
      ToastHelper.showError(this.messageService,
        "Aucun agent n'est associ� � votre compte.");
      return;
    }
    this.loadDemandes();
  }



  loadDemandes() {
    if (this.agentId == null) return;
    this.loading = true;
    this.http.get<DemandeCongeDto[]>(
      `${this.API_BASE}/demandes-conges/agent/${this.agentId}`
    ).subscribe({
      next: (res: DemandeCongeDto[]) => {
        this.demandes = res;
        this.loading = false;
      },
      error: (err: any) => {
        const msg = err.status === 0
          ? 'Erreur de connexion au serveur.'
          : 'Erreur lors du chargement des donn�es';
        ToastHelper.showError(this.messageService, msg);
        this.loading = false;
      }
    });
  }



  getStatusSeverity(statut: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (statut) {
      case 'EN_ATTENTE': return 'warn';
      case 'APPROUVEE': return 'success';
      case 'REJETEE': return 'danger';
      case 'ANNULEE': return 'secondary';
      default: return 'info';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'APPROUVEE': return 'Approuv�e';
      case 'REJETEE': return 'Rejet�e';
      case 'ANNULEE': return 'Annul�e';
      default: return statut;
    }
  }

  getStatusIcon(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'pi pi-clock';
      case 'APPROUVEE': return 'pi pi-check';
      case 'REJETEE': return 'pi pi-times';
      case 'ANNULEE': return 'pi pi-ban';
      default: return 'pi pi-info-circle';
    }
  }

  getTypeLabel(type: string): string {
    const cat = this.categories.find(c => c.value === type);
    return cat ? cat.label : type;
  }

  isPending(demande: DemandeCongeDto | null): boolean {
    return demande?.statut === 'EN_ATTENTE';
  }

  isApproved(demande: DemandeCongeDto | null): boolean {
    return demande?.statut === 'APPROUVEE';
  }

  canEdit(demande: DemandeCongeDto): boolean {
    return this.isPending(demande) || this.isApproved(demande);
  }



  onView(demande: DemandeCongeDto) {
    this.selectedDemande = demande;
    this.viewDialogVisible = true;
    this.documents = [];
    this.loadDocuments(demande.id);
  }



  onEdit(demande: DemandeCongeDto) {
    if (!this.canEdit(demande)) {
      ToastHelper.showWarn(this.messageService,
        'Cette demande ne peut pas �tre modifi�e.');
      return;
    }

    this.editingDemande = demande;
    this.editDocuments = [];
    this.editSelectedFile = null;
    this.editDocCategory = null;
    this.loadEditDocuments(demande.id);



    this.editDialogVisible = true;

    if (this.isPending(demande)) {
      setTimeout(() => {
        this.editForm.patchValue({
          type: demande.type,
          dateDebut: new Date(demande.dateDebut),
          dateFin: new Date(demande.dateFin),
          commentaire: demande.commentaire || ''
        });
      });
    }
  }

  calculateEditDuree(): number {
    const start = this.editForm.get('dateDebut')?.value;
    const end = this.editForm.get('dateFin')?.value;
    if (!start || !end || end < start) return 0;

    let count = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  submitEdit() {
    if (!this.editingDemande) return;

    const start = this.editForm.get('dateDebut')?.value;
    const end = this.editForm.get('dateFin')?.value;
    const type = this.editForm.get('type')?.value;

    if (!start || !end || !type) {
      ToastHelper.showWarn(this.messageService, 'Veuillez remplir tous les champs.');
      return;
    }

    if (end < start) {
      ToastHelper.showWarn(this.messageService,
        'La date de fin doit �tre apr�s la date de d�but.');
      return;
    }

    const duree = this.calculateEditDuree();
    if (duree <= 0) {
      ToastHelper.showWarn(this.messageService,
        'Aucun jour ouvrable s�lectionn�.');
      return;
    }

    if (this.agentId == null) {
      ToastHelper.showError(this.messageService,
        "Aucun agent n'est associ� � votre compte.");
      return;
    }

    const commentaire = this.editForm.get('commentaire')?.value?.trim();
    const request: DemandeCongeRequest = {
      agentId: this.agentId,
      type,
      dateDebut: this.formatDateISO(start),
      dateFin: this.formatDateISO(end),
      ...(commentaire ? { commentaire } : {})
    };

    this.http.put<DemandeCongeDto>(
      `${this.API_BASE}/demandes-conges/${this.editingDemande.id}`, request
    ).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Demande modifi�e avec succ�s.');
        this.editDialogVisible = false;
        this.editingDemande = null;
        this.loadDemandes();
      },
      error: (err: any) => {
        const msg = err?.error?.message || "�chec de la modification.";
        ToastHelper.showError(this.messageService, msg);
      }
    });
  }



  onCancel(demande: DemandeCongeDto) {
    if (!this.isPending(demande)) {
      ToastHelper.showWarn(this.messageService,
        'Seules les demandes en attente peuvent �tre annul�es.');
      return;
    }

    this.cancellingDemande = demande;
    this.cancelDialogVisible = true;
  }

  confirmCancel() {
    if (!this.cancellingDemande) return;

    this.http.delete(
      `${this.API_BASE}/demandes-conges/${this.cancellingDemande.id}`
    ).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Demande annul�e avec succ�s.');
        this.cancelDialogVisible = false;
        this.cancellingDemande = null;
        this.loadDemandes();
      },
      error: (err: any) => {
        const msg = err?.error?.message || "�chec de l'annulation.";
        ToastHelper.showError(this.messageService, msg);
      }
    });
  }



  loadDocuments(demandeId: number) {
    this.documentsLoading = true;
    this.http.get<StoredFileDto[]>(
      `${this.API_BASE}/demandes-conges/${demandeId}/documents`
    ).subscribe({
      next: (res) => {
        this.documents = res;
        this.documentsLoading = false;
      },
      error: (err: any) => {
        const msg = err.status === 0
          ? 'Erreur de connexion au serveur.'
          : 'Erreur lors du chargement des documents.';
        ToastHelper.showError(this.messageService, msg);
        this.documentsLoading = false;
      }
    });
  }

  onViewDocument(doc: StoredFileDto) {
    window.open(doc.url, '_blank');
  }

  onDeleteDocument(doc: StoredFileDto) {
    this.deletingDocument = doc;
    this.deleteDocDialogVisible = true;
  }

  confirmDeleteDocument() {
    if (!this.deletingDocument || !this.editingDemande) return;

    this.http.delete(
      `${this.API_BASE}/demandes-conges/documents/${this.deletingDocument.id}`
    ).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Document supprim� avec succ�s.');
        this.deleteDocDialogVisible = false;
        this.deletingDocument = null;
        this.loadEditDocuments(this.editingDemande!.id);
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Erreur lors de la suppression.';
        ToastHelper.showError(this.messageService, msg);
      }
    });
  }



  loadEditDocuments(demandeId: number) {
    this.editDocumentsLoading = true;
    this.http.get<StoredFileDto[]>(
      `${this.API_BASE}/demandes-conges/${demandeId}/documents`
    ).subscribe({
      next: (res) => {
        this.editDocuments = res;
        this.editDocumentsLoading = false;
      },
      error: () => {
        ToastHelper.showError(this.messageService, 'Erreur lors du chargement des documents.');
        this.editDocumentsLoading = false;
      }
    });
  }

  onEditFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    this.editSelectedFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  uploadEditDocument() {
    if (!this.editingDemande || !this.editSelectedFile || !this.editDocCategory) return;

    const formData = new FormData();
    formData.append('file', this.editSelectedFile);

    this.editUploading = true;
    this.http.post<StoredFileDto>(
      `${this.API_BASE}/demandes-conges/${this.editingDemande.id}/documents?category=${this.editDocCategory}`,
      formData
    ).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Document upload� avec succ�s.');
        this.editSelectedFile = null;
        this.editDocCategory = null;
        this.editUploading = false;
        if (this.editFileInput) {
          this.editFileInput.nativeElement.value = '';
        }
        this.loadEditDocuments(this.editingDemande!.id);
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Erreur lors de l\'upload du document.';
        ToastHelper.showError(this.messageService, msg);
        this.editUploading = false;
      }
    });
  }

  getCategoryLabel(category: string): string {
    const cat = this.fileCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  getCategorySeverity(category: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (category) {
      case 'MEDICAL_CERTIFICATE': return 'danger';
      case 'LEAVE_JUSTIFICATION': return 'warn';
      case 'LEAVE_ATTACHMENT': return 'info';
      default: return 'secondary';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }



  private formatDateISO(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
