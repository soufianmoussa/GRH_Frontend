import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { AgentcardComponent } from '../agentcard/agentcard.component';

@Component({
  selector: 'app-PDf-poste-travail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    AgentcardComponent
  ],
  templateUrl: './poste-travail.component.html',
  styleUrl: './poste-travail.component.scss'
})
export class PosteTravailComponent {

  selectedPoste: any = null;
  fichePoste: any = null;


  postes = [
    { label: 'Chef de cercle', value: 'chef_cercle' },
    { label: 'Administrateur', value: 'admin' },
    { label: 'Chef de service', value: 'chef_service' },
    { label: 'Adjoint technique', value: 'adjoint' },
  ];


  fichesData: any = {
    chef_cercle: {
      nomPoste: 'Chef de cercle',
      numeroPoste: '00287452',
      region: 'Région Sud',
      missions:
        'Chargé de la coordination et du maintien de l\'ordre dans sa circonscription.',
      activites: [
        'Participer aux réunions de la ville',
        'Assurer le suivi des activités communales',
        'Veiller au maintien de la sécurité publique',
        'Superviser les opérations administratives',
        'Rédiger les comptes-rendus officiels'
      ]
    },

    admin: {
      nomPoste: 'Administrateur',
      numeroPoste: '00354112',
      region: 'Rabat-Salé',
      missions: 'Assurer la gestion administrative interne.',
      activites: [
        'Gestion des dossiers',
        'Rédaction des rapports',
        'Suivi du personnel'
      ]
    }
  };


  chargerFiche() {
    this.fichePoste = this.fichesData[this.selectedPoste];
  }


  imprimer() {
    const content = document.getElementById('fiche-section')?.innerHTML;
    const printWindow = window.open('', '', 'width=900,height=700');

    if (printWindow && content) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Fiche de poste</title>
            <style>
              body { font-family: Arial; padding: 20px; }
              .section-title { border-bottom: 1px solid #000; margin-top: 20px; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }
}
