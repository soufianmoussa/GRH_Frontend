import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { DistinctionHonorifique } from '../../models/DistinctionHonorifique.model';
import { DistinctionHonorifiqueService } from '../../services/AdminService/DistinctionHonorifique/distinction-honorifique.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-distinctions-honorifiques',
  standalone: true,
  providers: [ConfirmationService, MessageService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    InputText,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Dialog,
    ConfirmDialogModule,
    DropdownModule,
    ButtonDirective,
    Toast,
    DatePicker,
    FloatLabelModule,
    TooltipModule,
    PrimeTemplate,
    NgIf,
    TranslateModule
  ],
  templateUrl: './distinctions-honorifiques.component.html',
  styleUrl: './distinctions-honorifiques.component.scss'
})
export class DistinctionsHonorifiquesComponent implements OnInit {
  private readonly P = 'PACKAGE_ADMIN.DISTINCTIONS_HONORIFIQUES.';

  constructor(
    private distinctionService: DistinctionHonorifiqueService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) { }

  distinctions: DistinctionHonorifique[] = [];
  loading = false;
  searchValue = '';

  distinctions_list: any[] = [];

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selectedDistinction: DistinctionHonorifique | null = null;
  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  ngOnInit(): void {
    this.initList();
    this.loadDistinctions();
  }

  private initList() {
    this.distinctions_list = [
      { label: this.translate.instant(this.P + 'VAL_ORDRE_NATIONAL'), value: 'Ordre National du Mérite' },
      { label: this.translate.instant(this.P + 'VAL_CHEVALIER'), value: 'Chevalier' },
      { label: this.translate.instant(this.P + 'VAL_OFFICIER'), value: 'Officier' },
      { label: this.translate.instant(this.P + 'VAL_COMMANDEUR'), value: 'Commandeur' }
    ];
  }

  showToast(severity: string, summaryKey: string, detailKey: string, detailOverride?: string) {
    this.messageService.add({
      severity: severity,
      summary: this.translate.instant(summaryKey),
      detail: detailOverride || this.translate.instant(detailKey),
      icon: severity === 'success' ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle',
      life: severity === 'success' ? 3000 : 5000
    });
  }

  loadDistinctions() {
    this.loading = true;
    const criteria: any = {};
    if (this.searchValue && this.searchValue.trim().length > 0) {
      criteria.global = this.searchValue.trim();
    }

    this.distinctionService.getDistinctions(criteria).subscribe({
      next: res => {
        this.distinctions = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
        this.loading = false;
      }
    });
  }

  applySearch() {
    this.loadDistinctions();
  }

  @ViewChild('dt') table!: Table;

  clearTable(table: Table) {
    this.searchValue = '';
    table.clear();
    this.applySearch();
  }

  onView(dist: DistinctionHonorifique) {
    this.selectedDistinction = {
      ...dist,
      dateEffet: this.fromIsoDate(dist.dateEffet) as any
    };
    this.displayView = true;
  }

  showAddDistinction() {
    this.dialogMode = 'add';
    this.form = {};
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(dist: DistinctionHonorifique) {
    this.dialogMode = 'edit';
    this.form = {
      ...dist,
      dateEffet: this.fromIsoDate(dist.dateEffet)
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
    if (!f.distinction || !f.matricule?.trim() || !f.dateEffet) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }

    const payload = {
      ...f,
      matricule: f.matricule.trim(),
      dateEffet: this.toIsoDate(f.dateEffet)!
    };

    if (this.dialogMode === 'add') {
      this.distinctionService.addDistinction(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.loadDistinctions();
        },
        error: err => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err.error?.message)
      });
    } else {
      this.distinctionService.updateDistinction(f.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.loadDistinctions();
        },
        error: err => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err.error?.message)
      });
    }
  }

  onDelete(dist: DistinctionHonorifique) {
    if (!dist.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant(this.P + 'CONFIRM_DELETE', { matricule: dist.matricule }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.distinctionService.deleteDistinction(dist.id!).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.loadDistinctions();
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
