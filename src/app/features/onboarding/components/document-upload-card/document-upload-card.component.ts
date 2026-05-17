import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { OnboardingDocument } from '../../../../models/onboarding.model';
import { DocumentStatusBadgeComponent } from '../document-status-badge/document-status-badge.component';

@Component({
  selector: 'app-document-upload-card',
  imports: [CommonModule, ButtonModule, DocumentStatusBadgeComponent],
  templateUrl: './document-upload-card.component.html',
  styleUrl: './document-upload-card.component.scss'
})
export class DocumentUploadCardComponent {
  @Input() document?: OnboardingDocument;
  @Input() readonly = false;
  @Output() fileSelected = new EventEmitter<{ documentId: number; file: File }>();

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && this.document?.id) {
      this.fileSelected.emit({ documentId: this.document.id, file });
      input.value = '';
    }
  }
}
