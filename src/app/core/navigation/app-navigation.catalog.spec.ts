import { Routes } from '@angular/router';
import { APP_NAVIGATION_CATALOG } from './app-navigation.catalog';

import { ACTES_ADMINISTRATIFS_ROUTES } from '../../features/actes-administratifs/actes-administratifs.routes';
import { CONGES_ROUTES } from '../../features/conges/conges.routes';
import { DASHBOARD_ROUTES } from '../../features/dashboard/dashboard.routes';
import { DOCUMENTS_ROUTES } from '../../features/documents/documents.routes';
import { DOSSIER_AGENT_ROUTES } from '../../features/dossier-agent/dossier-agent.routes';
import { GESTION_COMPTES_ROUTES } from '../../features/gestion-comptes/gestion-comptes.routes';
import { GESTION_ORGANISATIONNELLE_ROUTES } from '../../features/gestion-organisationnelle/gestion-organisationnelle.routes';
import { ONBOARDING_ROUTES } from '../../features/onboarding/onboarding.routes';
import { PARAMETRAGE_ROUTES } from '../../features/parametrage/parametrage.routes';

/**
 * Drift guard: the navigation catalog must stay faithful to the real routes.
 * If someone adds/renames a route or changes its role guard without updating the
 * catalog (or vice-versa), these expectations fail — keeping the assistant honest.
 */
describe('APP_NAVIGATION_CATALOG', () => {

  // Build path -> declared roles from every feature route table.
  const routeRoles = new Map<string, string[]>();
  const allRoutes: Routes = [
    ...ACTES_ADMINISTRATIFS_ROUTES,
    ...CONGES_ROUTES,
    ...DASHBOARD_ROUTES,
    ...DOCUMENTS_ROUTES,
    ...DOSSIER_AGENT_ROUTES,
    ...GESTION_COMPTES_ROUTES,
    ...GESTION_ORGANISATIONNELLE_ROUTES,
    ...ONBOARDING_ROUTES,
    ...PARAMETRAGE_ROUTES,
  ];
  for (const r of allRoutes) {
    if (r.path === undefined || r.redirectTo !== undefined) continue;
    routeRoles.set('/' + r.path, (r.data?.['roles'] as string[]) ?? []);
  }

  it('exposes only routes that exist in the application', () => {
    const missing = APP_NAVIGATION_CATALOG
      .map(s => s.route)
      .filter(route => !routeRoles.has(route));
    expect(missing).withContext(`Unknown routes in catalog: ${missing.join(', ')}`).toEqual([]);
  });

  it('never claims broader access than the route guard allows', () => {
    const violations: string[] = [];
    for (const screen of APP_NAVIGATION_CATALOG) {
      const declared = routeRoles.get(screen.route);
      if (!declared || declared.length === 0) continue; // unguarded route
      const extra = screen.roles.filter(role => !declared.includes(role));
      if (extra.length) {
        violations.push(`${screen.route} claims [${extra.join(', ')}] not in [${declared.join(', ')}]`);
      }
    }
    expect(violations).withContext(violations.join(' | ')).toEqual([]);
  });

  it('has unique screen ids', () => {
    const ids = APP_NAVIGATION_CATALOG.map(s => s.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('declares at least one role and a leading-slash route for every screen', () => {
    for (const s of APP_NAVIGATION_CATALOG) {
      expect(s.roles.length).withContext(`${s.id} has no roles`).toBeGreaterThan(0);
      expect(s.route.startsWith('/')).withContext(`${s.id} route must start with '/'`).toBeTrue();
    }
  });
});
