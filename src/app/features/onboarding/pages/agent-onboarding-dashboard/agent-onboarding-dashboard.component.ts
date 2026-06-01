import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import {
  OnboardingDetail,
  OnboardingStep,
  OnboardingStepType
} from '../../../../models/onboarding.model';
import { AgentOnboardingService } from '../../services/agent-onboarding.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { OnboardingStatusBadgeComponent } from '../../components/onboarding-status-badge/onboarding-status-badge.component';

type ActionCardState = 'todo' | 'in-progress' | 'done' | 'locked';

interface ActionCard {
  key: 'profil' | 'documents' | 'recapitulatif';
  title: string;
  description: string;
  icon: string;
  route: string;
  state: ActionCardState;
}

interface TimelineEntry {
  label: string;
  status: 'done' | 'pending';
  at?: string;
}

const STEP_LABELS: Record<OnboardingStepType, string> = {
  MATRICULE_ALLOCATION: 'Matricule attribue',
  ACCOUNT_ACTIVATION: 'Compte active',
  PROFILE: 'Profil renseigne',
  DOCUMENTS: 'Documents fournis',
  REVIEW: 'Dossier soumis',
  VALIDATION: 'Validation administrative'
};

@Component({
  selector: 'app-agent-onboarding-dashboard',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ProgressBarModule,
    MessageModule,
    TagModule,
    Toast,
    OnboardingStatusBadgeComponent
  ],
  templateUrl: './agent-onboarding-dashboard.component.html',
  styleUrl: './agent-onboarding-dashboard.component.scss'
})
export class AgentOnboardingDashboardComponent implements OnInit {
  onboarding?: OnboardingDetail;
  loading = true;

  constructor(
    private onboardingService: AgentOnboardingService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.onboardingService.getMine().subscribe({
      next: (onboarding) => {
        this.onboarding = onboarding;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        ToastHelper.handleApiError(this.messageService, error, 'Erreur lors du chargement de votre onboarding.');
      }
    });
  }

  // Single source of truth: backend OnboardingStepService.computeProgressPercent.
  get progress(): number {
    return this.onboarding?.progressPercent ?? 0;
  }

  agentFullName(): string {
    const a = this.onboarding?.agent;
    return [a?.prenom, a?.nom].filter(Boolean).join(' ') || 'Agent';
  }

  nextActionHint(): string {
    if (!this.onboarding) return '';
    switch (this.onboarding.status) {
      case 'PENDING_VALIDATION':
        return 'Votre dossier est en attente de validation par l\'administration.';
      case 'VALIDATED':
      case 'ACTIVE':
        return 'Votre onboarding est termine. Bienvenue !';
      case 'REJECTED':
        return 'Votre dossier a ete rejete. Corrigez les elements signales et resoumettez-le.';
      default:
        break;
    }
    const current = this.onboarding.currentStep;
    switch (current) {
      case 'PROFILE':
        return 'Etape suivante : completer votre profil.';
      case 'DOCUMENTS':
        return 'Etape suivante : televerser vos documents.';
      case 'REVIEW':
      case 'VALIDATION':
        return 'Etape suivante : verifier et soumettre votre dossier.';
      default:
        return 'Commencez par completer votre profil.';
    }
  }

  actionCards(): ActionCard[] {
    const locked = this.locked();
    const profileDone = this.isStepDone('PROFILE');
    const documentsDone = this.areAllRequiredDocsUploaded();
    const dossierSubmitted = ['PENDING_VALIDATION', 'VALIDATED', 'ACTIVE'].includes(this.onboarding?.status ?? '');

    return [
      {
        key: 'profil',
        title: 'Mon profil',
        description: 'Renseignez vos informations personnelles et coordonnees.',
        icon: 'pi pi-user',
        route: '/mon-onboarding/wizard',
        state: locked ? 'locked' : (profileDone ? 'done' : (this.onboarding?.currentStep === 'PROFILE' ? 'in-progress' : 'todo'))
      },
      {
        key: 'documents',
        title: 'Mes documents',
        description: 'Televersez les pieces justificatives demandees.',
        icon: 'pi pi-file',
        route: '/mon-onboarding/wizard',
        state: locked ? 'locked' : (documentsDone ? 'done' : (profileDone ? 'in-progress' : 'todo'))
      },
      {
        key: 'recapitulatif',
        title: 'Recapitulatif',
        description: 'Verifiez votre dossier et soumettez-le pour validation.',
        icon: 'pi pi-send',
        route: '/mon-onboarding/wizard',
        state: dossierSubmitted ? 'done' : (profileDone && documentsDone ? 'in-progress' : 'todo')
      }
    ];
  }

  timeline(): TimelineEntry[] {
    const steps = this.onboarding?.steps ?? [];
    if (!steps.length) return [];
    return steps.map<TimelineEntry>(step => ({
      label: this.stepLabel(step),
      status: step.status === 'COMPLETED' ? 'done' : 'pending',
      at: step.completedAt
    }));
  }

  cardCtaLabel(card: ActionCard): string {
    switch (card.state) {
      case 'done': return 'Voir';
      case 'in-progress': return 'Continuer';
      case 'locked': return 'Voir';
      default: return 'Commencer';
    }
  }

  cardBadge(card: ActionCard): { value: string; severity: 'success' | 'info' | 'warn' | 'secondary' } | null {
    switch (card.state) {
      case 'done': return { value: 'Termine', severity: 'success' };
      case 'in-progress': return { value: 'En cours', severity: 'info' };
      case 'locked': return { value: 'Verrouille', severity: 'secondary' };
      default: return { value: 'A faire', severity: 'warn' };
    }
  }

  locked(): boolean {
    return !!this.onboarding && ['PENDING_VALIDATION', 'VALIDATED', 'ACTIVE'].includes(this.onboarding.status);
  }

  private isStepDone(type: OnboardingStepType): boolean {
    const s = this.onboarding?.steps ?? [];
    return s.some(step => (step.stepType === type || step.stepKey === type) && step.status === 'COMPLETED');
  }

  private areAllRequiredDocsUploaded(): boolean {
    const required = (this.onboarding?.documents ?? []).filter(d => d.required);
    return required.length > 0 && required.every(d => !!d.fileName);
  }

  private stepLabel(step: OnboardingStep): string {
    const key = (step.stepType || step.stepKey) as OnboardingStepType | undefined;
    return key ? STEP_LABELS[key] ?? key : 'Etape';
  }
}
