import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { Textarea } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';

import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { Emploi, FamilleEmploi } from '../../../../models/fammile-et-emploi.model';
import { EmploiService } from '../../services/famille-emploi/emploi.service';
import { FamilleEmploiService } from '../../services/famille-emploi/famille-emploi.service';
import { PageResponse } from '../../../../models/PageResponse.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type FamilleForm = {
  id?: number;
  famillesEmploi: string;
  description?: string | null;
};

type EmploiForm = {
  id?: number;
  emploi: string;
  description?: string | null;
  familleEmploiId: number | null;
};

@Component({
  selector: 'app-fammile-et-emploi',
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
    TagModule,
    ConfirmDialogModule,
    Toast,
    PrimeTemplate,
    Textarea,
    FloatLabelModule,
    TranslateModule
  ],
  templateUrl: './fammile-et-emploi.component.html',
  styleUrl: './fammile-et-emploi.component.scss'
})
export class FammileEtEmploiComponent implements OnInit {

  currentView: 'familles' | 'emplois' = 'familles';
  selectedFamilleForDrilldown: FamilleEmploi | null = null;

  loadingFamilles = false;
  familles: FamilleEmploi[] = [];
  famillesTotal = 0;
  famillesPage = 0;
  famillesPageSize = 10;
  famillesSearch = '';

  displayFamilleDialog = false;
  displayFamilleView = false;
  familleDialogMode: 'add' | 'edit' = 'add';
  selectedFamille: FamilleEmploi | null = null;
  familleForm: FamilleForm = this.emptyFamilleForm();

  loadingEmplois = false;
  emplois: Emploi[] = [];
  emploisTotal = 0;
  emploisPage = 0;
  emploisPageSize = 10;
  emploisSearch = '';

  displayEmploiDialog = false;
  displayEmploiView = false;
  emploiDialogMode: 'add' | 'edit' = 'add';
  selectedEmploi: Emploi | null = null;
  emploiForm: EmploiForm = this.emptyEmploiForm();

  @ViewChild('addFamilleForm') addFamilleForm?: NgForm;
  @ViewChild('addEmploiForm') addEmploiForm?: NgForm;

  private readonly P = 'POSTE_ET_EMPLOI.FAMILLE_ET_EMPLOI.';

  constructor(
    private familleService: FamilleEmploiService,
    private emploiService: EmploiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadFamilles(0, this.famillesPageSize);
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

  drillDown(famille: FamilleEmploi): void {
    this.selectedFamilleForDrilldown = famille;
    this.currentView = 'emplois';
    this.emploisSearch = '';
    this.loadEmplois(0, this.emploisPageSize);
  }

  goBackToFamilles(): void {
    this.currentView = 'familles';
    this.selectedFamilleForDrilldown = null;
    this.emplois = [];
    this.emploisTotal = 0;
    this.loadFamilles(this.famillesPage, this.famillesPageSize);
  }

  loadFamilles(page: number, size: number): void {
    this.famillesPage = page;
    this.famillesPageSize = size;
    this.loadingFamilles = true;

    this.familleService.getPage(page, size, this.famillesSearch).subscribe({
      next: (res: PageResponse<FamilleEmploi>) => {
        this.familles = res?.content ?? [];
        this.famillesTotal = res?.totalElements ?? 0;
        this.loadingFamilles = false;
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
        this.loadingFamilles = false;
      }
    });
  }

  onFamillesPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows);
    this.loadFamilles(page, event.rows);
  }

  applyFamillesSearch(): void {
    this.loadFamilles(0, this.famillesPageSize);
  }

  clearFamillesTable(table: Table): void {
    table.clear();
    this.famillesSearch = '';
    this.applyFamillesSearch();
  }

  onViewFamille(item: FamilleEmploi): void {
    this.selectedFamille = item;
    this.displayFamilleView = true;
  }

  showAddFamilleDialog(): void {
    this.familleDialogMode = 'add';
    this.familleForm = this.emptyFamilleForm();
    this.displayFamilleDialog = true;
    setTimeout(() => {
      this.addFamilleForm?.resetForm(this.familleForm);
    });
  }

  onEditFamille(item: FamilleEmploi): void {
    this.familleDialogMode = 'edit';
    this.familleForm = {
      id: item.id,
      famillesEmploi: item.famillesEmploi ?? '',
      description: item.description ?? ''
    };
    this.displayFamilleDialog = true;
    setTimeout(() => {
      this.addFamilleForm?.resetForm(this.familleForm);
    });
  }

  saveFamille(): void {
    if (!this.familleForm.famillesEmploi?.trim()) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }

    const payload: Partial<FamilleEmploi> = {
      famillesEmploi: this.familleForm.famillesEmploi.trim(),
      description: (this.familleForm.description ?? '').trim()
    };

    this.loadingFamilles = true;

    if (this.familleDialogMode === 'add') {
      this.familleService.create(payload).subscribe({
        next: () => {
          this.displayFamilleDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.loadFamilles(this.famillesPage, this.famillesPageSize);
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err?.error?.message);
          this.loadingFamilles = false;
        }
      });
    } else {
      if (!this.familleForm.id) return;
      this.familleService.update(this.familleForm.id, payload).subscribe({
        next: () => {
          this.displayFamilleDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.loadFamilles(this.famillesPage, this.famillesPageSize);
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err?.error?.message);
          this.loadingFamilles = false;
        }
      });
    }
  }

  deleteFamille(item: FamilleEmploi): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant(this.P + 'CONFIRM_DELETE_FAMILLE', { name: item.famillesEmploi }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loadingFamilles = true;
        this.familleService.delete(item.id!).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.loadFamilles(this.famillesPage, this.famillesPageSize);
          },
          error: (err) => {
            this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err?.error?.message);
            this.loadingFamilles = false;
          }
        });
      }
    });
  }

  loadEmplois(page: number, size: number): void {
    this.emploisPage = page;
    this.emploisPageSize = size;
    this.loadingEmplois = true;

    const familleId = this.selectedFamilleForDrilldown?.id ?? null;

    this.emploiService.getPage(page, size, familleId, this.emploisSearch).subscribe({
      next: (res: PageResponse<Emploi>) => {
        this.emplois = res?.content ?? [];
        this.emploisTotal = res?.totalElements ?? 0;
        this.loadingEmplois = false;
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
        this.loadingEmplois = false;
      }
    });
  }

  onEmploisPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows);
    this.loadEmplois(page, event.rows);
  }

  applyEmploisSearch(): void {
    this.loadEmplois(0, this.emploisPageSize);
  }

  clearEmploisTable(table: Table): void {
    table.clear();
    this.emploisSearch = '';
    this.applyEmploisSearch();
  }

  onViewEmploi(item: Emploi): void {
    this.selectedEmploi = item;
    this.displayEmploiView = true;
  }

  showAddEmploiDialog(): void {
    this.emploiDialogMode = 'add';
    this.emploiForm = this.emptyEmploiForm();
    this.emploiForm.familleEmploiId = this.selectedFamilleForDrilldown?.id ?? null;
    this.displayEmploiDialog = true;
    setTimeout(() => {
      this.addEmploiForm?.resetForm(this.emploiForm);
    });
  }

  onEditEmploi(item: Emploi): void {
    this.emploiDialogMode = 'edit';
    this.emploiForm = {
      id: item.id,
      emploi: item.emploi ?? '',
      description: item.description ?? '',
      familleEmploiId: item.familleEmploiId ?? null
    };
    this.displayEmploiDialog = true;
    setTimeout(() => {
      this.addEmploiForm?.resetForm(this.emploiForm);
    });
  }

  saveEmploi(): void {
    if (!this.emploiForm.emploi?.trim()) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }
    if (!this.emploiForm.familleEmploiId) {
      this.showToast('error', 'GLOBAL.ERREUR', this.P + 'ERR_FAMILLE_REQ_TOAST');
      return;
    }

    const payload: Partial<Emploi> = {
      emploi: this.emploiForm.emploi.trim(),
      description: (this.emploiForm.description ?? '').trim(),
      familleEmploiId: this.emploiForm.familleEmploiId
    };

    this.loadingEmplois = true;

    if (this.emploiDialogMode === 'add') {
      this.emploiService.create(payload).subscribe({
        next: () => {
          this.displayEmploiDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.loadEmplois(this.emploisPage, this.emploisPageSize);
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err?.error?.message);
          this.loadingEmplois = false;
        }
      });
    } else {
      if (!this.emploiForm.id) return;
      this.emploiService.update(this.emploiForm.id, payload).subscribe({
        next: () => {
          this.displayEmploiDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.loadEmplois(this.emploisPage, this.emploisPageSize);
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err?.error?.message);
          this.loadingEmplois = false;
        }
      });
    }
  }

  deleteEmploi(item: Emploi): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant(this.P + 'CONFIRM_DELETE_EMPLOI', { name: item.emploi }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loadingEmplois = true;
        this.emploiService.delete(item.id!).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.loadEmplois(this.emploisPage, this.emploisPageSize);
          },
          error: (err) => {
            this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err?.error?.message);
            this.loadingEmplois = false;
          }
        });
      }
    });
  }

  private emptyFamilleForm(): FamilleForm {
    return { famillesEmploi: '', description: '' };
  }

  private emptyEmploiForm(): EmploiForm {
    return { emploi: '', description: '', familleEmploiId: null };
  }
}
