import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { Button, ButtonDirective } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CaisseService } from '../../services/AdminService/CaisseRetraite/caisse.service';
import { CaisseRetraite } from '../../models/caisseRetraite.model';

@Component({
  selector: 'app-caisses-retraite',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    Button,
    ButtonDirective,
    TableModule,
    InputText,
    Dialog,
    DropdownModule,
    DatePicker,
    FloatLabelModule,
    TooltipModule,
    Toast,
    ConfirmDialogModule,
    Tab, TabList, TabPanel, TabPanels, Tabs,
    NgIf,
    PrimeTemplate,
    TranslateModule
  ],
  templateUrl: './caisses-retraite.component.html',
  styleUrl: './caisses-retraite.component.scss'
})
export class CaissesRetraiteComponent implements OnInit {

  private readonly P = 'PACKAGE_ADMIN.CAISSES_RETRAITE.';

  constructor(
    private caisseService: CaisseService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) { }

  showToast(severity: string, summaryKey: string, detailKey: string, detailOverride?: string) {
    this.messageService.add({
      severity: severity,
      summary: this.translate.instant(summaryKey),
      detail: detailOverride || this.translate.instant(detailKey),
      icon: severity === 'success' ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle',
      life: severity === 'success' ? 3000 : 5000
    });
  }

  caisses: CaisseRetraite[] = [];
  searchGlobal = '';

  caisseOptions: any[] = [];

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selectedCaisse: CaisseRetraite | null = null;
  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  ngOnInit() {
    this.caisseOptions = [
      { label: 'CNSS', value: 'CNSS' },
      { label: 'CMR', value: 'CMR' },
      { label: 'RCAR', value: 'RCAR' },
      { label: this.translate.instant('GLOBAL.AUTRE'), value: 'Autre' }
    ];
    this.loadCaisses();
  }

  loadCaisses() {
    const criteria: any = {};
    if (this.searchGlobal && this.searchGlobal.trim().length > 0) {
      criteria.global = this.searchGlobal.trim();
    }

    this.caisseService.getCaisses(criteria).subscribe({
      next: res => {
        this.caisses = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
      }
    });
  }

  applySearch() {
    this.loadCaisses();
  }

  @ViewChild('dt') table!: Table;

  clearTable(table: Table) {
    this.searchGlobal = '';
    table.clear();
    this.applySearch();
  }

  onView(item: CaisseRetraite) {
    this.selectedCaisse = {
      ...item,
      dateAffiliation: this.fromIsoDate(item.dateAffiliation) as any
    };
    this.displayView = true;
  }

  showAddDialog() {
    this.dialogMode = 'add';
    this.form = {};
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(item: CaisseRetraite) {
    this.dialogMode = 'edit';
    this.form = {
      ...item,
      dateAffiliation: this.fromIsoDate(item.dateAffiliation)
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  save() {
    if (this.addForm?.invalid) {
      this.addForm.form.markAllAsTouched();
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }
    const f = this.form;
    if (!f.matricule?.trim() || !f.dateAffiliation || !f.caisseCotisation || !f.numeroAssurance?.trim()) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }

    const payload = {
      ...f,
      matricule: f.matricule.trim(),
      numeroAssurance: f.numeroAssurance.trim(),
      dateAffiliation: this.toIsoDate(f.dateAffiliation)!
    };

    if (this.dialogMode === 'add') {
      this.caisseService.addCaisse(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.loadCaisses();
        },
        error: err => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err.error?.message)
      });
    } else {
      this.caisseService.updateCaisse(f.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.loadCaisses();
        },
        error: err => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err.error?.message)
      });
    }
  }

  onDelete(item: CaisseRetraite) {
    if (!item?.id) return;
    this.confirmationService.confirm({
      message: this.translate.instant(this.P + 'CONFIRM_DELETE_MSG', { matricule: item.matricule }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.caisseService.deleteCaisse(item.id!).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.loadCaisses();
          },
          error: err => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err.error?.message)
        });
      }
    });
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d || !(d instanceof Date)) return d as any;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromIsoDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }

}
