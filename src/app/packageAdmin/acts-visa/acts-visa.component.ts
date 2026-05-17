import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Dialog } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import {ActeVisa} from '../../models/actesVisa.model';
import {ActesVisaService} from '../../services/AdminService/actes-visa/actes-visa.service';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { ToastHelper } from '../../shared/utils/toast-helper';
import { AgentService } from '../../services/AdminService/agent.service';

@Component({
  selector: 'app-actes-visa',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, TableModule, Button, ButtonDirective,
    InputText, FormsModule, Tabs, TabList, Tab, TabPanels,
    TabPanel, Dialog, TooltipModule, DatePicker, Textarea,
    Toast, ConfirmDialogModule, FloatLabelModule, PrimeTemplate, NgIf, DropdownModule
  ],
  templateUrl: './acts-visa.component.html',
  styleUrl: './acts-visa.component.scss'
})
export class ActesVisaComponent implements OnInit {
  actes: any[] = [];
  agents: any[] = [];
  loading = true;

  searchValue = '';

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selectedActe: ActeVisa | null = null;
  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  constructor(
    private actesVisaService: ActesVisaService,
    private agentService: AgentService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    this.loadActes();
  }

  loadAgents() {
    this.agentService.getAll().subscribe({
      next: (res: any) => {
        this.agents = res || [];
      },
      error: (err) => console.error('Error loading agents:', err)
    });
  }

  loadActes() {
    this.loading = true;
    this.actesVisaService.getAll(0, 500).subscribe({
      next: (res) => {
        this.actes = res?.content ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading actes visa:', err);
        this.actes = [];
        this.loading = false;
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  applySearch(): void {
    this.loadActes();
  }

  @ViewChild('dtActe') table!: Table;

  clearTable(table: Table) {
    this.searchValue = '';
    table.clear();
    this.applySearch();
  }

  onView(acte: ActeVisa) {
    this.selectedActe = {
      ...acte,
      dateEffet: this.fromIsoDate(acte.dateEffet) as any,
      dateEnvoiCED: this.fromIsoDate(acte.dateEnvoiCED) as any,
      dateAncienneteAdmin: this.fromIsoDate(acte.dateAncienneteAdmin) as any,
      dateAncienneteCadre: this.fromIsoDate(acte.dateAncienneteCadre) as any,
      dateAncienneteGrade: this.fromIsoDate(acte.dateAncienneteGrade) as any,
      dateAncienneteEchelon: this.fromIsoDate(acte.dateAncienneteEchelon) as any,
    };
    this.displayView = true;
  }

  showAddActe() {
    this.dialogMode = 'add';
    this.form = {};
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(acte: ActeVisa) {
    this.dialogMode = 'edit';
    this.form = {
      ...acte,
      dateEffet: this.fromIsoDate(acte.dateEffet),
      dateEnvoiCED: this.fromIsoDate(acte.dateEnvoiCED),
      dateAncienneteAdmin: this.fromIsoDate(acte.dateAncienneteAdmin),
      dateAncienneteCadre: this.fromIsoDate(acte.dateAncienneteCadre),
      dateAncienneteGrade: this.fromIsoDate(acte.dateAncienneteGrade),
      dateAncienneteEchelon: this.fromIsoDate(acte.dateAncienneteEchelon),
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  save(): void {
    const f = this.form;

    if (!f.agentId || !f.acte?.trim() || !f.typeActe?.trim() || !f.dateEffet || !f.imputation?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: any = {
      ...f,
      agentId: f.agentId,
      acte: f.acte.trim(),
      typeActe: f.typeActe.trim(),
      imputation: f.imputation.trim(),
      corpsActe: f.corpsActe?.trim(),
      dateEffet: this.toIsoDate(f.dateEffet),
      dateEnvoiCED: this.toIsoDate(f.dateEnvoiCED),
      dateAncienneteAdmin: this.toIsoDate(f.dateAncienneteAdmin),
      dateAncienneteCadre: this.toIsoDate(f.dateAncienneteCadre),
      dateAncienneteGrade: this.toIsoDate(f.dateAncienneteGrade),
      dateAncienneteEchelon: this.toIsoDate(f.dateAncienneteEchelon),
    };
    delete payload.matricule;

    if (this.dialogMode === 'add') {
      this.actesVisaService.add(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showAdd(this.messageService);
          this.loadActes();
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      this.actesVisaService.update(f.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showEdit(this.messageService);
          this.loadActes();
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  onDelete(acte: ActeVisa) {
    if (!acte.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.actesVisaService.delete(acte.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadActes();
          this.cdr.detectChanges();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer l'acte pour l'agent ${acte.agentMatricule} ?`);
  }

  private toIsoDate(value: any): string | undefined {
    if (!value || !(value instanceof Date)) return value;
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private fromIsoDate(value: any): Date | null {
    if (!value) return null;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
