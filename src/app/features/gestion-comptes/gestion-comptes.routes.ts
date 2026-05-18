import { Routes } from '@angular/router';
import { GestionUtilisateursComponent } from 'app/features/gestion-comptes/pages/gestion-utilisateurs/gestion-utilisateurs.component';
import { GestionComptesComponent } from 'app/features/gestion-comptes/pages/gestion-comptes/gestion-comptes.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const GESTION_COMPTES_ROUTES: Routes = [
  { path: 'GestionUtilisateurs', component: GestionUtilisateursComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'GestionComptes', component: GestionComptesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
];
