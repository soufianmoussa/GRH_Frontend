import { Component, OnInit, ViewChild } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { NgIf, CommonModule, NgClass } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { Echelon } from '../../../../models/Echelon.model';
import { EchelonService } from '../../services/echelon/echelon.service';
import { Textarea } from 'primeng/textarea';
import { PageResponse } from '../../../../models/PageResponse.model';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "primeng/tabs";
import { Echelle } from "../../../../models/Echelle.model";
import { EchelleService } from "../../services/echelle/echelle.service";
import { DropdownModule } from "primeng/dropdown";
import { AgentEchelon } from "../../../../models/AgentEchelon.model";
import { AgentEchelonService } from "../../services/echelon/agent-echelon.service";
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

@Component({
  selector: 'app-echelon',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, Dialog, NgIf, TableModule, Button, InputText,
    FormsModule, ButtonDirective, Textarea, Tab, TabList, TabPanel,
    TabPanels, Tabs, DropdownModule, Toast, ConfirmDialogModule,
    FloatLabelModule, TooltipModule, PrimeTemplate
  ],
  templateUrl: './echelon.component.html',
  styleUrl: './echelon.component.scss'
})
export class EchelonComponent implements OnInit {
  activeTab = '0';

  searchEchelon = '';
  loadingEchelons = false;
  situationEchelon: Echelon[] = [];
  totalRecordsEchelons = 0;
  pageSizeEchelons = 5;
  currentPageEchelons = 0;

  displayViewEchelon = false;
  displayDialogEchelon = false;
  dialogModeEchelon: 'add' | 'edit' = 'add';

  selectedEchelon: Echelon | null = null;
  formEchelon: any = {};
  @ViewChild('addFormEchelon') addFormEchelon?: NgForm;

  echellesDropdown: Echelle[] = [];
  selectedEchelleIdForEchelons: number | null = null;

  searchAgentEchelon = '';
  loadingAgentEchelons = false;
  agentEchelons: AgentEchelon[] = [];
  totalRecordsAgentEchelons = 0;
  pageSizeAgentEchelons = 5;
  currentPageAgentEchelons = 0;

  displayViewAgentEchelon = false;
  displayDialogAgentEchelon = false;
  dialogModeAgentEchelon: 'add' | 'edit' = 'add';

  selectedAgentEchelon: AgentEchelon | null = null;
  formAgentEchelon: any = {};
  @ViewChild('addFormAgentEchelon') addFormAgentEchelon?: NgForm;

  echelonsDropdown: Echelon[] = [];
  selectedEchelonIdForAgentEchelons: number | null = null;

  constructor(
    private echelonService: EchelonService,
    private echelleService: EchelleService,
    private agentEchelonService: AgentEchelonService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadEchellesDropdown();
    this.loadEchelonsDropdownData();
  }

  onTabChange(event: any) {
    const newValue = (event && typeof event === 'object' && 'value' in event) ? event.value : event;
    this.activeTab = newValue;
    if (this.activeTab === '1') {
      this.loadEchelonsDropdown();
    }
  }

  loadEchelons(page: number, size: number) {
    this.loadingEchelons = true;
    this.currentPageEchelons = page;
    this.pageSizeEchelons = size;
    const criteria = { global: this.searchEchelon, echelleId: this.selectedEchelleIdForEchelons };
    this.echelonService.getAll(page, size, criteria).subscribe({
      next: (res: PageResponse<Echelon>) => {
        this.situationEchelon = res.content ?? [];
        this.totalRecordsEchelons = res.totalElements ?? 0;
        this.loadingEchelons = false;
      },
      error: () => {
        ToastHelper.showLoadError(this.messageService);
        this.loadingEchelons = false;
      },
    });
  }

  onEchelonsPageChange(event: any) {
    const page = Math.floor(event.first / event.rows);
    this.loadEchelons(page, event.rows);
  }

  applySearchEchelon() {
    this.loadEchelons(0, this.pageSizeEchelons);
  }

  onSelectEchelleForEchelons() {
    this.loadEchelons(0, this.pageSizeEchelons);
  }

  refreshEchelonsTable() {
    this.loadEchelons(this.currentPageEchelons, this.pageSizeEchelons);
  }

  clearEchelon(table: Table) {
    this.searchEchelon = '';
    table.clear();
    this.applySearchEchelon();
  }

  loadEchellesDropdown() {
    this.echelleService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.echellesDropdown = res.content || [];
        if (this.echellesDropdown.length > 0 && !this.selectedEchelleIdForEchelons) {
          this.selectedEchelleIdForEchelons = this.echellesDropdown[0].id;
          this.loadEchelons(0, this.pageSizeEchelons);
        }
      }
    });
  }

  onViewEchelon(item: Echelon) {
    this.selectedEchelon = item;
    this.displayViewEchelon = true;
  }

  showAddEchelonDialog() {
    this.dialogModeEchelon = 'add';
    this.formEchelon = { echelleId: this.selectedEchelleIdForEchelons };
    this.displayDialogEchelon = true;
    setTimeout(() => {
      this.addFormEchelon?.resetForm(this.formEchelon);
    });
  }

  onEditEchelon(item: Echelon) {
    this.dialogModeEchelon = 'edit';
    this.formEchelon = {
      id: item.id,
      echelon: item.echelon,
      description: item.description || '',
      echelleId: item.echelle?.id || null
    };
    this.displayDialogEchelon = true;
    setTimeout(() => {
      this.addFormEchelon?.resetForm(this.formEchelon);
    });
  }

  saveEchelon() {
    const f = this.formEchelon;
    if (!f.echelon?.trim() || !f.echelleId) {
      ToastHelper.showFormError(this.messageService);
      return;
    }
    const payload = { ...f, echelon: f.echelon.trim(), description: (f.description || '').trim() };
    if (this.dialogModeEchelon === 'add') {
      this.echelonService.create(payload).subscribe({
        next: () => {
          this.displayDialogEchelon = false;
          ToastHelper.showAdd(this.messageService);
          this.refreshEchelonsTable();
          this.loadEchelonsDropdownData();
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      this.echelonService.update(f.id, payload).subscribe({
        next: () => {
          this.displayDialogEchelon = false;
          ToastHelper.showEdit(this.messageService);
          this.refreshEchelonsTable();
          this.loadEchelonsDropdownData();
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  onDeleteEchelon(item: Echelon) {
    if (!item?.id) return;
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.echelonService.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.refreshEchelonsTable();
          this.loadEchelonsDropdownData();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer l’échelon ${item.echelon} ?`);
  }

  loadAgentEchelons(page: number, size: number) {
    this.loadingAgentEchelons = true;
    this.currentPageAgentEchelons = page;
    this.pageSizeAgentEchelons = size;
    const criteria = { global: this.searchAgentEchelon, echelonId: this.selectedEchelonIdForAgentEchelons };
    this.agentEchelonService.getAll(page, size, criteria).subscribe({
      next: (res: PageResponse<AgentEchelon>) => {
        this.agentEchelons = res.content ?? [];
        this.totalRecordsAgentEchelons = res.totalElements ?? 0;
        this.loadingAgentEchelons = false;
      },
      error: () => {
        ToastHelper.showLoadError(this.messageService);
        this.loadingAgentEchelons = false;
      }
    });
  }

  onAgentEchelonsPageChange(event: any) {
    const page = Math.floor(event.first / event.rows);
    this.loadAgentEchelons(page, event.rows);
  }

  applySearchAgentEchelon() {
    this.loadAgentEchelons(0, this.pageSizeAgentEchelons);
  }

  onSelectEchelonForAgentEchelons() {
    this.loadAgentEchelons(0, this.pageSizeAgentEchelons);
  }

  clearAgentEchelon(table: Table) {
    this.searchAgentEchelon = '';
    table.clear();
    this.onSelectEchelonForAgentEchelons();
  }

  refreshAgentEchelonsTable() {
    this.loadAgentEchelons(this.currentPageAgentEchelons, this.pageSizeAgentEchelons);
  }

  loadEchelonsDropdown() {
    this.echelonService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.echelonsDropdown = res.content || [];
        if (this.echelonsDropdown.length > 0 && !this.selectedEchelonIdForAgentEchelons) {
          this.selectedEchelonIdForAgentEchelons = this.echelonsDropdown[0].id;
        }
        this.loadAgentEchelons(0, this.pageSizeAgentEchelons);
      }
    });
  }

  loadEchelonsDropdownData() {
    this.echelonService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.echelonsDropdown = res.content || [];
      }
    });
  }

  onViewAgentEchelon(item: AgentEchelon) {
    this.selectedAgentEchelon = item;
    this.displayViewAgentEchelon = true;
  }

  showAddAgentEchelonDialog() {
    this.dialogModeAgentEchelon = 'add';
    this.formAgentEchelon = { echelonId: this.selectedEchelonIdForAgentEchelons };
    this.displayDialogAgentEchelon = true;
    setTimeout(() => {
      this.addFormAgentEchelon?.resetForm(this.formAgentEchelon);
    });
  }

  onEditAgentEchelon(item: AgentEchelon) {
    this.dialogModeAgentEchelon = 'edit';
    this.formAgentEchelon = { id: item.id, matricule: item.matricule, echelonId: item.echelon?.id || null };
    this.displayDialogAgentEchelon = true;
    setTimeout(() => {
      this.addFormAgentEchelon?.resetForm(this.formAgentEchelon);
    });
  }

  saveAgentEchelon() {
    const f = this.formAgentEchelon;
    if (!f.matricule?.trim() || !f.echelonId) {
      ToastHelper.showFormError(this.messageService);
      return;
    }
    const payload = { matricule: f.matricule.trim(), echelonId: f.echelonId };
    if (this.dialogModeAgentEchelon === 'add') {
      this.agentEchelonService.create(payload).subscribe({
        next: () => {
          this.displayDialogAgentEchelon = false;
          ToastHelper.showAdd(this.messageService);
          this.refreshAgentEchelonsTable();
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      this.agentEchelonService.update(f.id, payload).subscribe({
        next: () => {
          this.displayDialogAgentEchelon = false;
          ToastHelper.showEdit(this.messageService);
          this.refreshAgentEchelonsTable();
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  onDeleteAgentEchelon(item: AgentEchelon) {
    if (!item?.id) return;
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.agentEchelonService.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.refreshAgentEchelonsTable();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer le lien pour le matricule ${item.matricule} ?`);
  }
}
