import { Routes } from '@angular/router';
import { FonctionsComponent } from 'app/features/gestion-organisationnelle/pages/fonctions/fonctions.component';
import { HistoriqueAffectationsComponent } from 'app/features/gestion-organisationnelle/pages/gestion-organisationnelle/historique-affectations/historique-affectations.component';
import { OrganigrammeComponent } from 'app/features/gestion-organisationnelle/pages/gestion-organisationnelle/organigramme/organigramme.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const GESTION_ORGANISATIONNELLE_ROUTES: Routes = [
  // L'Organigramme est désormais le hub unique : unités, responsables, postes et
  // affectations s'y gèrent via des dialogs contextuels. Les anciennes pages CRUD
  // (UniteStructurelle, Postes, AffectationAgentPoste, ResponsableUs) ont été supprimées.
  { path: 'Organigramme', component: OrganigrammeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'HistoriqueAffectations', component: HistoriqueAffectationsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Fonctions', component: FonctionsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
];
