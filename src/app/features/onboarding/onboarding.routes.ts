import { Routes } from '@angular/router';
import { AdminOnboardingInitializeComponent } from 'app/features/onboarding/pages/admin-onboarding-initialize/admin-onboarding-initialize.component';
import { AdminOnboardingDetailComponent } from 'app/features/onboarding/pages/admin-onboarding-detail/admin-onboarding-detail.component';
import { AdminOnboardingListComponent } from 'app/features/onboarding/pages/admin-onboarding-list/admin-onboarding-list.component';
import { AgentOnboardingCompleteComponent } from 'app/features/onboarding/pages/agent-onboarding-complete/agent-onboarding-complete.component';
import { AgentOnboardingDashboardComponent } from 'app/features/onboarding/pages/agent-onboarding-dashboard/agent-onboarding-dashboard.component';
import { InitialisationMatriculesComponent } from 'app/features/onboarding/pages/initialisation-matricules/initialisation-matricules.component';
import { OnboardingActivationComponent } from 'app/features/onboarding/pages/onboarding-activation/onboarding-activation.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const ONBOARDING_ROUTES: Routes = [
  { path: 'onboarding/activate', component: OnboardingActivationComponent },
  { path: 'admin/onboarding', component: AdminOnboardingListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/onboarding/initialiser', component: AdminOnboardingInitializeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/onboarding/:id', component: AdminOnboardingDetailComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'agent/onboarding', component: AgentOnboardingDashboardComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'agent/onboarding/complete', component: AgentOnboardingCompleteComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'InitialisationMatricules', component: InitialisationMatriculesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
];
