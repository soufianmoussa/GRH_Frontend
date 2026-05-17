import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';

import { ToastHelper } from '../../../shared/utils/toast-helper';
import { FonctionService } from '../../../services/AdminService/GestionOrganisationelle/fonction.service';
import { Fonction } from '../../../models/gestionOrganisationelle/fonction.model';
import { PageResponse } from '../../../models/PageResponse.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type FonctionForm = {
  id?: number;
  code: string;
  libelle: string;
  dateCreation: Date | null;
  dateFin: Date | null;
};

@Component({
  selector: 'app-fonctions',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    ButtonDirective,
    Dialog,
    InputText,
    TooltipModule,
    DatePicker,
    TagModule,
    ConfirmDialogModule,
    Toast,
    PrimeTemplate,
    FloatLabelModule,
    TranslateModule
  ],
  templateUrl: './fonctions.component.html',
  styleUrl: './fonctions.component.scss'
})
export class FonctionsComponent implements OnInit {
  loading = false;
  search = '';

  fonctions: Fonction[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;

  displayDialog = false;
  displayView = false;
  dialogMode: 'add' | 'edit' = 'add';

  selected: Fonction | null = null;
  form: FonctionForm = this.emptyForm();

  @ViewChild('addForm') addForm?: NgForm;

  linkedPostes: any[] = [];
  loadingPostes = false;

  private readonly P = 'POSTE_ET_EMPLOI.FONCTIONS.';

  constructor(
    private service: FonctionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadPage(0, this.pageSize);
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

  loadPage(page: number, size: number): void {
    this.currentPage = page;
    this.pageSize = size;
    this.loading = true;

    this.service.getAll(page, size, this.search).subscribe({
      next: (res: PageResponse<Fonction>) => {
        this.fonctions = res?.content ?? [];
        this.totalRecords = res?.totalElements ?? 0;
        this.loading = false;
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows);
    this.loadPage(page, event.rows);
  }

  refreshTable(): void {
    this.loadPage(this.currentPage, this.pageSize);
  }

  applySearch(): void {
    this.loadPage(0, this.pageSize);
  }

  clearTable(table: Table): void {
    table.clear();
    this.search = '';
    this.applySearch();
  }

  onView(item: Fonction): void {
    this.selected = item;
    this.linkedPostes = [];
    this.displayView = true;

    if (item.id) {
      this.loadingPostes = true;
      this.service.getPostesByFonction(item.id).subscribe({
        next: (res) => {
          this.linkedPostes = res?.content ?? [];
          this.loadingPostes = false;
        },
        error: () => {
          this.loadingPostes = false;
        }
      });
    }
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.form = this.emptyForm();
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  onEdit(item: Fonction): void {
    this.dialogMode = 'edit';
    this.form = {
      id: item.id,
      code: item.code,
      libelle: item.libelle,
      dateCreation: this.fromIsoDate(item.dateCreation),
      dateFin: this.fromIsoDate(item.dateFin)
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.form);
    });
  }

  save(): void {
    if (!this.form.code?.trim() || !this.form.libelle?.trim()) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }

    const payload = {
      code: this.form.code.trim(),
      libelle: this.form.libelle.trim(),
      dateCreation: this.toIsoDate(this.form.dateCreation),
      dateFin: this.toIsoDate(this.form.dateFin)
    };

    this.loading = true;

    if (this.dialogMode === 'add') {
      this.service.create(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.refreshTable();
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err?.error?.message);
          this.loading = false;
        }
      });
    } else {
      if (!this.form.id) return;
      this.service.update(this.form.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.refreshTable();
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err?.error?.message);
          this.loading = false;
        }
      });
    }
  }

  onDelete(item: Fonction): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant(this.P + 'CONFIRM_DELETE', { name: `${item.code} — ${item.libelle}` }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loading = true;
        this.service.delete(item.id!).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.refreshTable();
          },
          error: (err) => {
            this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err?.error?.message);
            this.loading = false;
          }
        });
      }
    });
  }

  isExpired(dateFin: string | null): boolean {
    if (!dateFin) return false;
    return new Date(dateFin) < new Date();
  }

  private emptyForm(): FonctionForm {
    return { id: undefined, code: '', libelle: '', dateCreation: null, dateFin: null };
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromIsoDate(value: any): Date | null {
    if (!value) return null;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
