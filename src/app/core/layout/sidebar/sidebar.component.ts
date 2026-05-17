import { Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLinkActive,
    RouterLink,
    NgIf,
    TranslateModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() opened = false;

  logoInovat = "assets/inovat-logo.png";
  logoProject = "assets/MastechRh-Logo.png";

  /** The single active mode — drives which menu block is shown */
  activeMode: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.activeRole$.subscribe(role => {
      this.activeMode = role;
    });
  }

  // =================================
  gestionOrganisationelle = false;
  gestionPersonnelle = false;
  posteEtEmploi = false;
  evaluationEtCompetences = false;
  acteAdministratifs = false;
  congesAbsences = false;
  diplomeMenu = false;
  gestionConges = false;

  toggleGestionOrganisationelle() { this.gestionOrganisationelle = !this.gestionOrganisationelle; }
  toggleGestionPersonnelle()      { this.gestionPersonnelle      = !this.gestionPersonnelle; }
  togglePosteEtEmploi()           { this.posteEtEmploi           = !this.posteEtEmploi; }
  toggleEvaluationEtCompetences() { this.evaluationEtCompetences = !this.evaluationEtCompetences; }
  toggleActeAdministratifs()      { this.acteAdministratifs      = !this.acteAdministratifs; }
  toggleDiplomeMenu()             { this.diplomeMenu             = !this.diplomeMenu; }
  toggleCongesAbsences()          { this.congesAbsences          = !this.congesAbsences; }
  toggleGestionConges()           { this.gestionConges           = !this.gestionConges; }
}
