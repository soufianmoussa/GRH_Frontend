import { Component, OnInit } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {TopbarComponent} from './core/layout/topbar/topbar.component';
import {SidebarComponent} from './core/layout/sidebar/sidebar.component';
import {NgIf} from '@angular/common';
import {AuthService} from './core/auth/auth.service';
import { LanguageService } from './core/services/language.service';
import { ChatbotComponent } from './features/assistant/chatbot.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopbarComponent, SidebarComponent, NgIf, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ghrfe';
  sidebarOpened = true;

  /**
   * Tant que la session n'est pas vérifiée au démarrage, on n'affiche NI le layout Agent NI le
   * sidemenu : on évite ainsi le "flash" du menu (Problème 6) lorsqu'un agent ouvre son lien
   * d'activation ou recharge l'application avant la résolution du routing/token.
   */
  authChecking = true;

  constructor(private router: Router, private authService: AuthService, private languageService: LanguageService) {}

  ngOnInit() {
    this.languageService.init();

    if (this.authService.isAuthenticated()) {
      this.authService.fetchMe().subscribe({
        next: () => this.authChecking = false,
        error: () => {
          // Si l'utilisateur n'est plus valide coté serveur, on purge
          this.authService.logout();
          this.authChecking = false;
        }
      });
    } else {
      // Visiteur anonyme (login / activation) : aucune vérification à attendre.
      this.authChecking = false;
    }
  }

  isPublicLayoutPage(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '/login'
      || path === '/register'
      || path === '/activation'
      || path === '/mon-onboarding'
      || path.startsWith('/mon-onboarding/');
  }

  /**
   * Le layout principal (topbar + sidemenu) n'est monté QUE pour un utilisateur réellement
   * authentifié, hors pages publiques, et une fois la vérification de session terminée.
   */
  showMainLayout(): boolean {
    return !this.authChecking
      && this.authService.isAuthenticated()
      && !this.isPublicLayoutPage();
  }

  /** Écran d'attente (auth en cours) — réservé aux sessions authentifiées hors pages publiques. */
  showAuthChecking(): boolean {
    return this.authChecking
      && this.authService.isAuthenticated()
      && !this.isPublicLayoutPage();
  }

  /** Pages publiques (login, activation, onboarding) : rendu direct, sans sidemenu. */
  showPublicOutlet(): boolean {
    return !this.showMainLayout() && !this.showAuthChecking();
  }

  /** Show the assistant only inside the authenticated app shell (not on public/auth pages). */
  showChatbot(): boolean {
    return this.showMainLayout() && this.authService.isAuthenticated();
  }
}
