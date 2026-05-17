import {Component, OnInit, ChangeDetectorRef, ViewChild} from '@angular/core';
import { NgForm } from '@angular/forms';
import {Button, ButtonDirective} from 'primeng/button';
import {Table, TableModule} from 'primeng/table';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {Dialog} from 'primeng/dialog';
import {NgIf, CommonModule} from '@angular/common';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToastHelper } from '../../shared/utils/toast-helper';
import { AgentService } from '../../services/AdminService/agent.service';
import { AgentModel } from '../../models/Agent.model';


interface Agent {
  id?: number;
  matricule: string;
  dateTutorat: string;
  numEnfant: number;
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  nomAr: string;
  prenomAr: string;
  cin: string;
  pprTuteur: string;
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
}



@Component({
  selector: 'app-agent',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    Button,
    TableModule,
    InputText,
    FormsModule,
    ButtonDirective,
    Dialog,
    FloatLabelModule,
    DatePicker,
    DropdownModule,
    Toast,
    ConfirmDialogModule,
    TooltipModule
  ],
  templateUrl: './agent.component.html',
  styleUrl: './agent.component.scss'
})
export class AgentComponent implements OnInit {

  @ViewChild('agentForm') agentForm?: NgForm;

  search = "";
  loading = false;

  agents: Agent[] = [];
  selected: Agent | null = null;

  sexes = [
    { label: 'Homme', value: 'Homme' },
    { label: 'Femme', value: 'Femme' }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private agentService: AgentService
  ) {}

  ngOnInit() {
    this.loadInitial();
  }

  loadInitial() {
    this.loading = true;
    this.agentService.getAll().subscribe({
      next: (agents) => {
        this.agents = agents.map(agent => this.toAgentView(agent));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        ToastHelper.showLoadError(this.messageService);
        this.cdr.detectChanges();
      }
    });
  }

  applySearch() {

  }

  clearTable(table: Table) {
    table.clear();
    this.search = "";
    this.applySearch();
  }


  displayView = false;

  onView(item: Agent) {
    this.selected = item;
    this.displayView = true;
  }


  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  currentAgent: Agent = this.emptyAgent();
  editIndex = -1;

  showAddDialog() {
    this.dialogMode = 'add';
    this.currentAgent = this.emptyAgent();
    this.displayDialog = true;
    setTimeout(() => {
      this.agentForm?.resetForm();
      this.currentAgent = this.emptyAgent();
    });
  }

  onEdit(item: Agent) {
    this.dialogMode = 'edit';
    this.editIndex = this.agents.indexOf(item);
    this.currentAgent = {
      ...item,
      dateTutorat: this.fromIsoDate(item.dateTutorat) as any,
      dateNaissance: this.fromIsoDate(item.dateNaissance) as any
    };
    this.displayDialog = true;
    // We don't call resetForm(this.currentAgent) because control names don't match properties.
    // NgModel will handle the population. We just clear validation state.
    setTimeout(() => {
      const savedAgent = { ...this.currentAgent };
      this.agentForm?.control.markAsPristine();
      this.agentForm?.control.markAsUntouched();
      this.currentAgent = savedAgent;
    });
  }

  save() {
    if (!this.validateForm(this.currentAgent)) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.currentAgent,
      dateTutorat: this.toIsoDate(this.currentAgent.dateTutorat as any)!,
      dateNaissance: this.toIsoDate(this.currentAgent.dateNaissance as any)!
    };

    if (this.dialogMode === 'add') {
      payload.id = this.agents.length + 1;
      this.agents.push(payload);
      ToastHelper.showAdd(this.messageService);
    } else {
      this.agents[this.editIndex] = payload;
      ToastHelper.showEdit(this.messageService);
    }

    this.displayDialog = false;
    this.cdr.detectChanges();
  }


  onDelete(item: Agent) {
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.agents = this.agents.filter(a => a !== item);
      ToastHelper.showDelete(this.messageService);
      this.cdr.detectChanges();
    });
  }

  private validateForm(agent: any): boolean {
    if (!agent) return false;
    const requiredFields = [
      'matricule', 'dateTutorat', 'numEnfant', 'nom', 'prenom',
      'sexe', 'dateNaissance', 'nomAr', 'prenomAr', 'cin',
      'pprTuteur', 'adresse', 'codePostal', 'ville', 'pays'
    ];

    for (const field of requiredFields) {
      const value = agent[field];
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
    }
    return true;
  }

  private emptyAgent(): Agent {
    return {
      matricule: "",
      dateTutorat: "",
      numEnfant: 0,
      nom: "",
      prenom: "",
      sexe: "",
      dateNaissance: "",
      nomAr: "",
      prenomAr: "",
      cin: "",
      pprTuteur: "",
      adresse: "",
      codePostal: "",
      ville: "",
      pays: ""
    };
  }

  private toAgentView(agent: AgentModel): Agent {
    return {
      id: agent.id,
      matricule: agent.matricule,
      dateTutorat: agent.dateTutorat,
      numEnfant: agent.numEnfant,
      nom: agent.nom,
      prenom: agent.prenom,
      sexe: agent.sexe,
      dateNaissance: agent.dateNaissance,
      nomAr: agent.nomTuteurAr,
      prenomAr: agent.prenomTuteurAr,
      cin: agent.cin,
      pprTuteur: agent.pprTuteur,
      adresse: agent.adresse,
      codePostal: agent.codePostal,
      ville: agent.ville,
      pays: (agent as any).pays ?? ""
    };
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d || !(d instanceof Date)) return d as any;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromIsoDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }

}
