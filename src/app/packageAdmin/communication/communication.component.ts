import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Button, ButtonDirective} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {InputText} from 'primeng/inputtext';
import {FormsModule, NgForm} from '@angular/forms';
import {Table, TableModule} from 'primeng/table';
import {NgIf} from '@angular/common';
import {Communication} from '../../models/communications.model';
import {CommunicationsService} from '../../services/AdminService/communications/communications.service';
import {AgentModel} from '../../models/Agent.model';
import {AgentService} from '../../services/AdminService/agent.service';
import {Select} from 'primeng/select';
import {DatePicker} from 'primeng/datepicker';
import {PageResponse} from '../../models/PageResponse.model';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { ToastHelper } from '../../shared/toast-helper';

@Component({
  selector: 'app-communication',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    Button,
    Dialog,
    InputText,
    FormsModule,
    TableModule,
    ButtonDirective,
    NgIf,
    DatePicker,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    TooltipModule,
    PrimeTemplate,
    Select
  ],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.scss'
})
export class CommunicationComponent implements OnInit {
  searchCom = '';
  loading = false;

  communications: Communication[] = [];
  agents: AgentModel[] = [];

  displayDialogCom = false;
  displayAddCom = false;
  displayEditCom = false;

  selectedCom: Communication | null = null;

  newCom: Communication = this.emptyCom();
  editCom: Communication | null = null;
  @ViewChild('addForm') addForm?: NgForm;
  @ViewChild('editForm') editForm?: NgForm;

  constructor(
    private communicationService: CommunicationsService,
    private agentService: AgentService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    this.loadData();
  }

  loadAgents() {
    this.agentService.getAll().subscribe({
      next: (data: any) => {
        this.agents = data.content ? data.content : data;
      },
      error: (err: any) => console.error('Error loading agents', err)
    });
  }

  private emptyCom(): Communication {
    return {
      agentId: undefined,
      dateRecrutement: undefined,
      email: '',
      telephoneDomicile: '',
      fax: '',
      gsm: ''
    };
  }

  loadData() {
    this.loading = true;

    this.communicationService.getAll(0, 1000, '').subscribe({
      next: (res: PageResponse<Communication>) => {
        this.communications = res.content ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading communications:', err);
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      }
    });
  }

  clearCom(table: Table) {
    this.searchCom = '';
    table.clear();
  }

  onViewCom(item: Communication) {
    this.selectedCom = item;
    this.displayDialogCom = true;
  }

  showAddComDialog() {
    this.newCom = this.emptyCom();
    this.displayAddCom = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.newCom);
    });
  }

  addCom() {
    if (!this.newCom.agentId || !this.newCom.dateRecrutement || !this.newCom.email?.trim() ||
        !this.newCom.gsm?.trim() || !this.newCom.telephoneDomicile?.trim() || !this.newCom.fax?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.normalizeDates(this.newCom),
      email: this.newCom.email.trim(),
      gsm: this.newCom.gsm.trim(),
      telephoneDomicile: this.newCom.telephoneDomicile.trim(),
      fax: this.newCom.fax.trim()
    };

    this.communicationService.add(payload).subscribe({
      next: () => {
        this.displayAddCom = false;
        ToastHelper.showAdd(this.messageService);
        this.loadData();
      },
      error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
    });
  }

  onEditCom(item: Communication) {
    this.editCom = {
      ...item,
      dateRecrutement: this.fromIso(item.dateRecrutement) as any
    };
    this.displayEditCom = true;
    setTimeout(() => {
      this.editForm?.resetForm(this.editCom);
    });
  }

  updateCom() {
    if (!this.editCom?.id) return;
    if (!this.editCom.agentId || !this.editCom.dateRecrutement || !this.editCom.email?.trim() ||
        !this.editCom.gsm?.trim() || !this.editCom.telephoneDomicile?.trim() || !this.editCom.fax?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.normalizeDates(this.editCom),
      email: this.editCom.email.trim(),
      gsm: this.editCom.gsm.trim(),
      telephoneDomicile: this.editCom.telephoneDomicile.trim(),
      fax: this.editCom.fax.trim()
    };

    this.communicationService.update(this.editCom.id, payload).subscribe({
      next: () => {
        this.displayEditCom = false;
        this.editCom = null;
        ToastHelper.showEdit(this.messageService);
        this.loadData();
      },
      error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
    });
  }

  deleteCom(item: Communication) {
    if (!item.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.communicationService.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadData();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer les données de communication pour l'agent ${item.agentMatricule} ?`);
  }

  private normalizeDates(payload: any) {
    const copy = { ...payload };
    if (copy.dateRecrutement instanceof Date) {
      copy.dateRecrutement = this.toIsoDate(copy.dateRecrutement);
    }
    return copy;
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromIso(v: any): Date | null {
    if (!v) return null;
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
