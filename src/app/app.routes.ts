import { Routes } from '@angular/router';
import { DashboardComponent } from './packageAdmin/dashboard/dashboard.component';
import { AccueilComponent } from './packageAgent/accueil/accueil.component';
import { MydataComponent } from './packageAgent/mydata/mydata.component';
import { DataadministrativeComponent } from './packageAgent/dataadministrative/dataadministrative.component';
import { CarriereComponent } from './packageAgent/carriere/carriere.component';
import { CongeComponent } from './packageAgent/conge/conge.component';
import { MesDemandesCongeComponent } from './packageAgent/mes-demandes-conge/mes-demandes-conge.component';
import { EchelonComponent } from './packageAdmin/echelon/echelon.component';
import { EchelleComponent } from './packageAdmin/echelle/echelle.component';
import { HistoriqueDesActesComponent } from './packageAgent/historique-des-actes/historique-des-actes.component';
import { SituationActuelleComponent } from './packageAgent/situation-actuelle/situation-actuelle.component';
import { ConsultationDesDiplomesComponent } from './packageAgent/consultation-des-diplomes/consultation-des-diplomes.component';
import { SanctionComponent } from './groups/ActAdministratifs/sanction/sanction.component';
import { AttestationDeTravailComponent } from './packageAgent/attestation-de-travail/attestation-de-travail.component';
import { MesCompetencesComponent } from './packageAgent/mes-competences/mes-competences.component';
import { ConsultationFormationsComponent } from './packageAgent/consultation-formations/consultation-formations.component';
import { DemandesCongeAttestationComponent } from './packageResponsableUnite/demandes-conge-attestation/demandes-conge-attestation.component';
import { SituationFamilleComponent } from './packageAdmin/posteEtEmploi/situation-famille/situation-famille.component';
import { ReferentielCompetencesComponent } from './packageAdmin/referentiel-competences/referentiel-competences.component';
import { EvaluationCompetenceComponent } from './packageAdmin/evaluation-competence/evaluation-competence.component';
import { FammileEtEmploiComponent } from './packageAdmin/posteEtEmploi/famille-et-emploi/fammile-et-emploi.component';
import {
  ReferentielDesGroupesDeCompetencesComponent
} from './packageAdmin/referentiel-des-groupes-de-competences/referentiel-des-groupes-de-competences.component';
import { PosteTravailComponent } from './packageAgent/PDf-poste-travail/poste-travail.component';
import { PostesActivitesComponent } from './packageAdmin/posteEtEmploi/postes-activites/postes-activites.component';
import { FichierDesPrimesComponent } from './packageAdmin/fichier-des-primes/fichier-des-primes.component';
import { AccidentsMaladiesComponent } from './packageAdmin/accidents-maladies/accidents-maladies.component';
import { DistinctionsHonorifiquesComponent } from './packageAdmin/distinctions-honorifiques/distinctions-honorifiques.component';
import { IndemnitesComponent } from './packageAdmin/indemnites/indemnites.component';
import { MaterniteComponent } from './packageAdmin/maternite/maternite.component';
import { ActesVisaComponent } from './packageAdmin/acts-visa/acts-visa.component';
import { HistoriqueActesVisesComponent } from './packageAdmin/historique-actes-vises/historique-actes-vises.component';
import { DiplomesComponent } from './packageAdmin/diplomes/diplomes/diplomes.component';
import { TypeEtablissementComponent } from './packageAdmin/diplomes/type-etablissement/type-etablissement.component';
import { FormationInitialeComponent } from './packageAdmin/diplomes/formation-initiale/formation-initiale.component';
import { EtablissementComponent } from './packageAdmin/diplomes/etablissement/etablissement.component';
import { NiveauDiplomeComponent } from './packageAdmin/diplomes/niveau-diplome/niveau-diplome.component';
import { SpecialiteComponent } from './packageAdmin/diplomes/specialite/specialite.component';
import { PretFinancierComponent } from './packageAdmin/pret-financier/pret-financier.component';
import { DatesDancienneteComponent } from './packageAdmin/dates-danciennete/dates-danciennete.component';
import { CaissesRetraiteComponent } from './packageAdmin/caisses-retraite/caisses-retraite.component';
import { CommunicationComponent } from './packageAdmin/communication/communication.component';
import { ServicesAnterieursComponent } from './packageAdmin/services-anterieurs/services-anterieurs.component';
import { InitialisationMatriculesComponent } from './packageAdmin/gestion-personnelle/initialisation-matricules/initialisation-matricules.component';

import { ResponsableUsComponent } from './packageAdmin/gestionOrganisationelle/responsable-us/responsable-us.component';
import { AvencementComponent } from './packageAdmin/avencement/avencement.component';
import { NoteAnnuellesComponent } from './packageResponsableUnite/note-annuelles/note-annuelles.component';
import { FonctionsComponent } from './packageAdmin/posteEtEmploi/fonctions/fonctions.component';
import { PostesComponent } from './packageAdmin/gestionOrganisationelle/postes/postes.component';

import { UniteStructurelleComponent } from './packageAdmin/gestionOrganisationelle/unite-structurelle/unite-structurelle.component';
import { AffectationAgentPosteComponent } from './packageAdmin/gestionOrganisationelle/affectation-agent-poste/affectation-agent-poste.component';
import { HistoriqueAffectationsComponent } from './packageAdmin/gestionOrganisationelle/historique-affectations/historique-affectations.component';
import { AddPosteComponent } from './packageAdmin/gestionOrganisationelle/postes/add-poste/add-poste.component';
import { OrganigrammeComponent } from './packageAdmin/gestionOrganisationelle/organigramme/organigramme.component';

import { AgentComponent } from './packageAgent/agent/agent.component';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './packageAdmin/register/register.component';
import { DetachementComponent } from './groups/ActAdministratifs/detachement/detachement.component';
import { RadiationComponent } from './groups/ActAdministratifs/radiation/radiation.component';
import { SuspensionComponent } from './groups/ActAdministratifs/suspension/suspension.component';
import { ReintegrationComponent } from './groups/ActAdministratifs/reintegration/reintegration.component';
import { StageFormationComponent } from './groups/ActAdministratifs/stage-formation/stage-formation.component';
import { PriseEnChargeComponent } from './groups/ActAdministratifs/prise-en-charge/prise-en-charge.component';
import { MiseEnDisponibiliteComponent } from './groups/ActAdministratifs/mise-en-disponibilite/mise-en-disponibilite.component';
import { GestionUtilisateursComponent } from './packageAdmin/gestion-personnelle/gestion-utilisateurs/gestion-utilisateurs.component';
import { DossierAgentWizardComponent } from './packageAdmin/gestion-personnelle/dossiers-agents/dossier-agent-wizard/dossier-agent-wizard.component';
import { AgentDetailComponent } from './packageAdmin/gestion-personnelle/dossiers-agents/agent-detail/agent-detail.component';
import { GestionComptesComponent } from './packageAdmin/gestion-personnelle/gestion-comptes/gestion-comptes.component';
import { GestionCongesAgentsComponent } from './packageAdmin/gestion-conges-agents/gestion-conges-agents.component';
import { JoursFeriesComponent } from './packageAdmin/jours-feries/jours-feries.component';
import { TypesCongeComponent } from './packageAdmin/types-conge/types-conge.component';
import { ApprobationModificationsComponent } from './packageAdmin/gestion-personnelle/approbation-modifications/approbation-modifications.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // --- Public routes ---
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // --- Admin routes ---
  { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'echelon', component: EchelonComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'echelle', component: EchelleComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'PostesActivites', component: PostesActivitesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'FichierPrimes', component: FichierDesPrimesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'AccidentsMaladies', component: AccidentsMaladiesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'DistinctionsHonorifiques', component: DistinctionsHonorifiquesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'ActesVisa', component: ActesVisaComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'HistoriqueActesVises', component: HistoriqueActesVisesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Diplomes', component: DiplomesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'TypeEtablissement', component: TypeEtablissementComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'FormationInitiale', component: FormationInitialeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Etablissement', component: EtablissementComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'NiveauDiplome', component: NiveauDiplomeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Specialite', component: SpecialiteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'InitialisationMatricules', component: InitialisationMatriculesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Fonctions', component: FonctionsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Postes/ajouter', component: AddPosteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Postes', component: PostesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
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
  { path: 'ResponsableUs', component: ResponsableUsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Avencement', component: AvencementComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'UniteStructurelle', component: UniteStructurelleComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'Organigramme', component: OrganigrammeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'AffectationAgentPoste', component: AffectationAgentPosteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'HistoriqueAffectations', component: HistoriqueAffectationsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'GestionUtilisateurs', component: GestionUtilisateursComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'dossiers-agents/new', component: DossierAgentWizardComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'dossiers-agents/:id', component: AgentDetailComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'GestionComptes', component: GestionComptesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'GestionCongesAgents', component: GestionCongesAgentsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'JoursFeries', component: JoursFeriesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'TypesConge', component: TypesCongeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'ApprobationModifications', component: ApprobationModificationsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },

  // --- Agent routes ---
  { path: 'accueil', component: AccueilComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'Agent', component: AgentComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'myData', component: MydataComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'dataAdministrative', component: DataadministrativeComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'carriere', component: CarriereComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'competences', component: MesCompetencesComponent, canActivate: [roleGuard], data: { roles: ['AGENT', 'ADMIN'] } },
  { path: 'formations', component: ConsultationFormationsComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'HistoriqueDesActes', component: HistoriqueDesActesComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'SituationActuelle', component: SituationActuelleComponent, canActivate: [roleGuard], data: { roles: ['AGENT', 'ADMIN'] } },
  { path: 'ConsultationDesDiplomes', component: ConsultationDesDiplomesComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'AttestationDeTravail', component: AttestationDeTravailComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'MesCompetences', component: MesCompetencesComponent, canActivate: [roleGuard], data: { roles: ['AGENT', 'ADMIN'] } },
  { path: 'ConsultationFormations', component: ConsultationFormationsComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'posteTravail', component: PosteTravailComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },

  // --- Shared routes (Agent + Admin + Responsable) ---
  { path: 'conge', component: CongeComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'mes-demandes-conge', component: MesDemandesCongeComponent, canActivate: [roleGuard], data: { roles: ['AGENT'] } },
  { path: 'Sanction', component: SanctionComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'Reintegration', component: ReintegrationComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'StageFormation', component: StageFormationComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'Detachement', component: DetachementComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'Radiation', component: RadiationComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'Suspension', component: SuspensionComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'PriseEnCharge', component: PriseEnChargeComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },
  { path: 'MiseEnDisponibilite', component: MiseEnDisponibiliteComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'AGENT'] } },

  // --- Responsable Unité routes ---
  { path: 'DemandesCongeAttestation', component: DemandesCongeAttestationComponent, canActivate: [roleGuard], data: { roles: ['RESPONSABLE_UNITE', 'ADMIN'] } },
  { path: 'NoteAnnuelles', component: NoteAnnuellesComponent, canActivate: [roleGuard], data: { roles: ['RESPONSABLE_UNITE', 'ADMIN'] } },

  // --- Fallback ---
  { path: '**', redirectTo: 'login' }
];
