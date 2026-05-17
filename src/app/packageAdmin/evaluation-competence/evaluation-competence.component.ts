import { Component, OnInit } from '@angular/core';
import { Button, ButtonDirective } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { FormsModule } from "@angular/forms";
import { InputText } from "primeng/inputtext";
import { NgIf, CommonModule } from "@angular/common";
import { PrimeTemplate, MessageService, ConfirmationService } from "primeng/api";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { RadioButton } from 'primeng/radiobutton';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { EvaluationCompetenceService, CompetenceNotation } from '../../services/AdminService/evaluation-competence/evaluation-competence.service';
import { AgentModel } from '../../models/Agent.model';
import { Competence } from '../../models/ReferentielCompetences.model';
import { ToastHelper } from '../../shared/utils/toast-helper';

@Component({
  selector: 'app-evaluation-competence',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    Button,
    ButtonDirective,
    Dialog,
    FormsModule,
    InputText,
    NgIf,
    PrimeTemplate,
    TableModule,
    TooltipModule,
    RadioButton,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule
  ],
  templateUrl: './evaluation-competence.component.html',
  styleUrl: './evaluation-competence.component.scss'
})
export class EvaluationCompetenceComponent implements OnInit {

  usersList: AgentModel[] = [];

  searchUser = '';
  displayDialogUser = false;
  displayEditDialogUser = false;
  selectedUser: AgentModel | null = null;

  searchCompetence = "";
  competencesFiltres: Competence[] = [];

  notationsMap: { [key: number]: string } = {};
  loading = false;

  constructor(
    private evaluationCompetenceService: EvaluationCompetenceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initializeData();
    this.loadCompetences();
  }

  loadCompetences() {
    this.evaluationCompetenceService.getCompetences().subscribe({
      next: (res) => {
        this.competencesFiltres = Array.isArray(res) ? res : (res.content || []);
      },
      error: (err) => {
        console.error('Error loading competences:', err);
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  initializeData() {
    this.loading = true;
    if (this.searchUser && this.searchUser.trim().length > 0) {
      const criteria = { global: this.searchUser.trim() };
      this.evaluationCompetenceService.searchAgents(criteria).subscribe({
        next: (res) => {
          this.usersList = res;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error in searchAgents:', err);
          this.loading = false;
          ToastHelper.handleApiError(this.messageService, err, 'Erreur lors de la recherche');
        }
      });
    } else {
      this.evaluationCompetenceService.getAgents().subscribe({
        next: (res) => {
          this.usersList = res;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error in getAgents:', err);
          this.loading = false;
          ToastHelper.showLoadError(this.messageService);
        }
      });
    }
  }

  applySearch() {
    this.initializeData();
  }

  clearUsers(table: any) {
    this.searchUser = '';
    table.clear();
    this.applySearch();
  }

  onViewUser(user: AgentModel) {
    this.selectedUser = user;
    this.loadNotations(user.id!);
    this.displayDialogUser = true;
  }

  onEditUser(user: AgentModel) {
    this.selectedUser = user;
    this.loadNotations(user.id!);
    this.displayEditDialogUser = true;
  }

  loadNotations(agentId: number) {
    this.notationsMap = {};
    this.evaluationCompetenceService.getNotationsByAgent(agentId).subscribe({
      next: (notations) => {
        notations.forEach(n => {
          this.notationsMap[n.competenceId] = n.notation;
        });
      },
      error: (err) => {
        console.error('Error loading notations', err);
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  saveNotations() {
    if (!this.selectedUser || !this.selectedUser.id) return;

    const agentId = this.selectedUser.id;
    const savePromises = Object.keys(this.notationsMap).map(compId => {
      const notationValue = this.notationsMap[+compId];
      if (notationValue) {
        const payload: CompetenceNotation = {
          agentId: agentId,
          competenceId: +compId,
          notation: notationValue as any
        };
        return this.evaluationCompetenceService.saveNotation(payload).toPromise();
      }
      return Promise.resolve();
    });

    this.loading = true;
    Promise.all(savePromises).then(() => {
      this.loading = false;
      this.displayEditDialogUser = false;
      ToastHelper.showEdit(this.messageService);
    }).catch(err => {
      console.error('Error saving notations', err);
      this.loading = false;
      ToastHelper.showUpdateError(this.messageService, err?.error?.message);
    });
  }

  clearCompetences(table: any) {
    this.searchCompetence = "";
    table.clear();
  }
}
