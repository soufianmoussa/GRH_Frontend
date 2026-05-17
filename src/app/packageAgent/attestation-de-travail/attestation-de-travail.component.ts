import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentcardComponent } from '../../shared/components/agent-card/agent-card.component';
import { Button } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

@Component({
  selector: 'app-attestation-de-travail',
  standalone: true,
  imports: [CommonModule, Button, Tab, TabList, TabPanel, TabPanels, Tabs, AgentcardComponent],
  templateUrl: './attestation-de-travail.component.html',
  styleUrl: './attestation-de-travail.component.scss'
})
export class AttestationDeTravailComponent {


  attestation = {
    entreprise: 'INOVAT SARL',
    domaine: 'Société spécialisée en ingénierie et innovation technologique',
    nomEmploye: 'RAMDANI ABDELLAHLEK',
    fonction: 'Stagiaire Professionnel',
    dateDebut: '10 Décembre 2019',
    dateGeneration: new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    gerant: 'M. Mohamed BENSAID',
    lieu: 'Rabat'
  };


  printAttestation() {
    const printContent = document.getElementById('attestation-section')?.innerHTML;
    const printWindow = window.open('', '', 'width=900,height=700');
    if (printContent && printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Attestation de travail</title>
            <style>
              body {
                font-family: 'Segoe UI', sans-serif;
                color: #000;
                margin: 40px;
              }
              .attestation-container {
                border: 1px solid #000;
                padding: 40px;
                max-width: 700px;
                margin: auto;
              }
              h2 {
                text-align: center;
                text-transform: uppercase;
                text-decoration: underline;
              }
              .signature {
                margin-top: 50px;
                text-align: right;
              }
              .footer {
                margin-top: 60px;
                font-size: 13px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }
}





