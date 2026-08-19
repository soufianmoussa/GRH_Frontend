import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {
  DocumentFieldCheck,
  DocumentVerificationStatus,
  VERIFICATION_STATUS_LABELS
} from '../../../models/onboarding.model';

/**
 * Restitution du verdict OCR d'un document, partagée par tous les écrans de validation :
 * revue d'onboarding, approbation des demandes de modification (RIB, enfant) et
 * justificatifs de congé.
 *
 * <p>Le composant est purement présentiel — il ne sait pas d'où vient le document ni ce
 * qu'il faut en faire. L'écran hôte fournit le verdict et réagit à `reanalyze`.</p>
 *
 * <p>Le verdict est volontairement présenté comme une aide à la décision et jamais comme un
 * blocage : le valideur garde la main pour approuver ou rejeter.</p>
 */
@Component({
  selector: 'app-document-verification-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './document-verification-panel.component.html',
  styleUrl: './document-verification-panel.component.scss'
})
export class DocumentVerificationPanelComponent {
  /** Verdict global ; `undefined` = jamais analysé. */
  @Input() status?: DocumentVerificationStatus;
  /** Comparaison ligne à ligne document / valeurs attendues. */
  @Input() checks: DocumentFieldCheck[] | undefined = [];
  /** Synthèse lisible du verdict, ou cause de l'échec d'analyse. */
  @Input() message?: string;
  /** Confiance Azure [0..1] sur l'extraction. */
  @Input() confidence?: number;
  @Input() analyzedAt?: string;
  /** Analyse en cours : désactive le bouton et affiche le spinner. */
  @Input() loading = false;
  /** Masque le bouton quand l'écran ne propose pas de relance. */
  @Input() showReanalyze = true;

  @Output() reanalyze = new EventEmitter<void>();

  /** Le détail est replié par défaut : le badge suffit dans le cas nominal. */
  expanded = false;

  get hasChecks(): boolean {
    return !!this.checks?.length;
  }

  get analyzed(): boolean {
    return !!this.status;
  }

  toggle(): void {
    this.expanded = !this.expanded;
  }

  label(status?: DocumentVerificationStatus): string {
    return status ? VERIFICATION_STATUS_LABELS[status] : 'Non verifie';
  }

  icon(status?: DocumentVerificationStatus): string {
    switch (status) {
      case 'MATCH': return 'pi pi-check-circle';
      case 'MISMATCH': return 'pi pi-times-circle';
      case 'MISSING': return 'pi pi-exclamation-triangle';
      case 'ERROR': return 'pi pi-ban';
      case 'UNSUPPORTED': return 'pi pi-minus-circle';
      default: return 'pi pi-question-circle';
    }
  }

  confidencePercent(): number | undefined {
    return this.confidence == null ? undefined : Math.round(this.confidence * 100);
  }
}
