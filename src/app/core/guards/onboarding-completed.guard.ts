import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * Ferme l'espace « Mon onboarding » une fois l'intégration terminée.
 *
 * L'onboarding est un parcours à usage unique : dès que l'administrateur valide
 * définitivement le dossier, le backend refuse toute modification et l'écran n'a plus
 * d'objet. Ce garde empêche d'y revenir par l'URL — le masquer du menu ne suffit pas.
 *
 * Fonctionne en tandem avec {@code roleGuard}, qui traite le cas inverse : tant que
 * l'onboarding n'est PAS terminé, l'agent est ramené vers ce même espace.
 *
 * Le statut provient de la session ({@code onboardingStatus}), renseigné à la connexion
 * et à chaque rafraîchissement de jeton, et rafraîchi par le tableau de bord onboarding
 * dès qu'il lit le dossier réel. Statut inconnu (ancienne session) : on laisse passer,
 * le backend restant l'autorité.
 */
export const onboardingCompletedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isOnboardingCompleted()) {
    router.navigate(['/accueil']);
    return false;
  }
  return true;
};
