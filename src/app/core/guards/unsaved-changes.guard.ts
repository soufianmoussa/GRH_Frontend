import { CanDeactivateFn } from '@angular/router';

/**
 * Composant éditable capable d'indiquer s'il porte des modifications non enregistrées.
 * Tout composant protégé par {@link unsavedChangesGuard} doit l'implémenter.
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Garde de désactivation de route : demande une confirmation avant de quitter une page
 * dont le formulaire contient des données non sauvegardées (Issue #6 — perte silencieuse
 * des saisies lors d'une navigation interne).
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component?.hasUnsavedChanges?.()) {
    return true;
  }
  return window.confirm(
    'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ? '
    + 'Les données non sauvegardées seront perdues.'
  );
};
