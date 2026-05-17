import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { DashboardService, DashboardDto } from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TableModule, ChartModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  totalAgents: number = 1250;
  postesOccupes: number = 1180;
  congesMaternites: number = 52;
  accidentsMaladies: number = 12;
  avancementsPromotions: number = 85;
  actesVisesEnAttente: number = 24;
  dossiersPretsActifs: number = 110;

  congesData: any;
  congesOptions: any;

  echellesData: any;
  echellesOptions: any;

  pyramideAgeData: any;
  pyramideAgeOptions: any;

  effectifsUniteData: any;
  effectifsUniteOptions: any;

  familleProData: any;
  familleProOptions: any;

  primesData: any;
  primesOptions: any;

  derniersActes: any[] = [];

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngOnInit() {
    this.initOptions();
    this.loadMockData();
  }

  initOptions() {
    const textColor = '#334155';
    const textColorSecondary = '#64748b';
    const surfaceBorder = '#dfe7ef';

    this.congesOptions = {
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor } }
      },
      cutout: '60%'
    };

    this.echellesOptions = {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { display: false } },
        y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
      }
    };

    this.pyramideAgeOptions = {
      indexAxis: 'y',
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor } },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return context.dataset.label + ': ' + Math.abs(context.raw);
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
            callback: (value: any) => Math.abs(value)
          },
          grid: { color: surfaceBorder }
        },
        y: {
          stacked: true,
          ticks: { color: textColorSecondary },
          grid: { display: false }
        }
      }
    };

    this.effectifsUniteOptions = {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { display: false } },
        y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
      }
    };

    this.familleProOptions = {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
        y: { ticks: { color: textColorSecondary }, grid: { display: false } }
      }
    };

    this.primesOptions = {
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor } },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { stacked: true, ticks: { color: textColorSecondary }, grid: { display: false } },
        y: { stacked: true, ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
      }
    };
  }

  loadMockData() {
    this.derniersActes = [
      { matricule: 'A1023', typeDemande: 'Sanction', dateAffectation: '2024-03-10' },
      { matricule: 'B2254', typeDemande: 'Détachement', dateAffectation: '2024-03-08' },
      { matricule: 'C1189', typeDemande: 'Prise En Charge', dateAffectation: '2024-03-05' },
      { matricule: 'D4432', typeDemande: 'Stage de formation', dateAffectation: '2024-03-02' },
      { matricule: 'E5561', typeDemande: 'Réintégration', dateAffectation: '2024-02-28' }
    ];

    this.congesData = {
      labels: ['Congé Annuel', 'Maladie', 'Maternité', 'Exceptionnel', 'Sans Solde'],
      datasets: [
        {
          data: [25, 10, 7, 6, 4],
          backgroundColor: ['#3B82F6', '#EF4444', '#EC4899', '#F97316', '#64748B']
        }
      ]
    };

    this.echellesData = {
      labels: ['Informatique', 'Gestion/RH', 'Finance', 'Droit', 'Marketing', 'Ingénierie'],
      datasets: [
        {
          label: 'Effectif par Spécialité',
          backgroundColor: '#3B82F6',
          data: [45, 30, 25, 15, 10, 20]
        }
      ]
    };

    this.pyramideAgeData = {
      labels: ['18-25', '26-35', '36-45', '46-55', '56-65'],
      datasets: [
        {
          label: 'Hommes',
          backgroundColor: '#3B82F6',
          data: [-50, -120, -150, -100, -40]
        },
        {
          label: 'Femmes',
          backgroundColor: '#EC4899',
          data: [60, 140, 130, 90, 30]
        }
      ]
    };

    this.effectifsUniteData = {
      labels: ['Direction Générale', 'RH', 'Finance', 'Technique', 'Logistique', 'Communication'],
      datasets: [
        {
          label: 'Agents par Unité',
          backgroundColor: ['#3B82F6', '#22C55E', '#F97316', '#A855F7', '#64748B', '#06B6D4'],
          data: [20, 150, 100, 450, 300, 80]
        }
      ]
    };

    this.familleProData = {
      labels: ['Administration', 'Technique', 'Management', 'Santé', 'Social', 'Sécurité'],
      datasets: [
        {
          label: 'Effectif par Famille',
          backgroundColor: '#6366F1',
          data: [300, 500, 120, 80, 50, 100]
        }
      ]
    };

    this.primesData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [
        {
          type: 'bar',
          label: 'Primes Extra-Budgétaires',
          backgroundColor: '#3B82F6',
          data: [50, 45, 60, 55, 70, 65]
        },
        {
          type: 'bar',
          label: 'Indemnités Permanentes',
          backgroundColor: '#22C55E',
          data: [80, 80, 80, 85, 85, 85]
        },
        {
          type: 'bar',
          label: 'Indemnités Complémentaires',
          backgroundColor: '#F97316',
          data: [20, 25, 20, 30, 25, 35]
        }
      ]
    };
  }

  loadDashboardData() {

  }

  voirActe(acte: any) {
    const type = acte.typeDemande;
    let route = '';

    switch (type) {
      case 'Détachement': route = '/Detachement'; break;
      case 'Mise En Disponibilité': route = '/MiseEnDisponibilite'; break;
      case 'Réintégration': route = '/Reintegration'; break;
      case 'Radiation': route = '/Radiation'; break;
      case 'Prise En Charge': route = '/PriseEnCharge'; break;
      case 'Stage de formation': route = '/StageFormation'; break;
      case 'Suspension': route = '/Suspension'; break;
      case 'Sanction': route = '/Sanction'; break;
      default: route = '/dashboard'; break;
    }

    this.router.navigate([route]);
  }
}
