import { Routes } from '@angular/router';
import { InitialisationMatriculesComponent } from 'app/features/onboarding/pages/initialisation-matricules/initialisation-matricules.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const ONBOARDING_ROUTES: Routes = [
  { path: 'InitialisationMatricules', component: InitialisationMatriculesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
];
