import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { AgentcardComponent } from '../../shared/components/agent-card/agent-card.component';
import { MouvementModel } from '../../models/MouvementModel.model';
import { MouvementService } from '../../services/AdminService/mouvement/mouvement.service';
import { ToastHelper } from '../../shared/utils/toast-helper';

type HistoriqueActe = {
  id?: number;
  acte: string;
  date: string;
};

@Component({
  selector: 'app-historique-des-actes',
  providers: [MessageService],
  imports: [
    AgentcardComponent,
    Button,
    ButtonDirective,
    Dialog,
    InputText,
    NgIf,
    PrimeTemplate,
    ReactiveFormsModule,
    TableModule,
    Tooltip,
    FormsModule,
    FloatLabelModule,
    Toast
  ],
  templateUrl: './historique-des-actes.component.html',
  styleUrl: './historique-des-actes.component.scss'
})
export class HistoriqueDesActesComponent implements OnInit {

  historiqueActes: HistoriqueActe[] = [];
  loading = false;
  searchText = '';
  displayDialog = false;
  selectedActe: HistoriqueActe | null = null;

  constructor(
    private mouvementService: MouvementService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadHistoriqueActes();
  }

  loadHistoriqueActes(): void {
    this.loading = true;

    this.mouvementService.getMyMouvements().subscribe({
      next: (mouvements: MouvementModel[]) => {
        this.historiqueActes = mouvements.map(item => this.toHistoriqueActe(item));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  onViewActe(item: HistoriqueActe) {
    this.selectedActe = item;
    this.displayDialog = true;
  }

  clear(table: Table) {
    table.clear();
    this.searchText = '';
  }

  private toHistoriqueActe(item: MouvementModel): HistoriqueActe {
    return {
      id: item.id,
      acte: item.acte || item.typeActe || '-',
      date: item.dateEffet || '-'
    };
  }

}
