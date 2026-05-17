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

import { ToastHelper } from '../../../shared/utils/toast-helper';
import { FamilleProfessionnelle, SousFamille } from '../../../models/famille-professionnelle.model';
import { FamilleProfessionnelleService } from '../../../services/AdminService/FamilleProfessionnelle/famille-professionnelle.service';
import { SousFamilleService } from '../../../services/AdminService/FamilleProfessionnelle/sous-famille.service';
import { PageResponse } from '../../../models/PageResponse.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type FamilleForm = {
  id?: number;
  famille: string;
  description?: string | null;
};

type SousFamilleForm = {
  id?: number;
  sousFamille: string;
  description?: string | null;
  familleProfessionnelleId: number | null;
};

@Component({
  selector: 'app-situation-famille',
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
  templateUrl: './situation-famille.component.html',
  styleUrl: './situation-famille.component.scss'
})
export class SituationFamilleComponent implements OnInit {

  currentView: 'familles' | 'sousFamilles' = 'familles';
  selectedFamilleForDrilldown: FamilleProfessionnelle | null = null;

  loadingFamilles = false;
  familles: FamilleProfessionnelle[] = [];
  famillesTotal = 0;
  famillesPage = 0;
  famillesPageSize = 10;
  famillesSearch = '';

  displayFamilleDialog = false;
  displayFamilleView = false;
  familleDialogMode: 'add' | 'edit' = 'add';
  selectedFamille: FamilleProfessionnelle | null = null;
  familleForm: FamilleForm = this.emptyFamilleForm();

  loadingSousFamilles = false;
  sousFamilles: SousFamille[] = [];
  sousFamillesTotal = 0;
  sousFamillesPage = 0;
  sousFamillesPageSize = 10;
  sousFamillesSearch = '';

  displaySousFamilleDialog = false;
  displaySousFamilleView = false;
  sousFamilleDialogMode: 'add' | 'edit' = 'add';
  selectedSousFamille: SousFamille | null = null;
  sousFamilleForm: SousFamilleForm = this.emptySousFamilleForm();

  @ViewChild('addFamilleForm') addFamilleForm?: NgForm;
  @ViewChild('addSousFamilleForm') addSousFamilleForm?: NgForm;

  private readonly P = 'POSTE_ET_EMPLOI.SITUATION_FAMILLE.';

  constructor(
    private familleService: FamilleProfessionnelleService,
    private sousFamilleService: SousFamilleService,
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

  drillDown(famille: FamilleProfessionnelle): void {
    this.selectedFamilleForDrilldown = famille;
    this.currentView = 'sousFamilles';
    this.sousFamillesSearch = '';
    this.loadSousFamilles(0, this.sousFamillesPageSize);
  }

  goBackToFamilles(): void {
    this.currentView = 'familles';
    this.selectedFamilleForDrilldown = null;
    this.sousFamilles = [];
    this.sousFamillesTotal = 0;
    this.loadFamilles(this.famillesPage, this.famillesPageSize);
  }

  loadFamilles(page: number, size: number): void {
    this.famillesPage = page;
    this.famillesPageSize = size;
    this.loadingFamilles = true;

    this.familleService.getPage(page, size, this.famillesSearch).subscribe({
      next: (res: PageResponse<FamilleProfessionnelle>) => {
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

  onViewFamille(item: FamilleProfessionnelle): void {
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

  onEditFamille(item: FamilleProfessionnelle): void {
    this.familleDialogMode = 'edit';
    this.familleForm = {
      id: item.id,
      famille: item.famille ?? '',
      description: item.description ?? ''
    };
    this.displayFamilleDialog = true;
    setTimeout(() => {
      this.addFamilleForm?.resetForm(this.familleForm);
    });
  }

  saveFamille(): void {
    if (!this.familleForm.famille?.trim()) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }

    const payload: Partial<FamilleProfessionnelle> = {
      famille: this.familleForm.famille.trim(),
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

  deleteFamille(item: FamilleProfessionnelle): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant(this.P + 'CONFIRM_DELETE_FAMILLE', { name: item.famille }),
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

  loadSousFamilles(page: number, size: number): void {
    this.sousFamillesPage = page;
    this.sousFamillesPageSize = size;
    this.loadingSousFamilles = true;

    const familleId = this.selectedFamilleForDrilldown?.id ?? null;

    this.sousFamilleService.getPage(page, size, familleId, this.sousFamillesSearch).subscribe({
      next: (res: PageResponse<SousFamille>) => {
        this.sousFamilles = res?.content ?? [];
        this.sousFamillesTotal = res?.totalElements ?? 0;
        this.loadingSousFamilles = false;
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
        this.loadingSousFamilles = false;
      }
    });
  }

  onSousFamillesPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows);
    this.loadSousFamilles(page, event.rows);
  }

  applySousFamillesSearch(): void {
    this.loadSousFamilles(0, this.sousFamillesPageSize);
  }

  clearSousFamillesTable(table: Table): void {
    table.clear();
    this.sousFamillesSearch = '';
    this.applySousFamillesSearch();
  }

  onViewSousFamille(item: SousFamille): void {
    this.selectedSousFamille = item;
    this.displaySousFamilleView = true;
  }

  showAddSousFamilleDialog(): void {
    this.sousFamilleDialogMode = 'add';
    this.sousFamilleForm = this.emptySousFamilleForm();
    this.sousFamilleForm.familleProfessionnelleId = this.selectedFamilleForDrilldown?.id ?? null;
    this.displaySousFamilleDialog = true;
    setTimeout(() => {
      this.addSousFamilleForm?.resetForm(this.sousFamilleForm);
    });
  }

  onEditSousFamille(item: SousFamille): void {
    this.sousFamilleDialogMode = 'edit';
    this.sousFamilleForm = {
      id: item.id,
      sousFamille: item.sousFamille ?? '',
      description: item.description ?? '',
      familleProfessionnelleId: item.familleProfessionnelleId ?? null
    };
    this.displaySousFamilleDialog = true;
    setTimeout(() => {
      this.addSousFamilleForm?.resetForm(this.sousFamilleForm);
    });
  }

  saveSousFamille(): void {
    if (!this.sousFamilleForm.sousFamille?.trim()) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }
    if (!this.sousFamilleForm.familleProfessionnelleId) {
      this.showToast('error', 'GLOBAL.ERREUR', this.P + 'ERR_FAMILLE_REQ_TOAST');
      return;
    }

    const payload: Partial<SousFamille> = {
      sousFamille: this.sousFamilleForm.sousFamille.trim(),
      description: (this.sousFamilleForm.description ?? '').trim(),
      familleProfessionnelleId: this.sousFamilleForm.familleProfessionnelleId
    };

    this.loadingSousFamilles = true;

    if (this.sousFamilleDialogMode === 'add') {
      this.sousFamilleService.create(payload).subscribe({
        next: () => {
          this.displaySousFamilleDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.loadSousFamilles(this.sousFamillesPage, this.sousFamillesPageSize);
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err?.error?.message);
          this.loadingSousFamilles = false;
        }
      });
    } else {
      if (!this.sousFamilleForm.id) return;
      this.sousFamilleService.update(this.sousFamilleForm.id, payload).subscribe({
        next: () => {
          this.displaySousFamilleDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.loadSousFamilles(this.sousFamillesPage, this.sousFamillesPageSize);
        },
        error: (err) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err?.error?.message);
          this.loadingSousFamilles = false;
        }
      });
    }
  }

  deleteSousFamille(item: SousFamille): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant(this.P + 'CONFIRM_DELETE_SOUS_FAMILLE', { name: item.sousFamille }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loadingSousFamilles = true;
        this.sousFamilleService.delete(item.id!).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.loadSousFamilles(this.sousFamillesPage, this.sousFamillesPageSize);
          },
          error: (err) => {
            this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err?.error?.message);
            this.loadingSousFamilles = false;
          }
        });
      }
    });
  }

  private emptyFamilleForm(): FamilleForm {
    return { famille: '', description: '' };
  }

  private emptySousFamilleForm(): SousFamilleForm {
    return { sousFamille: '', description: '', familleProfessionnelleId: null };
  }
}
