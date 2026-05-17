import { Routes } from '@angular/router';
import { ResponsableUsComponent } from 'app/features/gestion-organisationnelle/pages/gestion-organisationnelle/responsable-us/responsable-us.component';
import { FonctionsComponent } from 'app/features/gestion-organisationnelle/pages/fonctions/fonctions.component';
import { PostesComponent } from 'app/features/gestion-organisationnelle/pages/gestion-organisationnelle/postes/postes.component';
import { UniteStructurelleComponent } from 'app/features/gestion-organisationnelle/pages/gestion-organisationnelle/unite-structurelle/unite-structurelle.component';
import { AffectationAgentPosteComponent } from 'app/features/gestion-organisationnelle/pages/gestion-organisationnelle/affectation-agent-poste/affectation-agent-poste.component';
import { HistoriqueAffectationsComponent } from 'app/features/gestion-organisationnelle/pages/gestion-organisationnelle/historique-affectations/historique-affectations.component';
import { AddPosteComponent } from 'app/features/gestion-organisationnelle/pages/gestion-organisationnelle/postes/add-poste/add-poste.component';
import { OrganigrammeComponent } from 'app/features/gestion-organisationnelle/pages/gestion-organisationnelle/organigramme/organigramme.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const GESTION_ORGANISATIONNELLE_ROUTES: Routes = [
  { path: 'Fonctions', component: FonctionsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Postes/ajouter', component: AddPosteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Postes', component: PostesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'ResponsableUs', component: ResponsableUsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'UniteStructurelle', component: UniteStructurelleComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Organigramme', component: OrganigrammeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'AffectationAgentPoste', component: AffectationAgentPosteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'HistoriqueAffectations', component: HistoriqueAffectationsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
];
