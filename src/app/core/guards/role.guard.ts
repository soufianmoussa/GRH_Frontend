import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles: string[] = route.data?.['roles'] ?? [];

  if (requiredRoles.length === 0) {
    return true;
  }

  if (authService.hasAnyRole(...requiredRoles)) {
    if (requiredRoles.includes('AGENT') && !authService.hasAnyRole('ADMIN', 'RESPONSABLE_UNITE')) {
      const currentUrl = state.url.split('?')[0].split('#')[0];
      const allowedOnboardingRoutes = [
        '/mon-onboarding',
        '/mon-onboarding/wizard',
        '/mon-onboarding/profil',
        '/mon-onboarding/documents',
        '/mon-onboarding/recapitulatif'
      ];
      const onboardingStatus = authService.getCurrentUser()?.onboardingStatus;

      // Statut connu et parcours encore en cours : on ramene l'agent vers son onboarding.
      // Le cas inverse (parcours termine) est traite par `onboardingCompletedGuard`.
      if (onboardingStatus && !authService.isOnboardingCompleted()
          && !allowedOnboardingRoutes.includes(currentUrl)) {
        router.navigate([onboardingStatus === 'PENDING_VALIDATION' ? '/mon-onboarding' : '/mon-onboarding/profil']);
        return false;
      }
    }

    return true;
  }

  router.navigate(['/login']);
  return false;
};
