import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { Avancement } from '../../models/avancements.model';
import { PageResponse } from '../../models/PageResponse.model';
import { AvancementsService } from '../../services/AdminService/avancements/avancements.service';
import { ToastHelper } from '../../shared/utils/toast-helper';

type SituationFonctionnelle = {
  id: number;
  Grade: string;
  Corps: string;
  Echelle: string;
  DateDebut: string;
};

@Component({
  selector: 'app-carriere',
  providers: [MessageService],
  imports: [
    AgentcardComponent,
    Button,
    ButtonDirective,
    Dialog,
    FormsModule,
    InputText,
    NgIf,
    PrimeTemplate,
    TableModule,
    Tooltip,
    FloatLabelModule,
    Toast
  ],
  templateUrl: './carriere.component.html',
  styleUrl: './carriere.component.scss'
})
export class CarriereComponent implements OnInit {

  searchFonctionnelle = '';
  loading = false;
  situationFonctionnelle: SituationFonctionnelle[] = [];

  displayDialogFonctionnelle = false;
  selectedFonctionnelle: SituationFonctionnelle | null = null;

  constructor(
    private avancementsService: AvancementsService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadSituationFonctionnelle();
  }

  loadSituationFonctionnelle(): void {
    this.loading = true;

    this.avancementsService.getMine(0, 1000).subscribe({
      next: (res: PageResponse<Avancement>) => {
        this.situationFonctionnelle = (res.content ?? []).map(item => this.toSituationFonctionnelle(item));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  onViewFonctionnelle(item: SituationFonctionnelle) {
    this.selectedFonctionnelle = item;
    this.displayDialogFonctionnelle = true;
  }

  clearFonctionnelle(table: Table) {
    table.clear();
    this.searchFonctionnelle = '';
  }

  private toSituationFonctionnelle(item: Avancement): SituationFonctionnelle {
    const agentLabel = [item.agentMatricule, item.agentNom, item.agentPrenom]
      .filter(Boolean)
      .join(' ');

    return {
      id: item.id,
      Grade: item.motif || '-',
      Corps: agentLabel || '-',
      Echelle: [item.echelle, item.echelon].filter(Boolean).join(' / ') || '-',
      DateDebut: item.dateEffet || '-'
    };
  }

}
