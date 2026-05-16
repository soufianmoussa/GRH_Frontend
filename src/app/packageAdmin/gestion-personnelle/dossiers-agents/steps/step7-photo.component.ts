import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AgentWizardState } from '../agent-wizard.state';

import { TranslateModule } from '@ngx-translate/core';

/**
 * Étape photo de profil avec drag & drop et aperçu circulaire.
 */
@Component({
  selector: 'app-step7-photo',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TranslateModule],
  templateUrl: './step7-photo.component.html',
})
export class Step7PhotoComponent {
  readonly state = inject(AgentWizardState);

  dragOver = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      input.value = ''; // Reset so same file can be re-selected
    }
  }

  removePhoto(): void {
    this.state.photoFile.set(null);
    this.state.photoPreview.set(null);
  }

  private processFile(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return; // silently ignore non-image files
    }
    if (file.size > 5 * 1024 * 1024) {
      return; // silently ignore files > 5MB
    }

    this.state.photoFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.state.photoPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
}
