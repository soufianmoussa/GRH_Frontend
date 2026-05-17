import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

export class ToastHelper {

  // ================= SUCCESS =================

  static showAdd(ms: MessageService): void {
    ms.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Ajout effectué avec succès',
      icon: 'pi pi-check-circle',
      life: 3000
    });
  }

  static showEdit(ms: MessageService): void {
    ms.add({
      severity: 'warn',
      summary: 'Succès',
      detail: 'Modification effectuée avec succès',
      icon: 'pi pi-pencil',
      life: 3000
    });
  }

  static showDelete(ms: MessageService): void {
    ms.add({
      severity: 'error',
      summary: 'Succès',
      detail: 'Suppression effectuée avec succès',
      icon: 'pi pi-trash',
      life: 3000
    });
  }

  static showSuccess(ms: MessageService, detail: string): void {
    ms.add({
      severity: 'success',
      summary: 'Succès',
      detail,
      icon: 'pi pi-check-circle',
      life: 4000
    });
  }

  // ================= ERRORS =================

  static showError(ms: MessageService, detail: string): void {
    ms.add({
      severity: 'error',
      summary: 'Erreur',
      detail,
      icon: 'pi pi-exclamation-triangle',
      life: 5000
    });
  }

  static showLoadError(ms: MessageService): void {
    ms.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Erreur lors du chargement des données',
      icon: 'pi pi-exclamation-triangle',
      life: 5000
    });
  }

  static showFormError(ms: MessageService): void {
    this.showError(ms, 'Veuillez compléter le formulaire');
  }

  static showRequiredFieldsError(ms: MessageService): void {
    this.showError(ms, 'Veuillez compléter tous les champs obligatoires');
  }

  static showParentRequiredError(ms: MessageService): void {
    this.showError(ms, 'Le parent est obligatoire');
  }

  static showAddError(ms: MessageService, message?: string): void {
    this.showError(ms, message || "Erreur lors de l'ajout");
  }

  static showUpdateError(ms: MessageService, message?: string): void {
    this.showError(ms, message || "Erreur lors de la modification");
  }

  static showDeleteError(ms: MessageService, message?: string): void {
    this.showError(ms, message || "Erreur lors de la suppression");
  }

  /**
   * Extracts a user-friendly message from an HTTP error response.
   * Reads the backend ApiError.message field if available,
   * otherwise falls back to the provided default message.
   */
  static extractErrorMessage(err: any, defaultMsg: string): string {
    if (err instanceof HttpErrorResponse) {
      return err.error?.message || defaultMsg;
    }
    return err?.error?.message || defaultMsg;
  }

  /**
   * Handles an API error by showing a toast with the backend message or a default.
   */
  static handleApiError(ms: MessageService, err: any, defaultMsg: string): void {
    const detail = this.extractErrorMessage(err, defaultMsg);
    this.showError(ms, detail);
  }

  // ================= WARNINGS =================

  static showWarn(ms: MessageService, detail: string): void {
    ms.add({
      severity: 'warn',
      summary: 'Attention',
      detail,
      icon: 'pi pi-exclamation-circle',
      life: 4000
    });
  }

  static showInfo(ms: MessageService, detail: string): void {
    ms.add({
      severity: 'info',
      summary: 'Information',
      detail,
      icon: 'pi pi-info-circle',
      life: 4000
    });
  }

  // ================= CONFIRMATIONS =================

  /**
   * General confirmation dialog for deletions.
   */
  static confirmDelete(cs: ConfirmationService, acceptCallback: () => void, customMessage?: string): void {
    cs.confirm({
      message: customMessage || 'Confirmez-vous la suppression ?',
      header: 'Confirmer la suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => acceptCallback()
    });
  }

  static confirmAction(cs: ConfirmationService, message: string, header: string, acceptCallback: () => void): void {
    cs.confirm({
      message,
      header,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => acceptCallback()
    });
  }
}
