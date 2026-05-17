import {Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Button, ButtonDirective} from 'primeng/button';
import {Table, TableModule} from 'primeng/table';
import {FormsModule, NgForm} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Dialog} from 'primeng/dialog';
import {NgIf} from '@angular/common';
import {Avancement} from '../../models/avancements.model';
import {AvancementsService} from '../../services/AdminService/avancements/avancements.service';
import {AgentModel} from '../../models/Agent.model';
import {AgentService} from '../../services/AdminService/agent.service';
import {Select} from 'primeng/select';
import {DatePicker} from 'primeng/datepicker';
import {TooltipModule} from 'primeng/tooltip';
import {PageResponse} from '../../models/PageResponse.model';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../shared/utils/toast-helper';
import {Textarea} from 'primeng/textarea';

type AvancementForm = {
  id?: number;
  agentId?: number;
  dateEffet: Date | null;
  echelle: string;
  echelon: string;
  motif: string;
  indemResidence: string;
  indemSujestion: string;
  indemTechnicite: string;
  indemEncadrement: string;
  allocAdmin: string;
};

@Component({
  selector: 'app-avencement',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    Button,
    TableModule,
    FormsModule,
    InputText,
    ButtonDirective,
    Dialog,
    NgIf,
    DatePicker,
    TooltipModule,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    PrimeTemplate,
    Textarea,
    Select
  ],
  templateUrl: './avencement.component.html',
  styleUrl: './avencement.component.scss'
})
export class AvencementComponent implements OnInit {

  searchAvancement = '';
  loading = false;

  displayDialogAvancement = false;
  selectedAvancement: Avancement | null = null;

  displayAddAvancement = false;
  displayEditAvancement = false;

  newAvancement: AvancementForm = this.emptyForm();
  editAvancement: AvancementForm | null = null;
  @ViewChild('addForm') addForm?: NgForm;
  @ViewChild('editForm') editForm?: NgForm;

  avancements: Avancement[] = [];
  agents: AgentModel[] = [];

  constructor(
    private avancementService: AvancementsService,
    private agentService: AgentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    this.loadPage();
  }

  loadAgents() {
    this.agentService.getAll().subscribe({
      next: (data: any) => {
        this.agents = data.content ? data.content : data;
      },
      error: (err: any) => console.error('Error loading agents', err)
    });
  }

  loadPage() {
    this.loading = true;

    this.avancementService.getAll(0, 1000, '').subscribe({
      next: (res: PageResponse<Avancement>) => {
        this.avancements = res.content ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement avancements', err);
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      },
    });
  }

  refreshTable() {
    this.loadPage();
  }

  clearAvancement(table: Table) {
    this.searchAvancement = '';
    table.clear();
  }

  onViewAvancement(item: Avancement) {
    this.selectedAvancement = item;
    this.displayDialogAvancement = true;
  }

  showAddAvancementDialog() {
    this.newAvancement = this.emptyForm();
    this.displayAddAvancement = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.newAvancement);
    });
  }

  createAvancement() {
    if (!this.newAvancement.agentId || !this.newAvancement.dateEffet || !this.newAvancement.echelle?.trim() ||
        !this.newAvancement.echelon?.trim() || !this.newAvancement.indemResidence?.trim() ||
        !this.newAvancement.indemSujestion?.trim() || !this.newAvancement.indemTechnicite?.trim() ||
        !this.newAvancement.indemEncadrement?.trim() || !this.newAvancement.allocAdmin?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: Partial<Avancement> = {
      agentId: this.newAvancement.agentId,
      dateEffet: this.toIsoDate(this.newAvancement.dateEffet),
      echelle: this.newAvancement.echelle.trim(),
      echelon: this.newAvancement.echelon.trim(),
      motif: this.newAvancement.motif?.trim() || null,
      indemResidence: this.newAvancement.indemResidence.trim(),
      indemSujestion: this.newAvancement.indemSujestion.trim(),
      indemTechnicite: this.newAvancement.indemTechnicite.trim(),
      indemEncadrement: this.newAvancement.indemEncadrement.trim(),
      allocAdmin: this.newAvancement.allocAdmin.trim(),
    };

    this.loading = true;
    this.avancementService.create(payload).subscribe({
      next: () => {
        this.displayAddAvancement = false;
        this.loading = false;
        ToastHelper.showAdd(this.messageService);
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur create avancement', err);
        ToastHelper.showAddError(this.messageService, err?.error?.message);
        this.loading = false;
      },
    });
  }

  onEditAvancement(item: Avancement) {
    this.editAvancement = {
      id: item.id,
      agentId: item.agentId,
      dateEffet: this.fromIsoDate(item.dateEffet),
      echelle: item.echelle ?? '',
      echelon: item.echelon ?? '',
      motif: item.motif ?? '',
      indemResidence: item.indemResidence ?? '',
      indemSujestion: item.indemSujestion ?? '',
      indemTechnicite: item.indemTechnicite ?? '',
      indemEncadrement: item.indemEncadrement ?? '',
      allocAdmin: item.allocAdmin ?? '',
    };
    this.displayEditAvancement = true;
    setTimeout(() => {
      this.editForm?.resetForm(this.editAvancement);
    });
  }

  updateAvancement() {
    if (!this.editAvancement?.id) return;

    if (!this.editAvancement.agentId || !this.editAvancement.dateEffet || !this.editAvancement.echelle?.trim() ||
        !this.editAvancement.echelon?.trim() || !this.editAvancement.indemResidence?.trim() ||
        !this.editAvancement.indemSujestion?.trim() || !this.editAvancement.indemTechnicite?.trim() ||
        !this.editAvancement.indemEncadrement?.trim() || !this.editAvancement.allocAdmin?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: Partial<Avancement> = {
      agentId: this.editAvancement.agentId,
      dateEffet: this.toIsoDate(this.editAvancement.dateEffet),
      echelle: this.editAvancement.echelle.trim(),
      echelon: this.editAvancement.echelon.trim(),
      motif: this.editAvancement.motif?.trim() || null,
      indemResidence: this.editAvancement.indemResidence.trim(),
      indemSujestion: this.editAvancement.indemSujestion.trim(),
      indemTechnicite: this.editAvancement.indemTechnicite.trim(),
      indemEncadrement: this.editAvancement.indemEncadrement.trim(),
      allocAdmin: this.editAvancement.allocAdmin.trim(),
    };

    this.loading = true;
    this.avancementService.update(this.editAvancement.id, payload).subscribe({
      next: () => {
        this.displayEditAvancement = false;
        this.editAvancement = null;
        this.loading = false;
        ToastHelper.showEdit(this.messageService);
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur update avancement', err);
        ToastHelper.showUpdateError(this.messageService, err?.error?.message);
        this.loading = false;
      },
    });
  }

  onDeleteAvancement(item: Avancement) {
    if (!item?.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.loading = true;
      this.avancementService.delete(item.id).subscribe({
        next: () => {
          this.loading = false;
          ToastHelper.showDelete(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur delete avancement', err);
          ToastHelper.showDeleteError(this.messageService, err?.error?.message);
          this.loading = false;
        },
      });
    }, `Supprimer l'avancement pour l'agent ${item.agentMatricule} ?`);
  }

  private emptyForm(): AvancementForm {
    return {
      agentId: undefined,
      dateEffet: null,
      echelle: '',
      echelon: '',
      motif: '',
      indemResidence: '',
      indemSujestion: '',
      indemTechnicite: '',
      indemEncadrement: '',
      allocAdmin: '',
    };
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromIsoDate(value: any): Date | null {
    if (!value) return null;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }

}
