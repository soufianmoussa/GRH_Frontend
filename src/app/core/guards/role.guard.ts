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
        '/agent/onboarding',
        '/agent/onboarding/complete',
        '/onboarding/complete-profile',
        '/onboarding/waiting'
      ];
      const onboardingStatus = authService.getCurrentUser()?.onboardingStatus;

      if (onboardingStatus && !['VALIDATED', 'ACTIVE'].includes(onboardingStatus)
          && !allowedOnboardingRoutes.includes(currentUrl)) {
        router.navigate([onboardingStatus === 'PENDING_VALIDATION' ? '/onboarding/waiting' : '/onboarding/complete-profile']);
        return false;
      }
    }

    return true;
  }

  router.navigate(['/login']);
  return false;
};
