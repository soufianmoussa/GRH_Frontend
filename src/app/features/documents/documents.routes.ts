import { Routes } from '@angular/router';
import { ConsultationDesDiplomesComponent } from 'app/features/documents/pages/consultation-des-diplomes/consultation-des-diplomes.component';
import { AttestationDeTravailComponent } from 'app/features/documents/pages/attestation-de-travail/attestation-de-travail.component';
import { ConsultationFormationsComponent } from 'app/features/documents/pages/consultation-formations/consultation-formations.component';
import { PosteTravailComponent } from 'app/features/documents/pages/poste-travail/poste-travail.component';
import { DiplomesComponent } from 'app/features/documents/pages/diplomes/diplomes/diplomes.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const DOCUMENTS_ROUTES: Routes = [
  { path: 'Diplomes', component: DiplomesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'formations', component: ConsultationFormationsComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'ConsultationDesDiplomes', component: ConsultationDesDiplomesComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'AttestationDeTravail', component: AttestationDeTravailComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'ConsultationFormations', component: ConsultationFormationsComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'posteTravail', component: PosteTravailComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
];
