import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';

import { ViewChild } from '@angular/core';

import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { PostesactivitesService } from '../../services/postes-activites/postesactivites.service';
import { ActiviteDTO, ActiviteCreateUpdateRequest, PosteTravailDTO } from '../../../../models/postesActivites.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type PosteForm = {
  designationObjet: string;
  description: string;
  familleProfessionnelleId: number | null;
  familleEmploiId: number | null;
  emploiId: number | null;
};

type ActiviteForm = {
  id?: number;
  designationObjet: string;
  description: string;
  ordreAffichage: number | null;
  posteTravailId: number | null;
};

@Component({
  selector: 'app-postes-activites',
  templateUrl: './postes-activites.component.html',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button, ButtonDirective,
    Dialog,
    InputText,
    Textarea,
    Tooltip,
    InputNumberModule,
    SelectModule,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    TranslateModule
  ],
  styleUrls: ['./postes-activites.component.scss']
})
export class PostesActivitesComponent implements OnInit {

  currentView: 'postes' | 'activites' = 'postes';
  selectedPosteForDrilldown: PosteTravailDTO | null = null;

  famillesProfessionnelleData: any[] = [];
  famillesEmploiData: any[] = [];
  emploisData: any[] = [];

  postesData: PosteTravailDTO[] = [];
  postesSearch = '';

  displayPosteDialog = false;
  displayPosteView = false;
  posteDialogMode: 'add' | 'edit' = 'add';
  selectedPoste: PosteTravailDTO | null = null;
  posteForm: PosteForm = this.emptyPosteForm();
  editPosteId: number | null = null;

  activitesData: ActiviteDTO[] = [];
  activitesSearch = '';

  displayActiviteDialog = false;
  displayActiviteView = false;
  activiteDialogMode: 'add' | 'edit' = 'add';
  selectedActivite: ActiviteDTO | null = null;
  activiteForm: ActiviteForm = this.emptyActiviteForm();

  @ViewChild('addPosteForm') addPosteForm?: NgForm;
  @ViewChild('addActiviteForm') addActiviteForm?: NgForm;

  private readonly P = 'POSTE_ET_EMPLOI.POSTES_ACTIVITES.';

  constructor(
    private service: PostesactivitesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadReferenceData();
    this.loadPostes();
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

  drillDown(poste: PosteTravailDTO): void {
    this.selectedPosteForDrilldown = poste;
    this.currentView = 'activites';
    this.activitesSearch = '';
    this.loadActivitesByPoste(poste.id!);
  }

  goBackToPostes(): void {
    this.currentView = 'postes';
    this.selectedPosteForDrilldown = null;
    this.activitesData = [];
  }

  private loadReferenceData(): void {
    this.service.getFamillesProfessionnelle().subscribe({
      next: (res) => this.famillesProfessionnelleData = res?.content ?? [],
      error: () => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD')
    });

    this.service.getFamillesEmploi().subscribe({
      next: (res) => this.famillesEmploiData = res?.content ?? [],
      error: () => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD')
    });
  }

  loadPostes(): void {
    this.service.getPostes().subscribe({
      next: (res) => this.postesData = res ?? [],
      error: () => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD')
    });
  }

  loadActivitesByPoste(posteTravailId: number): void {
    this.service.getActivitesByPosteTravail(posteTravailId).subscribe({
      next: (res) => this.activitesData = res ?? [],
      error: () => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD')
    });
  }

  onFamilleEmploiChange(): void {
    this.emploisData = [];
    this.posteForm.emploiId = null;

    const familleId = this.posteForm.familleEmploiId;
    if (!familleId) return;

    this.service.getEmploisByFamille(familleId).subscribe({
      next: (res) => this.emploisData = res?.content ?? [],
      error: () => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD')
    });
  }

  onViewPoste(item: PosteTravailDTO): void {
    this.selectedPoste = item;
    this.displayPosteView = true;
  }

  showAddPosteDialog(): void {
    this.posteDialogMode = 'add';
    this.posteForm = this.emptyPosteForm();
    this.editPosteId = null;
    this.emploisData = [];
    this.displayPosteDialog = true;
    setTimeout(() => {
      this.addPosteForm?.resetForm(this.posteForm);
    });
  }

  onEditPoste(item: PosteTravailDTO): void {
    this.posteDialogMode = 'edit';
    this.editPosteId = item.id ?? null;
    this.posteForm = {
      designationObjet: item.designationObjet ?? '',
      description: item.description ?? '',
      familleProfessionnelleId: item.familleProfessionnelleId ?? null,
      familleEmploiId: item.familleEmploiId ?? null,
      emploiId: item.emploiId ?? null
    };

    if (this.posteForm.familleEmploiId) {
      this.service.getEmploisByFamille(this.posteForm.familleEmploiId).subscribe({
        next: (res) => {
          this.emploisData = res?.content ?? [];
          this.displayPosteDialog = true;
          setTimeout(() => {
            this.addPosteForm?.resetForm(this.posteForm);
          });
        },
        error: () => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
          this.displayPosteDialog = true;
          setTimeout(() => {
            this.addPosteForm?.resetForm(this.posteForm);
          });
        }
      });
    } else {
      this.emploisData = [];
      this.displayPosteDialog = true;
      setTimeout(() => {
        this.addPosteForm?.resetForm(this.posteForm);
      });
    }
  }

  savePoste(): void {
    if (!this.posteForm.designationObjet?.trim()) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }

    const payload: PosteTravailDTO = {
      designationObjet: this.posteForm.designationObjet.trim(),
      description: this.posteForm.description || undefined,
      familleProfessionnelleId: this.posteForm.familleProfessionnelleId,
      familleEmploiId: this.posteForm.familleEmploiId,
      emploiId: this.posteForm.emploiId
    };

    if (this.posteDialogMode === 'edit' && this.editPosteId) {
      this.service.updatePoste(this.editPosteId, payload).subscribe({
        next: () => {
          this.displayPosteDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.loadPostes();
        },
        error: (err) => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err?.error?.message)
      });
    } else {
      this.service.addPoste(payload).subscribe({
        next: () => {
          this.displayPosteDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.loadPostes();
        },
        error: (err) => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err?.error?.message)
      });
    }
  }

  deletePoste(item: PosteTravailDTO): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant(this.P + 'CONFIRM_DELETE_POSTE', { name: item.designationObjet }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.service.deletePoste(item.id!).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.loadPostes();
          },
          error: (err) => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err?.error?.message)
        });
      }
    });
  }

  onViewActivite(item: ActiviteDTO): void {
    this.selectedActivite = item;
    this.displayActiviteView = true;
  }

  showAddActiviteDialog(): void {
    this.activiteDialogMode = 'add';
    this.activiteForm = this.emptyActiviteForm();
    this.activiteForm.posteTravailId = this.selectedPosteForDrilldown?.id ?? null;
    this.displayActiviteDialog = true;
    setTimeout(() => {
      this.addActiviteForm?.resetForm(this.activiteForm);
    });
  }

  onEditActivite(item: ActiviteDTO): void {
    this.activiteDialogMode = 'edit';
    this.activiteForm = {
      id: item.id,
      designationObjet: item.designationObjet ?? '',
      description: item.description ?? '',
      ordreAffichage: item.ordreAffichage ?? null,
      posteTravailId: item.posteTravailId ?? null
    };
    this.displayActiviteDialog = true;
    setTimeout(() => {
      this.addActiviteForm?.resetForm(this.activiteForm);
    });
  }

  saveActivite(): void {
    if (!this.activiteForm.designationObjet?.trim()) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
      return;
    }
    if (!this.activiteForm.posteTravailId) {
      this.showToast('error', 'GLOBAL.ERREUR', this.P + 'ERR_POSTE_REQ_TOAST');
      return;
    }

    const payload: ActiviteCreateUpdateRequest = {
      designationObjet: this.activiteForm.designationObjet.trim(),
      description: this.activiteForm.description || undefined,
      ordreAffichage: this.activiteForm.ordreAffichage,
      posteTravailId: this.activiteForm.posteTravailId
    };

    if (this.activiteDialogMode === 'edit' && this.activiteForm.id) {
      this.service.updateActivite(this.activiteForm.id, payload).subscribe({
        next: () => {
          this.displayActiviteDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.loadActivitesByPoste(this.selectedPosteForDrilldown!.id!);
        },
        error: (err) => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err?.error?.message)
      });
    } else {
      this.service.addActivite(payload).subscribe({
        next: () => {
          this.displayActiviteDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.loadActivitesByPoste(this.selectedPosteForDrilldown!.id!);
        },
        error: (err) => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err?.error?.message)
      });
    }
  }

  deleteActivite(item: ActiviteDTO): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant(this.P + 'CONFIRM_DELETE_ACTIVITE', { name: item.designationObjet }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.service.deleteActivite(item.id!).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.loadActivitesByPoste(this.selectedPosteForDrilldown!.id!);
          },
          error: (err) => this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err?.error?.message)
        });
      }
    });
  }

  applyPostesSearch(): void {
    this.loadPostes();
  }

  applyActivitesSearch(): void {
    if (this.selectedPosteForDrilldown?.id) {
      this.loadActivitesByPoste(this.selectedPosteForDrilldown.id);
    }
  }

  clearPostesTable(table: Table): void {
    table.clear();
    this.postesSearch = '';
    this.applyPostesSearch();
  }

  clearActivitesTable(table: Table): void {
    table.clear();
    this.activitesSearch = '';
    this.applyActivitesSearch();
  }

  private emptyPosteForm(): PosteForm {
    return {
      designationObjet: '',
      description: '',
      familleProfessionnelleId: null,
      familleEmploiId: null,
      emploiId: null
    };
  }

  private emptyActiviteForm(): ActiviteForm {
    return {
      designationObjet: '',
      description: '',
      ordreAffichage: null,
      posteTravailId: null
    };
  }
}
