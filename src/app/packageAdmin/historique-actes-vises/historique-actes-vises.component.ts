import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Dialog } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../shared/toast-helper';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-historique-actes-vises',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, TableModule, Button, ButtonDirective,
    InputText, FormsModule, Tabs, TabList, Tab, TabPanels,
    TabPanel, Dialog, TooltipModule, DropdownModule,
    Toast, ConfirmDialogModule, FloatLabelModule, PrimeTemplate,
    DatePicker, Textarea, NgIf
  ],
  templateUrl: './historique-actes-vises.component.html',
  styleUrl: './historique-actes-vises.component.scss'
})
export class HistoriqueActesVisesComponent implements OnInit {

  actes: any[] = [];
  loading = true;
  searchValue: string | undefined;

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selectedActe: any = null;
  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  dateRecrutement = "2020-01-01";

  typeActeOptions = [
    { label: 'Promotion', value: 'Promotion' },
    { label: 'Affectation', value: 'Affectation' },
    { label: 'Avancement', value: 'Avancement' },
    { label: 'Radiation', value: 'Radiation' },
    { label: 'Contrat', value: 'Contrat' }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {

    this.actes = [
      {
        id: 1,
        matricule: 'N001',
        dateEffet: '2023-01-01',
        acte: 'C01',
        typeActe: 'Titularisation',
        imputation: '1113001010',
        dateVisa: '2023-01-05',
        anneeVisa: '2023',
        numeroVisa: '000101',
        dateAncienneteAdmin: '2023-01-01',
        dateAncienneteCadre: '2023-01-01',
        dateAncienneteGrade: '2023-01-01',
        dateAncienneteEchelon: '2023-01-01',
        corpsActe: 'Acte de titularisation au grade d’administrateur.'
      }
    ];

    this.sortActes();
    this.loading = false;
  }

  sortActes() {
    this.actes.sort((a, b) => {
      const m = (a.matricule || '').localeCompare(b.matricule || '');
      if (m !== 0) return m;
      return new Date(a.dateEffet).getTime() - new Date(b.dateEffet).getTime();
    });
  }

  applySearch() {
    this.sortActes();
  }

  @ViewChild('dt') table!: Table;

  clearTable(table: Table) {
    this.searchValue = '';
    table.clear();
    this.applySearch();
  }

  onView(acte: any) {
    this.selectedActe = {
      ...acte,
      dateEffet: this.fromIsoDate(acte.dateEffet),
      dateVisa: this.fromIsoDate(acte.dateVisa)
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

  onEdit(acte: any) {
    this.dialogMode = 'edit';
    this.form = {
      ...acte,
      dateEffet: this.fromIsoDate(acte.dateEffet),
      dateVisa: this.fromIsoDate(acte.dateVisa),
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
    if (!f.matricule?.trim() || !f.dateEffet || !f.acte?.trim() || !f.typeActe || !f.imputation?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const de = this.toIsoDate(f.dateEffet);
    if (de && de < this.dateRecrutement) {
      ToastHelper.showError(this.messageService, "L'acte est antérieur à la date de recrutement !");
      return;
    }

    const item = {
      ...f,
      matricule: f.matricule.trim(),
      acte: f.acte.trim(),
      imputation: f.imputation.trim(),
      corpsActe: (f.corpsActe || '').trim(),
      dateEffet: this.toIsoDate(f.dateEffet),
      dateVisa: this.toIsoDate(f.dateVisa),
      dateAncienneteAdmin: this.toIsoDate(f.dateAncienneteAdmin),
      dateAncienneteCadre: this.toIsoDate(f.dateAncienneteCadre),
      dateAncienneteGrade: this.toIsoDate(f.dateAncienneteGrade),
      dateAncienneteEchelon: this.toIsoDate(f.dateAncienneteEchelon),
    };

    if (this.dialogMode === 'add') {
      item.id = this.actes.length + 1;
      this.actes = [...this.actes, item];
      ToastHelper.showAdd(this.messageService);
    } else {
      const index = this.actes.findIndex(a => a.id === item.id);
      if (index !== -1) {
        this.actes[index] = item;
        this.actes = [...this.actes];
        ToastHelper.showEdit(this.messageService);
      }
    }

    this.sortActes();
    this.displayDialog = false;
  }

  onDelete(acte: any) {
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.actes = this.actes.filter(a => a !== acte);
      ToastHelper.showDelete(this.messageService);
    }, `Supprimer l'acte visé du matricule ${acte.matricule} ?`);
  }

  private toIsoDate(value: any): string | null {
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
