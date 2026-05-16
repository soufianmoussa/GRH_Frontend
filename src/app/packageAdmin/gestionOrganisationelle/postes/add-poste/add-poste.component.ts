import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Stepper, StepList, StepPanels, StepPanel, Step, StepperSeparator } from 'primeng/stepper';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Calendar } from 'primeng/calendar';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PosteService } from '../../../../services/AdminService/GestionOrganisationelle/poste.service';
import { UniteStructurelleService } from '../../../../services/AdminService/GestionOrganisationelle/unite-structurelle.service';
import { FonctionService } from '../../../../services/AdminService/GestionOrganisationelle/fonction.service';
import { PostesactivitesService } from '../../../../services/AdminService/postesActivites/postesactivites.service';

import { Poste } from '../../../../models/gestionOrganisationelle/poste.model';
import { UniteStructurelle } from '../../../../models/gestionOrganisationelle/unite-structurelle.model';
import { Fonction } from '../../../../models/gestionOrganisationelle/fonction.model';
import { PosteTravailDTO } from '../../../../models/postesActivites.model';

@Component({
  selector: 'app-add-poste',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    Stepper, StepList, StepPanels, StepPanel, Step, StepperSeparator,
    Button,
    InputText,
    Calendar,
    Select,
    Toast,
    TagModule,
    TranslateModule
  ],
  templateUrl: './add-poste.component.html',
  styleUrl: './add-poste.component.scss'
})
export class AddPosteComponent implements OnInit {

  activeStep = 1;
  saving = false;
  loadingDropdowns = true;

  codeCourt = '';
  libelleDuPoste = '';
  dateCreation: Date | null = new Date();

  unites: UniteStructurelle[] = [];
  selectedUniteId: number | null = null;

  fonctions: Fonction[] = [];
  selectedFonctionId: number | null = null;

  postesTravail: PosteTravailDTO[] = [];
  selectedPosteTravailId: number | null = null;
  selectedPosteTravail: PosteTravailDTO | null = null;

  constructor(
    private router: Router,
    private posteService: PosteService,
    private uniteService: UniteStructurelleService,
    private fonctionService: FonctionService,
    private postesActivitesService: PostesactivitesService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  showToast(severity: string, summaryKey: string, detailKey: string, detailOverride?: string) {
    this.messageService.add({
      severity: severity,
      summary: this.translate.instant(summaryKey),
      detail: detailOverride || this.translate.instant(detailKey),
      icon: severity === 'success' ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle',
      life: severity === 'success' ? 3000 : 5000
    });
  }

  loadDropdowns(): void {
    this.loadingDropdowns = true;

    forkJoin({
      unites: this.uniteService.getAll(0, 1000),
      fonctions: this.fonctionService.getAll(0, 1000),
      postesTravail: this.postesActivitesService.getPostes()
    }).subscribe({
      next: (data) => {
        this.unites = data.unites?.content ?? [];
        this.fonctions = data.fonctions?.content ?? [];
        this.postesTravail = data.postesTravail ?? [];
        this.loadingDropdowns = false;
      },
      error: () => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GLOBAL.MESSAGE.ERR_LOAD');
        this.loadingDropdowns = false;
      }
    });
  }

  goToStep(step: number): void {
    this.activeStep = step;
  }

  nextStep(activateCallback: (step: number) => void): void {
    if (!this.validateCurrentStep()) return;
    const next = this.activeStep + 1;
    this.activeStep = next;
    activateCallback(next);
  }

  prevStep(activateCallback: (step: number) => void): void {
    const prev = this.activeStep - 1;
    this.activeStep = prev;
    activateCallback(prev);
  }

  validateCurrentStep(): boolean {
    const err = (key: string) => this.showToast('error', 'GLOBAL.ERREUR', 'GESTION_ORGANISATIONELLE.POSTES.ADD_POSTE.' + key);
    switch (this.activeStep) {
      case 1:
        if (!this.codeCourt.trim()) {
          err('ERR_CODE_COURT');
          return false;
        }
        if (!this.libelleDuPoste.trim()) {
          err('ERR_LIBELLE');
          return false;
        }
        return true;
      case 2:
        if (!this.selectedUniteId) {
          err('ERR_SELECT_UNITE');
          return false;
        }
        return true;
      case 3:
        if (!this.selectedFonctionId) {
          err('ERR_SELECT_FONCTION');
          return false;
        }
        return true;
      case 4:
        if (!this.selectedPosteTravailId) {
          err('ERR_SELECT_POSTE');
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  onPosteTravailChange(): void {
    this.selectedPosteTravail = this.postesTravail.find(p => p.id === this.selectedPosteTravailId) ?? null;
  }

  getSelectedUniteLabel(): string {
    return this.unites.find(u => u.id === this.selectedUniteId)?.libelle ?? '—';
  }

  getSelectedFonctionLabel(): string {
    return this.fonctions.find(f => f.id === this.selectedFonctionId)?.libelle ?? '—';
  }

  getSelectedPosteTravailLabel(): string {
    return this.selectedPosteTravail?.designationObjet ?? '—';
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  submit(): void {
    this.saving = true;

    const payload: Partial<Poste> = {
      codeCourt: this.codeCourt.trim(),
      libelleDuPoste: this.libelleDuPoste.trim(),
      dateCreation: this.toIsoDate(this.dateCreation),
      uniteStructurelleId: this.selectedUniteId,
      fonctionId: this.selectedFonctionId,
      posteTravailId: this.selectedPosteTravailId
    };

    this.posteService.create(payload).subscribe({
      next: () => {
        this.showToast('success', 'GLOBAL.SUCCES', 'GLOBAL.MESSAGE.SUCCES_ADD');
        this.saving = false;
        setTimeout(() => this.router.navigate(['/Postes']), 800);
      },
      error: (err) => {
        this.showToast('error', 'GLOBAL.ERREUR', 'GESTION_ORGANISATIONELLE.POSTES.ERR_ADD', err?.error?.message);
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/Postes']);
  }
}
