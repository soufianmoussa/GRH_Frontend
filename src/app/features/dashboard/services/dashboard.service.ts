import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

// ============================================================
// Domain types — single source of truth for the BI dashboard.
// ============================================================

export type TrendDirection = 'up' | 'down' | 'flat';
export type Accent = 'teal' | 'indigo' | 'violet' | 'amber' | 'emerald' | 'rose' | 'pink';

export interface Kpi {
  key: string;
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
  deltaPct?: number;
  trend?: TrendDirection;
  positiveIsGood?: boolean;
  sparkline?: number[];
  icon?: string;
  accent?: Accent;
  route?: string;
}

export interface DashboardAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  count?: number;
  icon?: string;
  route?: string;
  cta?: string;
  agedDays?: number;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface OnboardingFunnel {
  toActivate: number;
  inProgress: number;
  toValidate: number;
  validated: number;
  rejected: number;
}

export interface AgePyramid {
  labels: string[];
  men: number[];
  women: number[];
}

export interface PendingValidation {
  id: number;
  agent: string;
  matricule: string;
  type: string;
  daysWaiting: number;
  route: string;
}

export interface UnitHeadcount {
  unit: string;
  total: number;
  hires: number;
  exits: number;
  netChange: number;
}

export interface RecentActe {
  matricule: string;
  agent: string;
  typeDemande: string;
  dateAffectation: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PrimeSeries {
  labels: string[];
  series: { name: string; values: number[]; accent: Accent }[];
}

export type DashboardPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

export interface DashboardSnapshot {
  generatedAt: string;
  period: DashboardPeriod;
  kpis: Kpi[];
  alerts: DashboardAlert[];
  headcountTrend: { labels: string[]; values: number[] };
  agePyramid: AgePyramid;
  leaveCategoriesBreakdown: SeriesPoint[];
  byEchelle: SeriesPoint[];
  bySpecialite: SeriesPoint[];
  byUnit: SeriesPoint[];
  primesEvolution: PrimeSeries;
  onboardingFunnel: OnboardingFunnel;
  topUnits: UnitHeadcount[];
  pendingValidations: PendingValidation[];
  recentActes: RecentActe[];
}

// ============================================================
// Service
// ============================================================

@Injectable({ providedIn: 'root' })
export class DashboardService {

  getSnapshot(period: DashboardPeriod = 'month'): Observable<DashboardSnapshot> {
    // TODO(backend): GET /api/admin/dashboard/snapshot?period=...
    return of(this.buildMock(period)).pipe(delay(180));
  }

  // ----------------------------------------------------------
  // Mock — realistic Moroccan public-sector HR data.
  // ----------------------------------------------------------
  private buildMock(period: DashboardPeriod): DashboardSnapshot {
    return {
      generatedAt: new Date().toISOString(),
      period,

      kpis: [
        { key: 'total-agents',      label: 'Effectif total',         value: 1487, deltaPct:  2.4, trend: 'up',   positiveIsGood: true,  sparkline: [1420,1432,1438,1445,1450,1455,1462,1470,1475,1480,1483,1487], icon: 'pi-users',           accent: 'indigo',  hint: 'Agents actifs (hors retraités/radiés)', route: '/GestionUtilisateurs' },
        { key: 'new-hires',         label: 'Nouveaux agents',        value:   32, suffix: '/mois', deltaPct: 12.5, trend: 'up', positiveIsGood: true, sparkline: [18,22,19,25,21,28,24,29,26,31,27,32], icon: 'pi-user-plus', accent: 'emerald', hint: 'Onboarding initialisés ce mois', route: '/admin/onboarding' },
        { key: 'pending-validation',label: 'À valider',              value:   24, deltaPct: -8.0, trend: 'down', positiveIsGood: false, sparkline: [40,38,36,35,33,30,28,27,26,25,24,24], icon: 'pi-clipboard-check', accent: 'amber',   hint: 'Dossiers onboarding en attente de validation', route: '/admin/onboarding' },
        { key: 'pending-modifs',    label: 'Modifs à approuver',     value:    7, deltaPct: 16.7, trend: 'up',   positiveIsGood: false, sparkline: [3,4,4,5,5,6,6,7,6,7,7,7], icon: 'pi-pencil',           accent: 'rose',    hint: 'Demandes de changement de profil agent', route: '/ApprobationModifications' },
        { key: 'on-leave',          label: 'En congé actuellement',  value:   89, deltaPct:  4.2, trend: 'up',   positiveIsGood: true,  sparkline: [70,75,72,78,80,82,85,84,86,87,88,89], icon: 'pi-calendar', accent: 'teal',    hint: 'Tous types confondus, à la date du jour', route: '/GestionCongesAgents' },
        { key: 'active-loans',      label: 'Prêts actifs',           value:  156, deltaPct: -1.3, trend: 'down', positiveIsGood: true,  sparkline: [160,161,160,159,158,158,157,157,156,156,156,156], icon: 'pi-wallet', accent: 'violet', hint: 'Prêts financiers en cours de remboursement', route: '/PretFinancier' }
      ],

      alerts: [
        { id: 'a1', severity: 'critical', title: '5 dossiers d\'onboarding bloqués depuis > 7 jours', description: 'Dossiers en attente d\'activation de compte par l\'agent.', count:  5, icon: 'pi-exclamation-triangle', route: '/admin/onboarding',           cta: 'Voir',     agedDays: 9 },
        { id: 'a2', severity: 'warning',  title: '12 contrats arrivent à échéance dans 30 jours',     description: 'Renouvellements ou actions administratives à anticiper.',  count: 12, icon: 'pi-clock',                 route: '/GestionUtilisateurs',         cta: 'Voir',     agedDays: 0 },
        { id: 'a3', severity: 'warning',  title: '7 demandes de modification à approuver',           description: 'Modifications de profil agent en attente de validation RH.', count:  7, icon: 'pi-pencil',                route: '/ApprobationModifications',    cta: 'Approuver', agedDays: 0 },
        { id: 'a4', severity: 'info',     title: '3 actes administratifs prêts pour visa',            description: 'Documents complets en attente de signature.',                count:  3, icon: 'pi-stamp',                 route: '/ActesVisa',                   cta: 'Signer',    agedDays: 0 }
      ],

      headcountTrend: {
        labels: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'],
        values: [1420,1432,1438,1445,1450,1455,1462,1470,1475,1480,1483,1487]
      },

      agePyramid: {
        labels: ['18-25','26-35','36-45','46-55','56-65'],
        men:    [ 45, 135, 210, 180,  75],
        women:  [ 55, 160, 205, 165,  60]
      },

      leaveCategoriesBreakdown: [
        { label: 'Congé annuel', value: 42 },
        { label: 'Maladie',       value: 18 },
        { label: 'Maternité',     value: 12 },
        { label: 'Exceptionnel',  value: 10 },
        { label: 'Sans solde',    value:  7 }
      ],

      byEchelle: [
        { label: 'Éch. 6',  value: 230 },
        { label: 'Éch. 8',  value: 310 },
        { label: 'Éch. 9',  value: 280 },
        { label: 'Éch. 10', value: 240 },
        { label: 'Éch. 11', value: 320 },
        { label: 'Hors Éch.', value: 107 }
      ],

      bySpecialite: [
        { label: 'Informatique',      value: 180 },
        { label: 'Gestion / RH',      value: 220 },
        { label: 'Finance',           value: 165 },
        { label: 'Droit',             value: 120 },
        { label: 'Ingénierie civile', value: 145 },
        { label: 'Santé',             value:  90 },
        { label: 'Communication',     value:  85 }
      ],

      byUnit: [
        { label: 'Direction générale',     value:  35 },
        { label: 'Ressources humaines',    value: 145 },
        { label: 'Finance & Compta',       value: 178 },
        { label: 'Direction technique',    value: 412 },
        { label: 'Logistique',             value: 287 },
        { label: 'Communication',          value:  92 },
        { label: 'Affaires juridiques',    value: 134 },
        { label: 'Audit interne',          value:  68 }
      ],

      primesEvolution: {
        labels: ['Jan','Fév','Mar','Avr','Mai','Juin'],
        series: [
          { name: 'Indemnités permanentes',     values: [820,825,830,835,840,845], accent: 'indigo' },
          { name: 'Indemnités complémentaires', values: [120,135,130,145,140,155], accent: 'teal'   },
          { name: 'Primes extra-budgétaires',   values: [ 50, 45, 60, 55, 70, 65], accent: 'amber'  }
        ]
      },

      onboardingFunnel: {
        toActivate: 18,
        inProgress: 32,
        toValidate: 24,
        validated:  156,
        rejected:    4
      },

      topUnits: [
        { unit: 'Direction technique',    total: 412, hires: 12, exits:  3, netChange:  9 },
        { unit: 'Logistique',             total: 287, hires:  8, exits:  5, netChange:  3 },
        { unit: 'Finance & Compta',       total: 178, hires:  5, exits:  2, netChange:  3 },
        { unit: 'Ressources humaines',    total: 145, hires:  4, exits:  1, netChange:  3 },
        { unit: 'Affaires juridiques',    total: 134, hires:  2, exits:  4, netChange: -2 }
      ],

      pendingValidations: [
        { id: 1, agent: 'Sara Benjelloun',   matricule: 'A1102', type: 'Onboarding',   daysWaiting: 9, route: '/admin/onboarding' },
        { id: 2, agent: 'Karim Idrissi',     matricule: 'A1098', type: 'Onboarding',   daysWaiting: 8, route: '/admin/onboarding' },
        { id: 3, agent: 'Latifa Tazi',       matricule: 'B2021', type: 'Modification', daysWaiting: 5, route: '/ApprobationModifications' },
        { id: 4, agent: 'Mehdi Cherkaoui',   matricule: 'C3104', type: 'Détachement',  daysWaiting: 3, route: '/Detachement' },
        { id: 5, agent: 'Hicham El Yacoubi', matricule: 'A1085', type: 'Onboarding',   daysWaiting: 2, route: '/admin/onboarding' }
      ],

      recentActes: [
        { matricule: 'A1023', agent: 'Yassine Berrada', typeDemande: 'Sanction',        dateAffectation: '2026-05-30', status: 'APPROVED' },
        { matricule: 'B2254', agent: 'Nadia Lahlou',    typeDemande: 'Détachement',     dateAffectation: '2026-05-29', status: 'APPROVED' },
        { matricule: 'C1189', agent: 'Omar Saidi',      typeDemande: 'Prise en charge',dateAffectation: '2026-05-28', status: 'PENDING'  },
        { matricule: 'D4432', agent: 'Imane Filali',    typeDemande: 'Stage formation',dateAffectation: '2026-05-26', status: 'APPROVED' },
        { matricule: 'E5561', agent: 'Anas Benkirane',  typeDemande: 'Réintégration',  dateAffectation: '2026-05-24', status: 'REJECTED' },
        { matricule: 'F8821', agent: 'Salma Touzani',   typeDemande: 'Suspension',     dateAffectation: '2026-05-22', status: 'APPROVED' }
      ]
    };
  }
}
