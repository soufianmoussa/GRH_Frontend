import { Routes } from '@angular/router';
import { ConsultationDesDiplomesComponent } from 'app/features/documents/pages/consultation-des-diplomes/consultation-des-diplomes.component';
import { AttestationDeTravailComponent } from 'app/features/documents/pages/attestation-de-travail/attestation-de-travail.component';
import { ConsultationFormationsComponent } from 'app/features/documents/pages/consultation-formations/consultation-formations.component';
import { PosteTravailComponent } from 'app/features/documents/pages/poste-travail/poste-travail.component';
import { DiplomesComponent } from 'app/features/documents/pages/diplomes/diplomes/diplomes.component';
import { TypeEtablissementComponent } from 'app/features/documents/pages/diplomes/type-etablissement/type-etablissement.component';
import { FormationInitialeComponent } from 'app/features/documents/pages/diplomes/formation-initiale/formation-initiale.component';
import { EtablissementComponent } from 'app/features/documents/pages/diplomes/etablissement/etablissement.component';
import { NiveauDiplomeComponent } from 'app/features/documents/pages/diplomes/niveau-diplome/niveau-diplome.component';
import { SpecialiteComponent } from 'app/features/documents/pages/diplomes/specialite/specialite.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const DOCUMENTS_ROUTES: Routes = [
  { path: 'Diplomes', component: DiplomesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'TypeEtablissement', component: TypeEtablissementComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'FormationInitiale', component: FormationInitialeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Etablissement', component: EtablissementComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'NiveauDiplome', component: NiveauDiplomeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Specialite', component: SpecialiteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'formations', component: ConsultationFormationsComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'ConsultationDesDiplomes', component: ConsultationDesDiplomesComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'AttestationDeTravail', component: AttestationDeTravailComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'ConsultationFormations', component: ConsultationFormationsComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'posteTravail', component: PosteTravailComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
];
