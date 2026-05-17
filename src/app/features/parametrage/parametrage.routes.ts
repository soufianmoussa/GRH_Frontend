import { Routes } from '@angular/router';
import { EchelonComponent } from 'app/features/parametrage/pages/echelon/echelon.component';
import { EchelleComponent } from 'app/features/parametrage/pages/echelle/echelle.component';
import { SituationFamilleComponent } from 'app/features/parametrage/pages/situation-famille/situation-famille.component';
import { ReferentielCompetencesComponent } from 'app/features/parametrage/pages/referentiel-competences/referentiel-competences.component';
import { EvaluationCompetenceComponent } from 'app/features/parametrage/pages/evaluation-competence/evaluation-competence.component';
import { FammileEtEmploiComponent } from 'app/features/parametrage/pages/famille-et-emploi/fammile-et-emploi.component';
import {
  ReferentielDesGroupesDeCompetencesComponent
} from 'app/features/parametrage/pages/referentiel-des-groupes-de-competences/referentiel-des-groupes-de-competences.component';
import { PostesActivitesComponent } from 'app/features/parametrage/pages/postes-activites/postes-activites.component';
import { FichierDesPrimesComponent } from 'app/features/parametrage/pages/fichier-des-primes/fichier-des-primes.component';
import { AccidentsMaladiesComponent } from 'app/features/parametrage/pages/accidents-maladies/accidents-maladies.component';
import { DistinctionsHonorifiquesComponent } from 'app/features/parametrage/pages/distinctions-honorifiques/distinctions-honorifiques.component';
import { IndemnitesComponent } from 'app/features/parametrage/pages/indemnites/indemnites.component';
import { MaterniteComponent } from 'app/features/parametrage/pages/maternite/maternite.component';
import { PretFinancierComponent } from 'app/features/parametrage/pages/pret-financier/pret-financier.component';
import { DatesDancienneteComponent } from 'app/features/parametrage/pages/dates-danciennete/dates-danciennete.component';
import { CaissesRetraiteComponent } from 'app/features/parametrage/pages/caisses-retraite/caisses-retraite.component';
import { CommunicationComponent } from 'app/features/parametrage/pages/communication/communication.component';
import { ServicesAnterieursComponent } from 'app/features/parametrage/pages/services-anterieurs/services-anterieurs.component';
import { AvencementComponent } from 'app/features/parametrage/pages/avencement/avencement.component';
import { NoteAnnuellesComponent } from 'app/features/parametrage/pages/note-annuelles/note-annuelles.component';
import { roleGuard } from 'app/core/guards/role.guard';

export const PARAMETRAGE_ROUTES: Routes = [
  { path: 'echelon', component: EchelonComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'echelle', component: EchelleComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'PostesActivites', component: PostesActivitesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'FichierPrimes', component: FichierDesPrimesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'AccidentsMaladies', component: AccidentsMaladiesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'DistinctionsHonorifiques', component: DistinctionsHonorifiquesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'situationFamille', component: SituationFamilleComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'referentielCompetences', component: ReferentielCompetencesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'evaluationEtCompetence', component: EvaluationCompetenceComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'familleEtEmploi', component: FammileEtEmploiComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'referentielDesGroupesDeCompetences', component: ReferentielDesGroupesDeCompetencesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'indemnitesComponent', component: IndemnitesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'maternite', component: MaterniteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'PretFinancier', component: PretFinancierComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'DatesDanciennete', component: DatesDancienneteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'CaissesRetraite', component: CaissesRetraiteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Communication', component: CommunicationComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'ServicesAnterieurs', component: ServicesAnterieursComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Avencement', component: AvencementComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'NoteAnnuelles', component: NoteAnnuellesComponent, canActivate: [roleGuard], data: { roles: ['RESPONSABLE_UNITE', 'ADMIN'] } },
];
