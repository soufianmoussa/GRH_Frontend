import { Routes } from '@angular/router';
import { AdminOnboardingAssistedCompleteComponent } from 'app/features/onboarding/pages/admin-onboarding-assisted-complete/admin-onboarding-assisted-complete.component';
import { AdminOnboardingInitializeComponent } from 'app/features/onboarding/pages/admin-onboarding-initialize/admin-onboarding-initialize.component';
import { AdminOnboardingDetailComponent } from 'app/features/onboarding/pages/admin-onboarding-detail/admin-onboarding-detail.component';
import { AdminOnboardingListComponent } from 'app/features/onboarding/pages/admin-onboarding-list/admin-onboarding-list.component';
import { AgentOnboardingDashboardComponent } from 'app/features/onboarding/pages/agent-onboarding-dashboard/agent-onboarding-dashboard.component';
import { AgentOnboardingWizardComponent } from 'app/features/onboarding/pages/agent-onboarding-wizard/agent-onboarding-wizard.component';
import { InitialisationMatriculesComponent } from 'app/features/onboarding/pages/initialisation-matricules/initialisation-matricules.component';
import { OnboardingActivationComponent } from 'app/features/onboarding/pages/onboarding-activation/onboarding-activation.component';
import { roleGuard } from 'app/core/guards/role.guard';

// =============================================================================
// Onboarding routing
// -----------------------------------------------------------------------------
// Canonical agent paths:
//   /activation                       - public, set initial password
//   /mon-onboarding                   - hub (status, progress, action cards, timeline)
//   /mon-onboarding/wizard            - multi-step wizard (identite, coordonnees, documents, recapitulatif)
// =============================================================================
export const ONBOARDING_ROUTES: Routes = [
  { path: 'activation', component: OnboardingActivationComponent },
  { path: 'onboarding/activate', redirectTo: 'activation', pathMatch: 'full' },

  {
    path: 'mon-onboarding',
    component: AgentOnboardingDashboardComponent,
    canActivate: [roleGuard],
    data: { roles: ['AGENT'] }
  },
  {
    path: 'mon-onboarding/wizard',
    component: AgentOnboardingWizardComponent,
    canActivate: [roleGuard],
    data: { roles: ['AGENT'] }
  },
  { path: 'mon-onboarding/profil', redirectTo: 'mon-onboarding/wizard', pathMatch: 'full' },
  { path: 'mon-onboarding/documents', redirectTo: 'mon-onboarding/wizard', pathMatch: 'full' },
  { path: 'mon-onboarding/recapitulatif', redirectTo: 'mon-onboarding/wizard', pathMatch: 'full' },
  { path: 'onboarding/waiting', redirectTo: 'mon-onboarding', pathMatch: 'full' },
  { path: 'onboarding/complete-profile', redirectTo: 'mon-onboarding/wizard', pathMatch: 'full' },
  { path: 'agent/onboarding', redirectTo: 'mon-onboarding', pathMatch: 'full' },
  { path: 'agent/onboarding/complete', redirectTo: 'mon-onboarding/wizard', pathMatch: 'full' },

  // --- Admin (unchanged) -----------------------------------------------------
  { path: 'admin/onboarding/initialiser', component: AdminOnboardingInitializeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/onboarding/documents', redirectTo: 'admin/onboarding', pathMatch: 'full' },
  { path: 'admin/onboarding/:id/complete', component: AdminOnboardingAssistedCompleteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/onboarding/:id', component: AdminOnboardingDetailComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/onboarding', component: AdminOnboardingListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'InitialisationMatricules', component: InitialisationMatriculesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
];
