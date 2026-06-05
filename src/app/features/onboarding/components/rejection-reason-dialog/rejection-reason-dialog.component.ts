import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextarea } from 'primeng/inputtextarea';

@Component({
  selector: 'app-rejection-reason-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, Dialog, InputTextarea],
  templateUrl: './rejection-reason-dialog.component.html',
  styleUrl: './rejection-reason-dialog.component.scss'
})
export class RejectionReasonDialogComponent {
  @Input() visible = false;
  @Input() header = 'Motif du rejet';
  @Input() subject = 'Indiquez la raison du rejet pour informer le destinataire.';
  @Input() confirmLabel = 'Rejeter';
  @Input() initialReason = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<string>();

  reason = '';

  show(initial = ''): void {
    this.reason = initial || this.initialReason || '';
    this.visible = true;
    this.visibleChange.emit(true);
  }

  hide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onConfirm(): void {
    const trimmed = (this.reason ?? '').trim();
    if (!trimmed) return;
    this.confirm.emit(trimmed);
    this.hide();
  }
}
