import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import {Button, ButtonDirective} from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { PrimeTemplate, ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import {Tag} from 'primeng/tag';
import {DropdownModule} from 'primeng/dropdown';
import {Dialog} from 'primeng/dialog';

@Component({
  selector: 'app-conge-approbation',
  standalone: true,
  providers: [ConfirmationService, MessageService],
  imports: [
    CommonModule,
    Button,
    InputText,
    TableModule,
    FormsModule,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    PrimeTemplate,
    Tag,
    ConfirmDialog,
    DropdownModule,
    ButtonDirective,
    Dialog
  ],
  templateUrl: './conge-approbation.component.html',
  styleUrls: ['./conge-approbation.component.scss']
})
export class CongeApprobationComponent {

  searchConge = '';

  categories = [
    { label: 'Congé annuel' },
    { label: 'Congé maladie' },
    { label: 'Congé exceptionnel' }
  ];

  statuts = [
    { label: 'Approuvé' },
    { label: 'Rejeté' },
    { label: 'En attente' }
  ];

  demandesConge = [
    { date: '26/10/2023', demandeur: 'M. MUSTAPHA EL KHAY', categorie: 'Congé annuel', du: '18/10/2023', statut: 'En attente' },
    { date: '15/01/2024', demandeur: 'Mme SARA BOUHLAOUI', categorie: 'Congé maladie', du: '14/01/2024', statut: 'En attente' },
    { date: '20/12/2023', demandeur: 'M. OMAR BENALI', categorie: 'Congé exceptionnel', du: '20/12/2023', statut: 'En attente' },
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  clear(table: any) {
    table.clear();
    this.searchConge = '';
  }

  approuverConge(item: any) {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment approuver la demande de <b>${item.demandeur}</b> ?`,
      header: 'Confirmer l’approbation',
      icon: 'pi pi-check-circle',
      acceptLabel: 'approuver',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        item.statut = 'Approuvé';
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'La demande a été approuvée.' });
      }
    });
  }

  rejeterConge(item: any) {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment rejeter la demande de <b>${item.demandeur}</b> ?`,
      header: 'Confirmer le rejet',
      icon: 'pi pi-times-circle',
      acceptLabel: 'rejeter',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        item.statut = 'Rejeté';
        this.messageService.add({ severity: 'error', summary: 'Rejeté', detail: 'La demande a été rejetée.' });
      }
    });
  }

  displayRejetDialog: boolean = false;
  selectedDemande: any = null;
  raisonRejet: string = "";

  openRejetDialog(item: any) {
    this.selectedDemande = item;
    this.raisonRejet = "";
    this.displayRejetDialog = true;
  }

  confirmerRejet() {
    if (!this.raisonRejet || this.raisonRejet.trim() === "") {
      this.messageService.add({
        severity: 'warn',
        summary: 'Motif requis',
        detail: 'Veuillez entrer la raison du rejet.'
      });
      return;
    }

    this.selectedDemande.statut = "Rejeté";
    this.selectedDemande.raisonRejet = this.raisonRejet;

    this.displayRejetDialog = false;

    this.messageService.add({
      severity: 'error',
      summary: 'Demande rejetée',
      detail: `Motif : ${this.raisonRejet}`
    });
  }

}
