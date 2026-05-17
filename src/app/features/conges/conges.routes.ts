import { Routes } from '@angular/router';
import { CongeComponent } from 'app/features/conges/pages/conge/conge.component';
import { MesDemandesCongeComponent } from 'app/features/conges/pages/mes-demandes-conge/mes-demandes-conge.component';
import { DemandesCongeAttestationComponent } from 'app/features/conges/pages/demandes-conge-attestation/demandes-conge-attestation.component';
import { GestionCongesAgentsComponent } from 'app/features/conges/pages/gestion-conges-agents/gestion-conges-agents.component';
import { JoursFeriesComponent } from 'app/features/conges/pages/jours-feries/jours-feries.component';
import { TypesCongeComponent } from 'app/features/conges/pages/types-conge/types-conge.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const CONGES_ROUTES: Routes = [
  { path: 'GestionCongesAgents', component: GestionCongesAgentsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'JoursFeries', component: JoursFeriesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'TypesConge', component: TypesCongeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'conge', component: CongeComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'mes-demandes-conge', component: MesDemandesCongeComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'DemandesCongeAttestation', component: DemandesCongeAttestationComponent, canActivate: [roleGuard], data: { roles: ['RESPONSABLE_UNITE', 'ADMIN'] } },
];
