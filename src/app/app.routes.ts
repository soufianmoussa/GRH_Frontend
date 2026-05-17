import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: '', loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
  { path: '', loadChildren: () => import('./features/gestion-comptes/gestion-comptes.routes').then(m => m.GESTION_COMPTES_ROUTES) },
  { path: '', loadChildren: () => import('./features/dossier-agent/dossier-agent.routes').then(m => m.DOSSIER_AGENT_ROUTES) },
  { path: '', loadChildren: () => import('./features/gestion-organisationnelle/gestion-organisationnelle.routes').then(m => m.GESTION_ORGANISATIONNELLE_ROUTES) },
  { path: '', loadChildren: () => import('./features/conges/conges.routes').then(m => m.CONGES_ROUTES) },
  { path: '', loadChildren: () => import('./features/actes-administratifs/actes-administratifs.routes').then(m => m.ACTES_ADMINISTRATIFS_ROUTES) },
  { path: '', loadChildren: () => import('./features/documents/documents.routes').then(m => m.DOCUMENTS_ROUTES) },
  { path: '', loadChildren: () => import('./features/onboarding/onboarding.routes').then(m => m.ONBOARDING_ROUTES) },
  { path: '', loadChildren: () => import('./features/parametrage/parametrage.routes').then(m => m.PARAMETRAGE_ROUTES) },
  { path: '**', redirectTo: 'login' }
];
