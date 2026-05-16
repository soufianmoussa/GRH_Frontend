import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputText } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TypeUniteStructurelle } from '../../../enums/type-unite-structurelle.enum';
import {
  UniteStructurelle,
  UniteStructurelleCreateUpdateRequest
} from '../../../models/gestionOrganisationelle/unite-structurelle.model';
import { UniteStructurelleService } from '../../../services/AdminService/GestionOrganisationelle/unite-structurelle.service';
import { PageResponse } from '../../../models/PageResponse.model';

type FormModel = {
  id: number | null;
  code: string;
  abreviation: string;
  libelle: string;
  parentId: number | null;
};

interface BreadcrumbItem {
  label: string;
  type: TypeUniteStructurelle;
  parentId?: number;
  translateLabel?: boolean;
}

@Component({
  selector: 'app-unite-structurelle',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    ButtonDirective,
    Dialog,
    DropdownModule,
    InputText,
    TooltipModule,
    ConfirmDialogModule,
    Toast,
    PrimeTemplate,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    FloatLabelModule,
    TranslateModule
  ],
  templateUrl: './unite-structurelle.component.html',
  styleUrls: ['./unite-structurelle.component.scss']
})
export class UniteStructurelleComponent implements OnInit {

  currentType: TypeUniteStructurelle = TypeUniteStructurelle.DIRECTION;
  currentParentId: number | undefined = undefined;

  breadcrumb: BreadcrumbItem[] = [
    { label: 'GESTION_ORGANISATIONELLE.GLOBAL.DIRECTIONS', type: TypeUniteStructurelle.DIRECTION, translateLabel: true }
  ];

  list: UniteStructurelle[] = [];
  total = 0;
  page = 0;
  pageSize = 10;
  loading = false;
  search = '';

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  selected: UniteStructurelle | null = null;
  form: FormModel = this.emptyForm();

  @ViewChild('addForm') addForm?: NgForm;

  constructor(
    private service: UniteStructurelleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
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

  loadPage(page: number): void {
    this.page = page;
    this.loading = true;

    this.service.getAll(page, this.pageSize, this.currentType, this.search || undefined, this.currentParentId).subscribe({
      next: (res: PageResponse<UniteStructurelle>) => {
        this.list = res?.content ?? [];
        this.total = res?.totalElements ?? 0;
        this.loading = false;
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
        this.list = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.pageSize = event.rows;
    this.loadPage(Math.floor(event.first / event.rows));
  }

  applySearch(): void {
    this.loadPage(0);
  }

  clearTable(table: Table): void {
    table.clear();
    this.search = '';
    this.applySearch();
  }

  drillDown(item: UniteStructurelle): void {
    const nextType = this.getChildType(this.currentType);
    if (!nextType || !item.id) return;

    this.currentType = nextType;
    this.currentParentId = item.id;
    this.search = '';

    this.breadcrumb.push({
      label: item.libelle,
      type: nextType,
      parentId: item.id,
      translateLabel: false
    });

    this.loadPage(0);
  }

  goToBreadcrumb(index: number): void {
    const crumb = this.breadcrumb[index];
    this.breadcrumb = this.breadcrumb.slice(0, index + 1);
    this.currentType = crumb.type;
    this.currentParentId = crumb.parentId;
    this.search = '';
    this.loadPage(0);
  }

  canDrillDown(): boolean {
    return this.currentType !== TypeUniteStructurelle.SERVICE;
  }

  private getChildType(t: TypeUniteStructurelle): TypeUniteStructurelle | null {
    if (t === TypeUniteStructurelle.DIRECTION) return TypeUniteStructurelle.DIVISION;
    if (t === TypeUniteStructurelle.DIVISION) return TypeUniteStructurelle.SERVICE;
    return null;
  }

  get currentTypeLabel(): string {
    const g = 'GESTION_ORGANISATIONELLE.GLOBAL.';
    if (this.currentType === TypeUniteStructurelle.DIRECTION) return this.translate.instant(g + 'DIRECTIONS');
    if (this.currentType === TypeUniteStructurelle.DIVISION) return this.translate.instant(g + 'DIVISIONS');
    return this.translate.instant(g + 'SERVICES');
  }

  get currentIcon(): string {
    if (this.currentType === TypeUniteStructurelle.DIRECTION) return 'pi pi-building';
    if (this.currentType === TypeUniteStructurelle.DIVISION) return 'pi pi-th-large';
    return 'pi pi-cog';
  }

  get addButtonLabel(): string {
    const u = 'GESTION_ORGANISATIONELLE.UNITE_STRUCTURELLE.';
    if (this.currentType === TypeUniteStructurelle.DIRECTION) return this.translate.instant(u + 'ADD_DIRECTION');
    if (this.currentType === TypeUniteStructurelle.DIVISION) return this.translate.instant(u + 'ADD_DIVISION');
    return this.translate.instant(u + 'ADD_SERVICE');
  }

  get dialogHeader(): string {
    const isAdd = this.dialogMode === 'add';
    const u = 'GESTION_ORGANISATIONELLE.UNITE_STRUCTURELLE.';
    if (this.currentType === TypeUniteStructurelle.DIRECTION) return this.translate.instant(u + (isAdd ? 'ADD_DIRECTION' : 'EDIT_DIRECTION'));
    if (this.currentType === TypeUniteStructurelle.DIVISION) return this.translate.instant(u + (isAdd ? 'ADD_DIVISION' : 'EDIT_DIVISION'));
    return this.translate.instant(u + (isAdd ? 'ADD_SERVICE' : 'EDIT_SERVICE'));
  }

  onView(item: UniteStructurelle): void {
    this.selected = item;
    this.displayView = true;
  }

  showAddDialog(): void {
    this.dialogMode = 'add';
    this.form = this.emptyForm();
    if (this.currentParentId) {
      this.form.parentId = this.currentParentId;
    }
    if (this.addForm) {
      this.addForm.resetForm(this.form);
    }
    this.displayDialog = true;
  }

  onEdit(item: UniteStructurelle): void {
    this.dialogMode = 'edit';
    this.form = {
      id: item.id ?? null,
      code: item.code ?? '',
      abreviation: item.abreviation ?? '',
      libelle: item.libelle ?? '',
      parentId: item.parentId ?? null
    };
    if (this.addForm) {
      this.addForm.resetForm(this.form);
    }
    this.displayDialog = true;
  }

  save(): void {

    if (this.addForm?.invalid) {
      this.addForm.form.markAllAsTouched();
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.REQUIRED_FIELDS');
      return;
    }

    const code = this.form.code ? this.form.code.trim() : '';
    const abreviation = this.form.abreviation ? this.form.abreviation.trim() : '';
    const libelle = this.form.libelle ? this.form.libelle.trim() : '';

    if (!code || !abreviation || !libelle) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.REQUIRED_FIELDS');
      return;
    }

    const payload: UniteStructurelleCreateUpdateRequest = {
      code,
      abreviation,
      libelle,
      type: this.currentType,
      parentId: (this.currentType === TypeUniteStructurelle.DIRECTION) ? null : this.form.parentId
    };

    if (this.currentType !== TypeUniteStructurelle.DIRECTION && !payload.parentId) {
      this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM'); // Simplified
      return;
    }

    this.loading = true;

    if (this.dialogMode === 'add') {
      this.service.add(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.loadPage(this.page);
        },
        error: (err: any) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err.error?.message);
          this.loading = false;
        }
      });
    } else {
      if (!this.form.id) return;
      this.service.update(this.form.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.loadPage(this.page);
        },
        error: (err: any) => {
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err.error?.message);
          this.loading = false;
        }
      });
    }
  }

  onDelete(item: UniteStructurelle): void {
    if (!item?.id) return;

    this.confirmationService.confirm({
      message: this.translate.instant('GLOBAL.CONFIRM.DELETE_MSG'),
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
            this.loadPage(this.page);
          },
          error: (err: any) => {
            this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err.error?.message);
            this.loading = false;
          }
        });
      }
    });
  }

  private emptyForm(): FormModel {
    return { id: null, code: '', abreviation: '', libelle: '', parentId: null };
  }
}
