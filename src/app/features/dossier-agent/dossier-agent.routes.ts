import { Routes } from '@angular/router';
import { MydataComponent } from 'app/features/dossier-agent/pages/mydata/mydata.component';
import { DataadministrativeComponent } from 'app/features/dossier-agent/pages/data-administrative/dataadministrative.component';
import { CarriereComponent } from 'app/features/dossier-agent/pages/carriere/carriere.component';
import { SituationActuelleComponent } from 'app/features/dossier-agent/pages/situation-actuelle/situation-actuelle.component';
import { MesCompetencesComponent } from 'app/features/dossier-agent/pages/mes-competences/mes-competences.component';
import { AgentComponent } from 'app/features/dossier-agent/pages/agent/agent.component';
import { DossierAgentWizardComponent } from 'app/features/dossier-agent/pages/dossiers-agents/dossier-agent-wizard/dossier-agent-wizard.component';
import { AgentDetailComponent } from 'app/features/dossier-agent/pages/dossiers-agents/agent-detail/agent-detail.component';
import { ApprobationModificationsComponent } from 'app/features/dossier-agent/pages/approbation-modifications/approbation-modifications.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const DOSSIER_AGENT_ROUTES: Routes = [
  { path: 'dossiers-agents/new', component: DossierAgentWizardComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'dossiers-agents/:id', component: AgentDetailComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'ApprobationModifications', component: ApprobationModificationsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Agent', component: AgentComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'myData', component: MydataComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'dataAdministrative', component: DataadministrativeComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'carriere', component: CarriereComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'competences', component: MesCompetencesComponent, canActivate: [roleGuard], data: { roles: ['AGENT', 'ADMIN'] } },
  { path: 'SituationActuelle', component: SituationActuelleComponent, canActivate: [roleGuard], data: { roles: ['AGENT', 'ADMIN'] } },
  { path: 'MesCompetences', component: MesCompetencesComponent, canActivate: [roleGuard], data: { roles: ['AGENT', 'ADMIN'] } },
];
