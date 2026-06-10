import { Routes } from '@angular/router';
import { HistoriqueDesActesComponent } from 'app/features/actes-administratifs/pages/historique-des-actes/historique-des-actes.component';
import { SanctionComponent } from 'app/features/actes-administratifs/pages/actes-administratifs/sanction/sanction.component';
import { ActesVisaComponent } from 'app/features/actes-administratifs/pages/acts-visa/acts-visa.component';
import { HistoriqueActesVisesComponent } from 'app/features/actes-administratifs/pages/historique-actes-vises/historique-actes-vises.component';
import { DetachementComponent } from 'app/features/actes-administratifs/pages/actes-administratifs/detachement/detachement.component';
import { RadiationComponent } from 'app/features/actes-administratifs/pages/actes-administratifs/radiation/radiation.component';
import { SuspensionComponent } from 'app/features/actes-administratifs/pages/actes-administratifs/suspension/suspension.component';
import { ReintegrationComponent } from 'app/features/actes-administratifs/pages/actes-administratifs/reintegration/reintegration.component';
import { StageFormationComponent } from 'app/features/actes-administratifs/pages/actes-administratifs/stage-formation/stage-formation.component';
import { PriseEnChargeComponent } from 'app/features/actes-administratifs/pages/actes-administratifs/prise-en-charge/prise-en-charge.component';
import { MiseEnDisponibiliteComponent } from 'app/features/actes-administratifs/pages/actes-administratifs/mise-en-disponibilite/mise-en-disponibilite.component';
import { SanctionListComponent } from 'app/features/actes-administratifs/pages/sanctions/sanction-list/sanction-list.component';
import { SanctionDetailComponent } from 'app/features/actes-administratifs/pages/sanctions/sanction-detail/sanction-detail.component';
import { SanctionFormComponent } from 'app/features/actes-administratifs/pages/sanctions/sanction-form/sanction-form.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const ACTES_ADMINISTRATIFS_ROUTES: Routes = [
  // Refonte « Sanctions » (gabarit acte administratif). L'ordre compte : /new avant /:id.
  { path: 'admin/actes/sanctions', component: SanctionListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/actes/sanctions/new', component: SanctionFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/actes/sanctions/:id/edit', component: SanctionFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/actes/sanctions/:id', component: SanctionDetailComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },

  { path: 'ActesVisa', component: ActesVisaComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'HistoriqueActesVises', component: HistoriqueActesVisesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'HistoriqueDesActes', component: HistoriqueDesActesComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'Sanction', component: SanctionComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'Reintegration', component: ReintegrationComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'StageFormation', component: StageFormationComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'Detachement', component: DetachementComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'Radiation', component: RadiationComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'Suspension', component: SuspensionComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'PriseEnCharge', component: PriseEnChargeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'MiseEnDisponibilite', component: MiseEnDisponibiliteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
];
