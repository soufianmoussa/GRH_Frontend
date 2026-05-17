import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { AccueilComponent } from './features/dashboard/pages/accueil/accueil.component';
import { MydataComponent } from './features/dossier-agent/pages/mydata/mydata.component';
import { DataadministrativeComponent } from './features/dossier-agent/pages/data-administrative/dataadministrative.component';
import { CarriereComponent } from './features/dossier-agent/pages/carriere/carriere.component';
import { CongeComponent } from './features/conges/pages/conge/conge.component';
import { MesDemandesCongeComponent } from './features/conges/pages/mes-demandes-conge/mes-demandes-conge.component';
import { EchelonComponent } from './features/parametrage/pages/echelon/echelon.component';
import { EchelleComponent } from './features/parametrage/pages/echelle/echelle.component';
import { HistoriqueDesActesComponent } from './features/actes-administratifs/pages/historique-des-actes/historique-des-actes.component';
import { SituationActuelleComponent } from './features/dossier-agent/pages/situation-actuelle/situation-actuelle.component';
import { ConsultationDesDiplomesComponent } from './features/documents/pages/consultation-des-diplomes/consultation-des-diplomes.component';
import { SanctionComponent } from './features/actes-administratifs/pages/actes-administratifs/sanction/sanction.component';
import { AttestationDeTravailComponent } from './features/documents/pages/attestation-de-travail/attestation-de-travail.component';
import { MesCompetencesComponent } from './features/dossier-agent/pages/mes-competences/mes-competences.component';
import { ConsultationFormationsComponent } from './features/documents/pages/consultation-formations/consultation-formations.component';
import { DemandesCongeAttestationComponent } from './features/conges/pages/demandes-conge-attestation/demandes-conge-attestation.component';
import { SituationFamilleComponent } from './features/parametrage/pages/situation-famille/situation-famille.component';
import { ReferentielCompetencesComponent } from './features/parametrage/pages/referentiel-competences/referentiel-competences.component';
import { EvaluationCompetenceComponent } from './features/parametrage/pages/evaluation-competence/evaluation-competence.component';
import { FammileEtEmploiComponent } from './features/parametrage/pages/famille-et-emploi/fammile-et-emploi.component';
import {
  ReferentielDesGroupesDeCompetencesComponent
} from './features/parametrage/pages/referentiel-des-groupes-de-competences/referentiel-des-groupes-de-competences.component';
import { PosteTravailComponent } from './features/documents/pages/poste-travail/poste-travail.component';
import { PostesActivitesComponent } from './features/parametrage/pages/postes-activites/postes-activites.component';
import { FichierDesPrimesComponent } from './features/parametrage/pages/fichier-des-primes/fichier-des-primes.component';
import { AccidentsMaladiesComponent } from './features/parametrage/pages/accidents-maladies/accidents-maladies.component';
import { DistinctionsHonorifiquesComponent } from './features/parametrage/pages/distinctions-honorifiques/distinctions-honorifiques.component';
import { IndemnitesComponent } from './features/parametrage/pages/indemnites/indemnites.component';
import { MaterniteComponent } from './features/parametrage/pages/maternite/maternite.component';
import { ActesVisaComponent } from './features/actes-administratifs/pages/acts-visa/acts-visa.component';
import { HistoriqueActesVisesComponent } from './features/actes-administratifs/pages/historique-actes-vises/historique-actes-vises.component';
import { DiplomesComponent } from './features/documents/pages/diplomes/diplomes/diplomes.component';
import { TypeEtablissementComponent } from './features/documents/pages/diplomes/type-etablissement/type-etablissement.component';
import { FormationInitialeComponent } from './features/documents/pages/diplomes/formation-initiale/formation-initiale.component';
import { EtablissementComponent } from './features/documents/pages/diplomes/etablissement/etablissement.component';
import { NiveauDiplomeComponent } from './features/documents/pages/diplomes/niveau-diplome/niveau-diplome.component';
import { SpecialiteComponent } from './features/documents/pages/diplomes/specialite/specialite.component';
import { PretFinancierComponent } from './features/parametrage/pages/pret-financier/pret-financier.component';
import { DatesDancienneteComponent } from './features/parametrage/pages/dates-danciennete/dates-danciennete.component';
import { CaissesRetraiteComponent } from './features/parametrage/pages/caisses-retraite/caisses-retraite.component';
import { CommunicationComponent } from './features/parametrage/pages/communication/communication.component';
import { ServicesAnterieursComponent } from './features/parametrage/pages/services-anterieurs/services-anterieurs.component';
import { InitialisationMatriculesComponent } from './features/onboarding/pages/initialisation-matricules/initialisation-matricules.component';

import { ResponsableUsComponent } from './features/gestion-organisationnelle/pages/gestion-organisationnelle/responsable-us/responsable-us.component';
import { AvencementComponent } from './features/parametrage/pages/avencement/avencement.component';
import { NoteAnnuellesComponent } from './features/parametrage/pages/note-annuelles/note-annuelles.component';
import { FonctionsComponent } from './features/gestion-organisationnelle/pages/fonctions/fonctions.component';
import { PostesComponent } from './features/gestion-organisationnelle/pages/gestion-organisationnelle/postes/postes.component';

import { UniteStructurelleComponent } from './features/gestion-organisationnelle/pages/gestion-organisationnelle/unite-structurelle/unite-structurelle.component';
import { AffectationAgentPosteComponent } from './features/gestion-organisationnelle/pages/gestion-organisationnelle/affectation-agent-poste/affectation-agent-poste.component';
import { HistoriqueAffectationsComponent } from './features/gestion-organisationnelle/pages/gestion-organisationnelle/historique-affectations/historique-affectations.component';
import { AddPosteComponent } from './features/gestion-organisationnelle/pages/gestion-organisationnelle/postes/add-poste/add-poste.component';
import { OrganigrammeComponent } from './features/gestion-organisationnelle/pages/gestion-organisationnelle/organigramme/organigramme.component';

import { AgentComponent } from './features/dossier-agent/pages/agent/agent.component';

import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { DetachementComponent } from './features/actes-administratifs/pages/actes-administratifs/detachement/detachement.component';
import { RadiationComponent } from './features/actes-administratifs/pages/actes-administratifs/radiation/radiation.component';
import { SuspensionComponent } from './features/actes-administratifs/pages/actes-administratifs/suspension/suspension.component';
import { ReintegrationComponent } from './features/actes-administratifs/pages/actes-administratifs/reintegration/reintegration.component';
import { StageFormationComponent } from './features/actes-administratifs/pages/actes-administratifs/stage-formation/stage-formation.component';
import { PriseEnChargeComponent } from './features/actes-administratifs/pages/actes-administratifs/prise-en-charge/prise-en-charge.component';
import { MiseEnDisponibiliteComponent } from './features/actes-administratifs/pages/actes-administratifs/mise-en-disponibilite/mise-en-disponibilite.component';
import { GestionUtilisateursComponent } from './features/gestion-comptes/pages/gestion-utilisateurs/gestion-utilisateurs.component';
import { DossierAgentWizardComponent } from './features/dossier-agent/pages/dossiers-agents/dossier-agent-wizard/dossier-agent-wizard.component';
import { AgentDetailComponent } from './features/dossier-agent/pages/dossiers-agents/agent-detail/agent-detail.component';
import { GestionComptesComponent } from './features/gestion-comptes/pages/gestion-comptes/gestion-comptes.component';
import { GestionCongesAgentsComponent } from './features/conges/pages/gestion-conges-agents/gestion-conges-agents.component';
import { JoursFeriesComponent } from './features/conges/pages/jours-feries/jours-feries.component';
import { TypesCongeComponent } from './features/conges/pages/types-conge/types-conge.component';
import { ApprobationModificationsComponent } from './features/dossier-agent/pages/approbation-modifications/approbation-modifications.component';

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
