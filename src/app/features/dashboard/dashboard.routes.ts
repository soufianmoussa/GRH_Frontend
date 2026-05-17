import { Routes } from '@angular/router';
import { DashboardComponent } from 'app/features/dashboard/pages/dashboard/dashboard.component';
import { AccueilComponent } from 'app/features/dashboard/pages/accueil/accueil.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'accueil', component: AccueilComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
];
