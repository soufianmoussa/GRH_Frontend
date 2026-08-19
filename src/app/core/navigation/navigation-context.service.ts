import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { LanguageService, AppLanguage } from '../services/language.service';
import { APP_NAVIGATION_CATALOG } from './app-navigation.catalog';
import {
  AppRole,
  AssistantContext,
  Localized,
  NavScreen,
  NavScreenContext,
} from './navigation.models';

/**
 * Assembles the live navigation context that grounds the assistant.
 *
 * It reads the user's active role from {@link AuthService}, the current route from
 * the {@link Router}, the UI language from {@link LanguageService}, and projects the
 * declarative {@link APP_NAVIGATION_CATALOG} down to the screens the active role can
 * actually reach — localized to the current language. The backend re-checks roles
 * against the JWT, so this is for relevance, not as the security boundary.
 */
@Injectable({ providedIn: 'root' })
export class NavigationContextService {

  constructor(
    private auth: AuthService,
    private router: Router,
    private language: LanguageService,
  ) {}

  /** Build the full context packet sent with a chat message. */
  buildContext(): AssistantContext {
    const lang = this.language.current();
    const activeRole = this.resolveActiveRole();
    const roles = this.auth.getRoles();
    const currentRoute = this.normalizeUrl(this.router.url);
    const current = this.matchScreen(currentRoute);
    const onboardingMode = this.isOnboardingRoute(currentRoute);

    // In onboarding mode the agent is not yet validated and must not be pointed at locked
    // SIRH screens: restrict the catalog to onboarding screens so no chip leads elsewhere.
    const screens = this.accessibleScreens(activeRole, lang)
      .filter(s => !onboardingMode || this.isOnboardingRoute(s.route));

    return {
      activeRole,
      roles,
      currentRoute,
      currentScreen: current ? this.tr(current.label, lang) : null,
      locale: lang,
      accessibleScreens: screens,
      onboardingMode,
    };
  }

  /** The screen the user is currently on, if it maps to a catalog entry. */
  currentScreen(): NavScreen | null {
    return this.matchScreen(this.normalizeUrl(this.router.url));
  }

  /**
   * Context-aware starter suggestions: actions of the current screen first, then
   * a few high-value destinations for the active role.
   */
  suggestions(limit = 3): string[] {
    const lang = this.language.current();
    const role = this.resolveActiveRole();
    const out: string[] = [];

    // Onboarding copilot starters: the questions an agent mid-integration actually asks.
    if (this.isOnboardingRoute(this.normalizeUrl(this.router.url))) {
      const starters = lang === 'en'
        ? ['What do I still need to complete?', 'Why can’t I submit yet?', 'What happens after I submit?']
        : ['Que dois-je encore compléter ?', 'Pourquoi je ne peux pas encore soumettre ?', 'Que se passe-t-il après l’envoi ?'];
      return starters.slice(0, limit);
    }

    const current = this.currentScreen();
    if (current) {
      for (const a of current.actions) {
        out.push(this.askHowTo(this.tr(a, lang), lang));
      }
    }

    // Fill with generic role destinations not already covered.
    for (const screen of this.accessibleScreensRaw(role)) {
      if (out.length >= limit) break;
      const label = this.tr(screen.label, lang);
      const phrase = lang === 'en' ? `How do I use "${label}"?` : `Comment utiliser « ${label} » ?`;
      if (!out.includes(phrase)) out.push(phrase);
    }

    return out.slice(0, limit);
  }

  // ── internals ────────────────────────────────────────────────────────────

  /** Catalog filtered to the active role, localized and compacted for transport. */
  private accessibleScreens(activeRole: string | null, lang: AppLanguage): NavScreenContext[] {
    return this.accessibleScreensRaw(activeRole).map(s => ({
      route: s.route,
      label: this.tr(s.label, lang),
      module: this.tr(s.module, lang),
      description: this.tr(s.description, lang),
      actions: s.actions.map(a => this.tr(a, lang)),
      roles: s.roles,
    }));
  }

  private accessibleScreensRaw(activeRole: string | null): NavScreen[] {
    const role = (activeRole ?? '').toUpperCase() as AppRole;
    if (!role) return [];
    return APP_NAVIGATION_CATALOG.filter(s => s.roles.includes(role));
  }

  /** Longest-prefix match of a URL against catalog routes. */
  private matchScreen(url: string): NavScreen | null {
    let best: NavScreen | null = null;
    for (const s of APP_NAVIGATION_CATALOG) {
      if (url === s.route || url.startsWith(s.route + '/')) {
        if (!best || s.route.length > best.route.length) best = s;
      }
    }
    return best;
  }

  private resolveActiveRole(): string | null {
    const active = this.auth.getActiveRole();
    if (active) return active;
    const roles = this.auth.getRoles();
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('RESPONSABLE_UNITE')) return 'RESPONSABLE_UNITE';
    if (roles.includes('AGENT')) return 'AGENT';
    return roles[0] ?? null;
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }

  /**
   * Whether a route belongs to the pre-validation onboarding flow. Kept in sync with
   * {@code AppComponent.isOnboardingPage()} (which controls widget visibility).
   */
  private isOnboardingRoute(route: string): boolean {
    return route === '/mon-onboarding'
      || route.startsWith('/mon-onboarding/')
      || route === '/onboarding/waiting';
  }

  private tr(value: Localized, lang: AppLanguage): string {
    return lang === 'en' ? value.en : value.fr;
  }

  private askHowTo(action: string, lang: AppLanguage): string {
    return lang === 'en' ? `How do I: ${action}?` : `Comment faire : ${action} ?`;
  }
}
