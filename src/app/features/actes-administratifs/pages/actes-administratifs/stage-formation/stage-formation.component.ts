import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AgentcardComponent } from '../../../../../shared/components/agent-card/agent-card.component';

import { TableModule, Table } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tabs, Tab, TabList, TabPanel, TabPanels } from 'primeng/tabs';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PrimeTemplate, MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Select } from 'primeng/select';
import { MouvementModel } from '../../../../../models/MouvementModel.model';
import { TypeActe } from '../../../../../enums/TypeActe';
import { MouvementService } from '../../../services/mouvement/mouvement.service';
import { AgentService } from '../../../../dossier-agent/services/agent.service';
import { AgentModel } from '../../../../../models/Agent.model';
import { AuthService } from '../../../../../core/auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-stage-formation',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    AgentcardComponent,
    TableModule,
    Dialog,
    Button,
    ButtonDirective,
    InputText,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    PrimeTemplate,
    ConfirmDialogModule,
    Toast,
    DatePicker,
    FloatLabelModule,
    NgIf,
    Select,
    TranslateModule
  ],
  templateUrl: './stage-formation.component.html',
  styleUrls: ['./stage-formation.component.scss']
})
export class StageFormationComponent implements OnInit {

  constructor(
    private mouvementService: MouvementService,
    private agentService: AgentService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
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

  searchStage = '';
  isAdmin = false;
  isAgent = false;
  agents: AgentModel[] = [];

  ngOnInit() {
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.isAgent = this.authService.hasRole('AGENT');
    if (this.isAdmin) {
      this.agentService.getAll().subscribe({
        next: (res) => this.agents = res,
        error: (err) => console.error('Error loading agents:', err)
      });
    }
    this.initializeData();
  }

  // ============================ API
  stageData: any;
  initializeData() {
    const criteria: any = { typeActe: TypeActe.ST };
    if (this.searchStage && this.searchStage.trim().length > 0) {
      criteria.global = this.searchStage.trim();
    }

    const obs = this.isAgent
      ? this.mouvementService.getMyMouvements(criteria)
      : this.mouvementService.getMouvements(criteria);

    obs.subscribe({
      next: (res) => {
        this.stageData = res;
      },
      error: (err) => {
        console.error('Error in stageData:', err);
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
      }
    });
  }

  applySearch() {
    this.initializeData();
  }
  newMouvement: any = {};
  addMouvement() {

    this.newMouvement.typeActe = TypeActe.ST;
    if (this.dialogMode != 'edit') {
      if (!this.newMouvement.agentId || !this.newMouvement.acte?.trim() ||
          !this.newMouvement.dateEffet || !this.newMouvement.dateFinPrevisionnelle) {
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_FORM');
        return;
      }
      this.mouvementService.addMouvement(this.newMouvement).subscribe({
        next: res => {
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
          this.displayDialog = false;
          this.newMouvement = {};
          this.initializeData();
          this.cdr.detectChanges();
        },
        error: err => {
          console.error(err);
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_ADD', err.error?.message);
        }
      });
    }
    else {
      this.mouvementService.updateMouvement(this.newMouvement.id, this.newMouvement).subscribe({
        next: res => {
          this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_EDIT');
          this.displayDialog = false;
          this.newMouvement = {};
          this.dialogMode = 'add';
          this.initializeData();
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Update failed:', err);
          this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_UPDATE', err.error?.message);
        }
      });
    }
  }

  updateMouvement(item: any) {
    this.dialogMode = 'edit';
    this.newMouvement = { ...item };
    if (this.newMouvement.dateEffet) {
      this.newMouvement.dateEffet = new Date(this.newMouvement.dateEffet);
    }
    if (this.newMouvement.dateFinPrevisionnelle) {
      this.newMouvement.dateFinPrevisionnelle = new Date(this.newMouvement.dateFinPrevisionnelle);
    }
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.newMouvement);
    });
  }

  deleteMouvement(item: any) {
    this.confirmationService.confirm({
      message: this.translate.instant('GLOBAL.CONFIRM.DELETE_MSG'),
      header: this.translate.instant('GLOBAL.CONFIRM.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('GLOBAL.OUI'),
      rejectLabel: this.translate.instant('GLOBAL.NON'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.mouvementService.deleteMouvement(item.id).subscribe({
          next: () => {
            this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_DELETE');
            this.initializeData();
            this.cdr.detectChanges();
          },
          error: err => {
            console.error(err);
            this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_DELETE', err.error?.message);
          }
        });
      }
    });
  }
  clearTable(table: Table) {
    this.searchStage = '';
    table.clear();
    this.applySearch();
  }

  /** 👁️ Visualisation */
  displayView = false;
  selected: MouvementModel | null = null;

  onView(item: any) {
    this.selected = item;
    this.displayView = true;
  }
  showAddDialog() {
    this.dialogMode = 'add';
    this.newMouvement = {};
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.newMouvement);
    });
  }
  /** ➕✏ Dialog ajout / modif */
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editIndex = -1;
  @ViewChild('addForm') addForm?: NgForm;
  // ============================= API

}
