/**
 * Navigation catalog types.
 *
 * The catalog (see {@link ./app-navigation.catalog.ts}) is the single declarative
 * source of truth that grounds the in-app assistant. Each entry mirrors a real,
 * reachable screen (route + the roles allowed by its route guard) and enriches it
 * with the human knowledge the assistant needs: what the screen is for and the key
 * actions it offers. Adding a module to the app = adding one {@link NavScreen} here.
 */

/** Application roles, matching the backend {@code Role} enum and route guards. */
export type AppRole = 'ADMIN' | 'AGENT' | 'RESPONSABLE_UNITE';

/** A localized piece of text (fr is the primary app language). */
export interface Localized {
  fr: string;
  en: string;
}

/** A single navigable destination known to the assistant. */
export interface NavScreen {
  /** Stable identifier (kebab-case). */
  id: string;
  /** The Angular route, exactly as declared in *.routes.ts (e.g. '/conge'). */
  route: string;
  /** Human-readable screen name. */
  label: Localized;
  /** Business module / sidebar section it belongs to. */
  module: Localized;
  /** One-line explanation of what the screen is for. */
  description: Localized;
  /** Key actions the user can perform there. */
  actions: Localized[];
  /** Roles allowed to reach the screen (must match the route's `data.roles`). */
  roles: AppRole[];
  /** Extra search synonyms (any language) to improve matching/suggestions. */
  keywords?: string[];
}

/** A screen flattened to the current locale — what gets sent to the backend. */
export interface NavScreenContext {
  route: string;
  label: string;
  module: string;
  description: string;
  actions: string[];
  roles: AppRole[];
}

/** The full navigation context captured at chat send time. */
export interface AssistantContext {
  activeRole: string | null;
  roles: string[];
  currentRoute: string;
  currentScreen: string | null;
  locale: string;
  accessibleScreens: NavScreenContext[];
  /** True when the user is inside the pre-validation onboarding flow (copilot mode). */
  onboardingMode?: boolean;
}
