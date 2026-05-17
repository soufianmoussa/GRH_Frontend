import { Routes } from '@angular/router';
import { InitialisationMatriculesComponent } from 'app/features/onboarding/pages/initialisation-matricules/initialisation-matricules.component';
import { OnboardingActivationComponent } from 'app/features/onboarding/pages/onboarding-activation/onboarding-activation.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const ONBOARDING_ROUTES: Routes = [
  { path: 'onboarding/activate', component: OnboardingActivationComponent },
  { path: 'InitialisationMatricules', component: InitialisationMatriculesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
];
