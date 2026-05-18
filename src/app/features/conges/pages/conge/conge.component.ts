import { Component, OnInit } from '@angular/core';
import { Calendar } from 'primeng/calendar';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgIf, NgFor } from '@angular/common';
import { ConfirmationService, MenuItem, MessageService, PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { InputText } from "primeng/inputtext";
import { InputTextarea } from "primeng/inputtextarea";
import { Stepper, StepList, StepPanels, StepPanel, Step, StepperSeparator } from 'primeng/stepper';
import { HttpClient } from '@angular/common/http';
import { HolidayService } from '../../services/holiday.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { TooltipModule } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TypeConge } from '../../../../models/typeConge.model';
import { TypeCongeService } from '../../services/type-conge/type-conge.service';
import { environment } from '../../../../../../environment';



export interface DemandeCongeDto {
  id: number;
  agentId: number;
  agentNom: string;
  agentPrenom: string;
  agentMatricule: string;
  type: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
  duree: number;
  dateCreation: string;
  commentaire: string | null;
}

export interface DemandeCongeRequest {
  agentId: number;
  type: string;
  dateDebut: string;
  dateFin: string;
  commentaire?: string;
}

export interface SoldeCongeDto {
  id: number;
  agentId: number;
  annee: number;
  typeConge: string;
  joursBase: number;
  joursReportes: number;
  joursAjustement: number;
}

@Component({
  selector: 'app-conge',
  imports: [
    Calendar,
    FormsModule,
    NgClass,
    NgIf,
    NgFor,
    PrimeTemplate,
    ButtonDirective,
    DatePipe,
    DropdownModule,
    InputText,
    InputTextarea,
    ReactiveFormsModule,
    Stepper, StepList, StepPanels, StepPanel, Step, StepperSeparator,
    TooltipModule,
    Toast,
    ProgressSpinner,
    ConfirmDialog,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './conge.component.html',
  styleUrl: './conge.component.scss'
})
export class CongeComponent implements OnInit {


  private agentId: number | null = null;
  private readonly API_BASE = `${environment.apiUrl}`;

  currentAgent = {
    nom: 'Jean Dupont',
    poste: 'D�veloppeur Fullstack',
    responsable: 'Sophie Martin'
  };

  exceptionalRequestForm: FormGroup;

  selectedDateRange: Date[] = [];
  startDateDefault: Date = new Date();
  minDate: Date = new Date();

  categories: { label: string; value: string }[] = [];
  typeCongeMap: Record<string, TypeConge> = {};

  items: MenuItem[] = [];
  activeStep: number = 1;


  existingRequests: DemandeCongeDto[] = [];


  solde: SoldeCongeDto | null = null;
  soldeRemaining: number | null = null;


  loadingSolde = false;
  submitting = false;


  holidaysLoaded = false;
  holidayDates: Date[] = [];


  attachmentFile: File | null = null;
  notes: string = '';


  typeHelpConfig: Record<string, { icon: string; title: string; hint: string; severity: string }> = {
    ANNUEL: {
      icon: 'pi pi-sun',
      title: 'Cong� annuel',
      hint: 'Votre solde disponible est affich� ci-dessous. Les jours sont d�compt�s automatiquement.',
      severity: 'info'
    },
    MALADIE: {
      icon: 'pi pi-heart',
      title: 'Cong� maladie',
      hint: 'Un justificatif m�dical (certificat) est requis. Veuillez joindre le document ci-dessous.',
      severity: 'warn'
    },
    MATERNITE: {
      icon: 'pi pi-users',
      title: 'Cong� de maternit�',
      hint: 'Dur�e l�gale : 14 semaines (98 jours). Peut �tre prolong� sur avis m�dical.',
      severity: 'info'
    },
    PATERNITE: {
      icon: 'pi pi-user',
      title: 'Cong� de paternit�',
      hint: 'Dur�e l�gale : 15 jours cons�cutifs � compter de la naissance.',
      severity: 'info'
    },
    SANS_SOLDE: {
      icon: 'pi pi-ban',
      title: 'Cong� sans solde',
      hint: 'Ce cong� n\'est pas r�mun�r�. Aucun solde ne sera d�compt�.',
      severity: 'warn'
    },
    EXCEPTIONNEL: {
      icon: 'pi pi-star',
      title: 'Cong� exceptionnel',
      hint: 'Accord� pour �v�nement familial (mariage, d�c�s, naissance). Justificatif requis.',
      severity: 'info'
    },
    COMPENSATOIRE: {
      icon: 'pi pi-replay',
      title: 'Cong� compensatoire',
      hint: 'R�cup�ration de jours travaill�s en heures suppl�mentaires. Limit� au solde acquis.',
      severity: 'warn'
    }
  };


  legendItems = [
    { label: 'Approuv�', color: '#22c55e', cssClass: 'legend-approved' },
    { label: 'En attente', color: '#f59e0b', cssClass: 'legend-pending' },
    { label: 'Refus�', color: '#ef4444', cssClass: 'legend-rejected' },
    { label: 'Annul�', color: '#9ca3af', cssClass: 'legend-cancelled' },
    { label: 'Jour f�ri�', color: '#7c3aed', cssClass: 'legend-holiday' },
    { label: 'Weekend', color: '#e5e7eb', cssClass: 'legend-weekend' }
  ];


  private updatingFromDuree = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private holidayService: HolidayService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private typeCongeService: TypeCongeService
  ) {
    this.exceptionalRequestForm = this.fb.group({
      dateRange: [null],
      category: null,
      duree: [{ value: null, disabled: true }]
    });
  }

  ngOnInit() {
    this.items = [
      { label: 'Saisie cong�' },
      { label: 'Confirmation' }
    ];
    this.agentId = this.authService.getAgentId();
    if (this.agentId == null) {
      ToastHelper.showError(this.messageService,
        "Aucun agent n'est associ� � votre compte. Impossible de charger vos demandes de cong�.");
      return;
    }
    this.loadLeaveTypes();
    this.loadExistingRequests();
    this.loadHolidays(new Date().getFullYear());
  }




  loadLeaveTypes(): void {
    this.typeCongeService.getActive().subscribe({
      next: (types: TypeConge[]) => {
        this.categories = types.map(t => ({ label: t.label, value: t.code }));
        types.forEach(t => this.typeCongeMap[t.code] = t);
      },
      error: () => ToastHelper.showError(this.messageService, 'Erreur lors du chargement des types de cong�.')
    });
  }

  loadExistingRequests() {
    if (this.agentId == null) return;
    this.http.get<DemandeCongeDto[]>(
      `${this.API_BASE}/demandes-conges/agent/${this.agentId}`
    ).subscribe({
      next: (res: DemandeCongeDto[]) => this.existingRequests = res,
      error: (err: any) => {
        const msg = err.status === 0
          ? 'Erreur de connexion au serveur.'
          : 'Erreur lors du chargement des donn�es';
        ToastHelper.showError(this.messageService, msg);
      }
    });
  }


  loadSolde() {
    const type = this.exceptionalRequestForm.get('category')?.value;
    if (!type || !this.showSolde || this.agentId == null) {
      this.solde = null;
      this.soldeRemaining = null;
      return;
    }

    const year = this.selectedDateRange.length > 0
      ? this.selectedDateRange[0].getFullYear()
      : new Date().getFullYear();

    this.loadingSolde = true;
    this.http.get<SoldeCongeDto>(
      `${this.API_BASE}/soldes-conges/agent/${this.agentId}/year/${year}/type/${type}`
    ).subscribe({
      next: (res: SoldeCongeDto) => {
        // Backend retourne toujours un DTO (� 0 si pas encore initialis�).
        // Les demandes APPROUVEE sont d�j� d�compt�es c�t� backend au moment de l'approbation,
        // on ne recalcule donc pas les "jours utilis�s" ici. On r�serve seulement les
        // demandes EN_ATTENTE (soft-reservation c�t� UX).
        this.solde = res;
        this.loadingSolde = false;

        const pendingDays = this.existingRequests
          .filter(r =>
            r.type === type &&
            r.statut === 'EN_ATTENTE' &&
            new Date(r.dateDebut).getFullYear() === year
          )
          .reduce((sum, r) => sum + (r.duree || 0), 0);

        const total = (res.joursBase || 0) + (res.joursReportes || 0) + (res.joursAjustement || 0);
        this.soldeRemaining = total - pendingDays;
      },
      error: (err: any) => {
        this.solde = null;
        this.soldeRemaining = null;
        this.loadingSolde = false;
        const msg = err.status === 0
          ? 'Erreur de connexion au serveur.'
          : (err.status === 403
            ? "Vous n'�tes pas autoris� � consulter ce solde."
            : 'Erreur lors du chargement du solde.');
        ToastHelper.showError(this.messageService, msg);
      }
    });
  }


  onCategoryChange() {
    this.loadSolde();
  }



  loadHolidays(year: number) {
    this.holidayService.getHolidays(year).subscribe({
      next: () => {
        this.holidaysLoaded = true;
        this.buildHolidayDates(year);
      },
      error: (err: any) => console.error('Failed to load holidays:', err)
    });
  }


  private buildHolidayDates(year: number) {
    const holidays = this.holidayService.getHolidayDatesForYear(year);
    const existing = this.holidayDates.map(d => d.getTime());
    holidays.forEach((dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00');
      if (!existing.includes(d.getTime())) {
        this.holidayDates = [...this.holidayDates, d];
      }
    });
  }

  onMonthChange(event: any) {
    if (event.year) {
      this.loadHolidays(event.year);
    }
  }




  private hasOverlap(): boolean {
    if (this.selectedDateRange.length < 2) return false;

    const newStart = this.selectedDateRange[0].getTime();
    const newEnd = this.selectedDateRange[1].getTime();

    return this.existingRequests.some(req => {

      if (req.statut !== 'EN_ATTENTE' && req.statut !== 'APPROUVEE') return false;
      const existStart = new Date(req.dateDebut).getTime();
      const existEnd = new Date(req.dateFin).getTime();
      return newStart <= existEnd && newEnd >= existStart;
    });
  }


  hasOverlapPublic(): boolean {
    return this.hasOverlap();
  }



  nextStep(activateCallback?: (step: number) => void) {
    if (this.activeStep === 1) {

      if (!this.selectedDateRange || this.selectedDateRange.length < 2) {
        ToastHelper.showWarn(this.messageService,
          'Veuillez s�lectionner une date de d�but et une date de fin.');
        return;
      }


      if (this.selectedDateRange[1] < this.selectedDateRange[0]) {
        ToastHelper.showWarn(this.messageService,
          'La date de fin doit �tre apr�s la date de d�but.');
        return;
      }


      if (!this.exceptionalRequestForm.get('category')?.value) {
        ToastHelper.showWarn(this.messageService,
          "Veuillez s�lectionner une cat�gorie d'absence.");
        return;
      }


      const duree = this.exceptionalRequestForm.get('duree')?.value;
      if (!duree || duree <= 0) {
        ToastHelper.showWarn(this.messageService,
          'Aucun jour ouvrable s�lectionn�.');
        return;
      }


      if (this.hasOverlap()) {
        ToastHelper.showWarn(this.messageService,
          'Chevauchement avec une autre demande existante.');
        return;
      }


      if (this.soldeRemaining !== null && duree > this.soldeRemaining) {
        ToastHelper.showWarn(this.messageService,
          `Solde de cong� insuffisant. Il vous reste ${this.soldeRemaining} jour(s).`);
        return;
      }
    }
    if (this.activeStep < 2) {
      this.activeStep++;
      if (activateCallback) activateCallback(this.activeStep);
    }
  }

  prevStep(activateCallback?: (step: number) => void) {
    if (this.activeStep > 1) {
      this.activeStep--;
      if (activateCallback) activateCallback(this.activeStep);
    }
  }



  confirmBeforeSubmit() {
    this.confirmationService.confirm({
      message: '�tes-vous s�r de vouloir envoyer cette demande de cong� ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, envoyer',
      rejectLabel: 'Annuler',
      accept: () => this.confirm()
    });
  }

  confirm() {
    if (!this.selectedDateRange || this.selectedDateRange.length < 2) {
      ToastHelper.showWarn(this.messageService, 'Veuillez s�lectionner une p�riode.');
      return;
    }

    if (this.agentId == null) {
      ToastHelper.showError(this.messageService,
        "Aucun agent n'est associ� � votre compte.");
      return;
    }

    const request: DemandeCongeRequest = {
      agentId: this.agentId,
      type: this.exceptionalRequestForm.get('category')?.value,
      dateDebut: this.formatDateISO(this.selectedDateRange[0]),
      dateFin: this.formatDateISO(this.selectedDateRange[1]),
      ...(this.notes.trim() ? { commentaire: this.notes.trim() } : {})
    };

    this.submitting = true;
    this.http.post<DemandeCongeDto>(
      `${this.API_BASE}/demandes-conges`, request
    ).subscribe({
      next: (created: DemandeCongeDto) => {

        if (this.attachmentFile && created.id) {
          this.uploadAttachment(created.id);
        } else {
          this.onSubmitSuccess();
        }
      },
      error: (err: any) => {
        this.submitting = false;
        const msg = err.status === 0
          ? 'Erreur de connexion au serveur.'
          : (err?.error?.message || "�chec de l'envoi de la demande. Veuillez r�essayer.");
        ToastHelper.showError(this.messageService, msg);
      }
    });
  }

  private uploadAttachment(demandeId: number) {
    if (!this.attachmentFile) return;

    const category = this.exceptionalRequestForm.get('category')?.value;
    const fileCategory = category === 'MALADIE' ? 'MEDICAL_CERTIFICATE' : 'LEAVE_JUSTIFICATION';

    const formData = new FormData();
    formData.append('file', this.attachmentFile);

    this.http.post(
      `${this.API_BASE}/demandes-conges/${demandeId}/documents?category=${fileCategory}`,
      formData
    ).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Document joint avec succ�s.');
        this.onSubmitSuccess();
      },
      error: (err: any) => {

        const msg = err?.error?.message || "La demande a �t� cr��e mais le document n'a pas pu �tre joint.";
        ToastHelper.showWarn(this.messageService, msg);
        this.onSubmitSuccess();
      }
    });
  }

  private onSubmitSuccess() {
    this.submitting = false;
    ToastHelper.showSuccess(this.messageService,
      'Votre demande de cong� a �t� envoy�e avec succ�s !');
    this.loadExistingRequests();
    this.loadSolde();
    this.activeStep = 1;
    this.exceptionalRequestForm.reset();
    this.resetDates();
  }



  onDateClick(date: any) {
    if (this.updatingFromDuree) return;

    const clickedDate = new Date(date.year, date.month, date.day);


    if (this.selectedDateRange.length === 0) {
      this.exceptionalRequestForm.get('duree')?.enable();
    }


    const day = clickedDate.getDay();
    if (day === 0 || day === 6) return;
    const dateStr = this.holidayService.toDateString(date);
    if (this.holidayService.isHoliday(dateStr)) return;
    if (!this.selectedDateRange.length) {
      this.selectedDateRange = [clickedDate];
    } else if (this.selectedDateRange.length === 1) {
      const startDate = this.selectedDateRange[0];
      this.selectedDateRange = clickedDate >= startDate
        ? [startDate, clickedDate]
        : [clickedDate, startDate];
    } else {
      this.selectedDateRange = [clickedDate];
    }
    this.exceptionalRequestForm.get('dateRange')?.setValue(this.selectedDateRange);


    if (this.selectedDateRange.length >= 1) {
      const startYear = this.selectedDateRange[0].getFullYear();
      this.loadHolidays(startYear);
      if (this.selectedDateRange.length === 2) {
        const endYear = this.selectedDateRange[1].getFullYear();
        if (endYear !== startYear) this.loadHolidays(endYear);
      }
    }

    this.calculateDuree();

    this.loadSolde();
  }


  calculateDuree() {
    if (this.selectedDateRange.length === 2) {
      const duree = this.holidayService.calculateWorkingDays(
        this.selectedDateRange[0], this.selectedDateRange[1]
      );
      this.exceptionalRequestForm.get('duree')?.setValue(duree, { emitEvent: false });
    } else {
      this.exceptionalRequestForm.get('duree')?.setValue(null, { emitEvent: false });
    }
  }




  onDureeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const dureeValue = parseInt(input.value, 10);

    if (!dureeValue || dureeValue <= 0 || this.selectedDateRange.length < 1) return;

    const startDate = this.selectedDateRange[0];
    const endDate = this.calculateEndDateFromDuree(startDate, dureeValue);

    if (endDate) {
      this.updatingFromDuree = true;
      this.selectedDateRange = [startDate, endDate];
      this.exceptionalRequestForm.get('dateRange')?.setValue(this.selectedDateRange);


      this.loadHolidays(endDate.getFullYear());

      setTimeout(() => { this.updatingFromDuree = false; }, 100);
    }
  }


  private calculateEndDateFromDuree(start: Date, workingDays: number): Date {
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    let counted = 0;

    while (counted < workingDays) {
      const dayOfWeek = current.getDay();
      const dateStr = this.holidayService.formatDatePublic(current);
      const isWeekendDay = (dayOfWeek === 0 || dayOfWeek === 6);
      const isHolidayDay = this.holidayService.isHoliday(dateStr);

      if (!isWeekendDay && !isHolidayDay) {
        counted++;
      }

      if (counted < workingDays) {
        current.setDate(current.getDate() + 1);
      }
    }

    return new Date(current);
  }



  resetDates() {
    this.selectedDateRange = [];
    this.exceptionalRequestForm.get('dateRange')?.reset();
    this.exceptionalRequestForm.get('duree')?.setValue(null);
    this.exceptionalRequestForm.get('duree')?.disable();
    this.solde = null;
    this.soldeRemaining = null;
    this.attachmentFile = null;
    this.notes = '';
  }



  isValidDate(date: any, type: 'start' | 'end' | 'range'): boolean {
    if (!this.selectedDateRange || this.selectedDateRange.length < 2) return false;
    const [start, end] = this.selectedDateRange;
    const current = new Date(date.year, date.month, date.day);
    if (type === 'start') return current.getTime() === start.getTime();
    if (type === 'end') return current.getTime() === end.getTime();
    if (type === 'range') return current > start && current < end;
    return false;
  }

  isHoliday(date: any): boolean {
    const dateStr = this.holidayService.toDateString(date);
    return this.holidayService.isHoliday(dateStr);
  }

  isWeekend(date: any): boolean {
    const d = new Date(date.year, date.month, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  getHolidayTooltip(date: any): string {
    const dateStr = this.holidayService.toDateString(date);
    return this.holidayService.getHolidayName(dateStr) || '';
  }

  getCategoryLabel(): string {
    const val = this.exceptionalRequestForm.get('category')?.value;
    const cat = this.categories.find(c => c.value === val);
    return cat ? cat.label : val || '';
  }

  private formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }




  getExistingRequestStatus(date: any): string | null {
    const current = new Date(date.year, date.month, date.day);
    current.setHours(0, 0, 0, 0);
    const currentTime = current.getTime();

    let found: string | null = null;
    const priority: Record<string, number> = {
      'APPROUVEE': 4, 'EN_ATTENTE': 3, 'REJETEE': 2, 'ANNULEE': 1
    };

    for (const req of this.existingRequests) {
      const start = new Date(req.dateDebut);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.dateFin);
      end.setHours(0, 0, 0, 0);

      if (currentTime >= start.getTime() && currentTime <= end.getTime()) {
        if (!found || (priority[req.statut] || 0) > (priority[found] || 0)) {
          found = req.statut;
        }
      }
    }
    return found;
  }


  getExistingRequestClass(date: any): string {
    const status = this.getExistingRequestStatus(date);
    if (!status) return '';
    const classMap: Record<string, string> = {
      'APPROUVEE': 'existing-approved',
      'EN_ATTENTE': 'existing-pending',
      'REJETEE': 'existing-rejected',
      'ANNULEE': 'existing-cancelled'
    };
    return classMap[status] || '';
  }


  getExistingRequestTooltip(date: any): string {
    const current = new Date(date.year, date.month, date.day);
    current.setHours(0, 0, 0, 0);
    const currentTime = current.getTime();

    for (const req of this.existingRequests) {
      const start = new Date(req.dateDebut);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.dateFin);
      end.setHours(0, 0, 0, 0);

      if (currentTime >= start.getTime() && currentTime <= end.getTime()) {
        const typeLabel = this.categories.find(c => c.value === req.type)?.label || req.type;
        const statusLabel = this.getStatusLabel(req.statut);
        return `${typeLabel} �� ${statusLabel}`;
      }
    }
    return '';
  }

  getStatusLabel(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'APPROUVEE': 'Approuv�e',
      'REJETEE': 'Rejet�e',
      'ANNULEE': 'Annul�e'
    };
    return map[statut] || statut;
  }



  get currentTypeHelp() {
    const type = this.exceptionalRequestForm.get('category')?.value;
    if (!type) return null;

    // Use static config if available, otherwise build from DB
    if (this.typeHelpConfig[type]) return this.typeHelpConfig[type];

    const config = this.typeCongeMap[type];
    if (!config) return null;
    const hints: string[] = [];
    if (config.deductible) hints.push('Les jours sont d�compt�s de votre solde.');
    if (config.requiresAttachment) hints.push('Un justificatif est requis.');
    if (config.requiresMedicalCertificate) hints.push('Un certificat m�dical est requis.');
    if (config.maxDurationDays) hints.push(`Dur�e maximale : ${config.maxDurationDays} jours.`);
    if (config.minAdvanceNoticeDays) hints.push(`Pr�avis minimum : ${config.minAdvanceNoticeDays} jours.`);

    return {
      icon: 'pi pi-calendar',
      title: config.label,
      hint: hints.length > 0 ? hints.join(' ') : 'Aucune contrainte particuli�re.',
      severity: config.requiresAttachment ? 'warn' : 'info'
    };
  }

  get isAttachmentRecommended(): boolean {
    const type = this.exceptionalRequestForm.get('category')?.value;
    const config = type ? this.typeCongeMap[type] : null;
    return config ? (config.requiresAttachment || config.requiresMedicalCertificate) : false;
  }


  get showSolde(): boolean {
    const type = this.exceptionalRequestForm.get('category')?.value;
    if (!type) return false;
    const config = this.typeCongeMap[type];
    return config ? config.deductible : false;
  }


  get showAttachment(): boolean {
    const type = this.exceptionalRequestForm.get('category')?.value;
    if (!type) return true;
    const config = this.typeCongeMap[type];
    return config ? config.requiresAttachment : true;
  }



  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachmentFile = input.files[0];
    }
  }

  removeAttachment() {
    this.attachmentFile = null;
  }
}
