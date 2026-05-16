import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule, Table } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Poste } from '../../../models/gestionOrganisationelle/poste.model';
import { PosteService } from '../../../services/AdminService/GestionOrganisationelle/poste.service';
import { PageResponse } from '../../../models/PageResponse.model';
import { Calendar } from 'primeng/calendar';
import { Dialog } from 'primeng/dialog';
import { Tooltip } from 'primeng/tooltip';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { UniteStructurelleService } from '../../../services/AdminService/GestionOrganisationelle/unite-structurelle.service';
import { FonctionService } from '../../../services/AdminService/GestionOrganisationelle/fonction.service';
import { PostesactivitesService } from '../../../services/AdminService/postesActivites/postesactivites.service';

type PosteForm = {
  id?: number;
  codeCourt: string;
  dateCreation: Date | null;
  libelleDuPoste: string;
  uniteStructurelleId: number | null;
  fonctionId: number | null;
  posteTravailId: number | null;
}

@Component({
  selector: 'app-postes',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    TableModule,
    Button,
    InputText,
    FormsModule,
    ButtonDirective,
    Calendar,
    Dialog,
    Tooltip,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    DropdownModule,
    TranslateModule
  ],
  templateUrl: './postes.component.html',
  styleUrl: './postes.component.scss'
})
export class PostesComponent implements OnInit {

  loading = false;
  search = '';

  postes: Poste[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;

  displayView = false;
  displayEdit = false;

  selected: Poste | null = null;
  editPoste: PosteForm | null = null;

  unites: { label: string, value: number }[] = [];
  fonctions: { label: string, value: number }[] = [];
  postesTravail: { label: string, value: number }[] = [];

  constructor(
    private router: Router,
    private posteService: PosteService,
    private uniteService: UniteStructurelleService,
    private fonctionService: FonctionService,
    private posteTravailService: PostesactivitesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadPage(0, this.pageSize);
    this.loadDropdowns();
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

  loadDropdowns(): void {
    this.uniteService.getAll(0, 1000).subscribe(res => {
      this.unites = (res.content || []).map(u => ({ label: u.libelle, value: u.id! }));
    });
    this.fonctionService.getAll(0, 1000).subscribe(res => {
      this.fonctions = (res.content || []).map(f => ({ label: f.libelle, value: f.id! }));
    });
    this.posteTravailService.getPostes().subscribe(res => {
      this.postesTravail = (res || []).map(p => ({ label: p.designationObjet, value: p.id! }));
    });
  }

  loadPage(page: number, size: number): void {
    this.loading = true;
    this.currentPage = page;
    this.pageSize = size;

    this.posteService.getAll(page, size, this.search).subscribe({
      next: (res: PageResponse<Poste>) => {
        this.postes = res?.content ?? [];
        this.totalRecords = res?.totalElements ?? 0;
        this.loading = false;
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GESTION_ORGANISATIONELLE.POSTES.ERR_LOAD'); // Simplified
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows);
    this.loadPage(page, event.rows);
  }

  applySearch(): void {
    this.loadPage(0, this.pageSize);
  }

  clearTable(table: Table): void {
    table.clear();
    this.search = '';
    this.applySearch();
  }

  goToAddPoste(): void {
    this.router.navigate(['/Postes/ajouter']);
  }

  onView(item: Poste): void {
    this.selected = item;
    this.displayView = true;
  }

  onEdit(item: Poste): void {
    this.editPoste = {
      id: item.id,
      codeCourt: item.codeCourt,
      libelleDuPoste: item.libelleDuPoste,
      dateCreation: this.fromIsoDate(item.dateCreation),
      uniteStructurelleId: item.uniteStructurelleId ?? null,
      fonctionId: item.fonctionId ?? null,
      posteTravailId: item.posteTravailId ?? null
    };
    this.displayEdit = true;
  }

  update(): void {
    if (!this.editPoste?.id) return;

    if (!this.editPoste.codeCourt.trim() || !this.editPoste.libelleDuPoste.trim()) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GESTION_ORGANISATIONELLE.POSTES.ERR_REQUIRED');
      return;
    }

    const payload: Partial<Poste> = {
      codeCourt: this.editPoste.codeCourt.trim(),
      libelleDuPoste: this.editPoste.libelleDuPoste.trim(),
      dateCreation: this.toIsoDate(this.editPoste.dateCreation),
      uniteStructurelleId: this.editPoste.uniteStructurelleId,
      fonctionId: this.editPoste.fonctionId,
      posteTravailId: this.editPoste.posteTravailId
    };

    this.loading = true;
    this.posteService.update(this.editPoste.id, payload).subscribe({
      next: () => {
        this.displayEdit = false;
        this.editPoste = null;
        this.loading = false;
        this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
        this.loadPage(this.currentPage, this.pageSize);
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE');
        this.loading = false;
      }
    });
  }

  onDelete(item: Poste): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant('GESTION_ORGANISATIONELLE.POSTES.CONFIRM_DELETE_MSG', { poste: item.libelleDuPoste }),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.loading = true;
        this.posteService.delete(item.id!).subscribe({
          next: () => {
            this.loading = false;
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.loadPage(this.currentPage, this.pageSize);
          },
          error: () => {
            this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE');
            this.loading = false;
          }
        });
      }
    });
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromIsoDate(v: any): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
}
