import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { UserInfo } from '../../auth/auth.models';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';

/**
 * Sidebar component — single source of truth for the navigation tree.
 *
 * Sections are collapsible; their open/closed state is held in a Set so we
 * never end up with N booleans drifting out of sync. When the user navigates
 * into a sub-route, the parent section auto-expands so they can see where
 * they are.
 */
@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    FormsModule,
    RouterLinkActive,
    RouterLink,
    TranslateModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() opened = false;

  logoProject = 'assets/MastechRh-Logo.png';

  /** The single active mode — drives which menu block is shown. */
  activeMode: string | null = null;

  currentUser: UserInfo | null = null;

  /** Free-text search to filter visible items in long admin menus. */
  searchTerm = '';

  /** Sections currently expanded — key is a stable identifier per section. */
  private openSections = new Set<string>();

  /**
   * Maps each child route to its parent section key so we can auto-expand
   * the right section when the user navigates from elsewhere (e.g. clicking
   * a topbar link or refreshing on a deep route).
   */
  private readonly routeToSection: Record<string, string> = {
    // ADMIN
    '/admin/onboarding': 'admin-agents',
    '/admin/onboarding/initialiser': 'admin-agents',
    '/InitialisationMatricules': 'admin-agents',
    '/GestionUtilisateurs': 'admin-agents',
    '/GestionComptes': 'admin-agents',
    '/ApprobationModifications': 'admin-agents',

    '/Organigramme': 'admin-org',
    '/HistoriqueAffectations': 'admin-org',
    // Référentiels métier — désormais rattachés à la section Organisation
    '/Fonctions': 'admin-org',
    '/PostesActivites': 'admin-org',
    '/situationFamille': 'admin-org',
    '/familleEtEmploi': 'admin-org',

    '/Sanction': 'admin-actes',
    '/admin/actes/sanctions': 'admin-actes',
    '/Reintegration': 'admin-actes',
    '/StageFormation': 'admin-actes',
    '/Detachement': 'admin-actes',
    '/Radiation': 'admin-actes',
    '/Suspension': 'admin-actes',
    '/PriseEnCharge': 'admin-actes',
    '/MiseEnDisponibilite': 'admin-actes',

    '/Avencement': 'admin-carriere',
    '/DatesDanciennete': 'admin-carriere',
    '/ServicesAnterieurs': 'admin-carriere',
    '/echelon': 'admin-carriere',
    '/echelle': 'admin-carriere',

    '/evaluationEtCompetence': 'admin-competences',
    '/referentielDesGroupesDeCompetences': 'admin-competences',
    '/Diplomes': 'admin-competences',

    '/FichierPrimes': 'admin-remu',
    '/indemnitesComponent': 'admin-remu',
    '/CaissesRetraite': 'admin-remu',
    '/PretFinancier': 'admin-remu',
    '/DistinctionsHonorifiques': 'admin-remu',

    '/AccidentsMaladies': 'admin-sante',
    '/maternite': 'admin-sante',

    '/GestionCongesAgents': 'admin-conges',
    '/TypesConge': 'admin-conges',
    '/JoursFeries': 'admin-conges',

    '/ActesVisa': 'admin-visa',
    '/HistoriqueActesVises': 'admin-visa',

    // AGENT
    '/myData': 'agent-profil',
    '/dataAdministrative': 'agent-profil',
    '/SituationActuelle': 'agent-profil',
    '/mon-onboarding': 'agent-profil',

    '/carriere': 'agent-carriere',
    '/competences': 'agent-carriere',
    '/formations': 'agent-carriere',
    '/ConsultationDesDiplomes': 'agent-carriere',

    '/conge': 'agent-demandes',
    '/mes-demandes-conge': 'agent-demandes',
    '/AttestationDeTravail': 'agent-demandes',

    '/posteTravail': 'agent-docs',
    '/HistoriqueDesActes': 'agent-docs',
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.activeRole$.subscribe(role => this.activeMode = role);
    this.authService.currentUser$.subscribe(user => this.currentUser = user);

    // Auto-expand the section containing the route we land on / navigate to.
    this.expandSectionForUrl(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.expandSectionForUrl(e.urlAfterRedirects));
  }

  private expandSectionForUrl(url: string): void {
    // Match the longest prefix (so /admin/onboarding/initialiser beats /admin/onboarding)
    const match = Object.keys(this.routeToSection)
      .filter(prefix => url === prefix || url.startsWith(prefix + '/') || url.startsWith(prefix + '?'))
      .sort((a, b) => b.length - a.length)[0];
    if (match) {
      this.openSections.add(this.routeToSection[match]);
    }
  }

  toggle(key: string): void {
    if (this.openSections.has(key)) {
      this.openSections.delete(key);
    } else {
      this.openSections.add(key);
    }
  }

  isOpen(key: string): boolean {
    return this.openSections.has(key);
  }

  /**
   * Masque « Mon onboarding » quand l'intégration est terminée. Le lecteur est
   * `currentUser`, auquel on est abonné : le menu se met donc à jour tout seul dès que
   * le statut change (connexion, rafraîchissement de jeton, ou lecture du dossier réel
   * par le tableau de bord onboarding).
   */
  isOnboardingCompleted(): boolean {
    return this.authService.isOnboardingCompleted();
  }

  /** Display name for the user info card. */
  get userDisplayName(): string {
    return this.currentUser?.username || 'Utilisateur';
  }

  get userInitials(): string {
    const name = this.currentUser?.username?.trim() || '';
    if (!name) return '?';
    const parts = name.split(/[\s._@-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  /**
   * Returns true when the search term matches the given label (case-insensitive
   * and accent-insensitive). Used by the admin menu to filter items live.
   */
  matchesSearch(label: string): boolean {
    if (!this.searchTerm?.trim()) return true;
    return this.normalize(label).includes(this.normalize(this.searchTerm));
  }

  /**
   * Returns true when at least one of the labels passes the search filter.
   * Used to keep a section visible if any of its children match.
   */
  sectionMatches(...labels: string[]): boolean {
    if (!this.searchTerm?.trim()) return true;
    return labels.some(l => this.matchesSearch(l));
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  clearSearch(): void {
    this.searchTerm = '';
  }
}
