import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Stepper, StepList, StepPanels, StepPanel, Step } from 'primeng/stepper';
import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AgentWizardState } from '../agent-wizard.state';
import { buildAgentPayload } from '../agent-wizard-payload';
import { validateStep, validateAll } from '../agent-wizard-validation';
import { DossiersAgentsService } from '../../../services/dossiers-agents/dossiers-agents.service';
import { ToastHelper } from '../../../../../shared/utils/toast-helper';

import { Step1MatriculeComponent } from '../steps/step1-matricule.component';
import { Step2IdentityComponent } from '../steps/step2-identity.component';
import { Step3AddressComponent } from '../steps/step3-address.component';
import { Step4ProComponent } from '../steps/step4-pro.component';
import { Step5BankComponent } from '../steps/step5-bank.component';
import { Step6FamilyComponent } from '../steps/step6-family.component';
import { Step7PhotoComponent } from '../steps/step7-photo.component';
import { Step8RecapComponent } from '../steps/step8-recap.component';

/**
 * Shell du wizard de création/édition d'un dossier agent.
 */
@Component({
  selector: 'app-dossier-agent-wizard',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    Stepper,
    StepList,
    StepPanels,
    StepPanel,
    Step,
    Button,
    Toast,
    ConfirmDialogModule,
    TagModule,
    Step1MatriculeComponent,
    Step2IdentityComponent,
    Step3AddressComponent,
    Step4ProComponent,
    Step5BankComponent,
    Step6FamilyComponent,
    Step7PhotoComponent,
    Step8RecapComponent,
    TranslateModule
  ],
  templateUrl: './dossier-agent-wizard.component.html',
  styleUrl: './dossier-agent-wizard.component.scss',
})
export class DossierAgentWizardComponent implements OnInit {
  readonly state = inject(AgentWizardState);
  private readonly service = inject(DossiersAgentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  private readonly translateService = inject(TranslateService);

  readonly totalSteps = 8;
  saving = false;
  loading = false;

  get steps() {
    return [
      { index: 1, label: this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP1.LABEL') },
      { index: 2, label: this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP2.LABEL') },
      { index: 3, label: this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP3.LABEL') },
      { index: 4, label: this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP4.LABEL') },
      { index: 5, label: this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP5.LABEL') },
      { index: 6, label: this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP6.LABEL') },
      { index: 7, label: this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP7.LABEL') },
      { index: 8, label: this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.STEPS.STEP8.LABEL') },
    ];
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const viewMode = this.route.snapshot.data?.['mode'] === 'view';

    if (idParam) {
      const agentId = Number(idParam);
      this.state.mode.set(viewMode ? 'view' : 'edit');
      this.loadAgent(agentId);
    } else {
      this.state.reset();
      this.state.mode.set('create');
    }
  }

  private loadAgent(id: number): void {
    this.loading = true;
    this.service.getFull(id).subscribe({
      next: (full) => {
        this.state.loadFromAgent(full);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        ToastHelper.showError(this.toast, this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.ERR_LOAD'));
        console.error(err);
      },
    });
  }

  tryGoTo(next: number, activate: (n: number) => void): void {
    const current = this.state.activeStep();
    if (this.state.mode() === 'view' || next <= current) {
      activate(next);
      return;
    }
    const errors = validateStep(current, this.state.draft());
    if (errors.length) {
      this.showValidationErrors(errors);
      return;
    }
    activate(next);
  }

  private showValidationErrors(errors: any[]): void {
    for (const err of errors) {
      if (typeof err === 'string') {
        ToastHelper.showWarn(this.toast, err);
      } else {
        const msg = this.translateService.instant(err.key, err.params);
        ToastHelper.showWarn(this.toast, msg);
      }
    }
  }

  private finishSubmit(): void {
    setTimeout(() => {
      this.state.reset();
      this.router.navigate(['/GestionUtilisateurs']);
    }, 500);
  }

  submit(): void {
    const errors = validateAll(this.state.draft());
    if (errors.length) {
      this.showValidationErrors(errors);
      return;
    }
    this.saving = true;
    const payload = buildAgentPayload(this.state.draft());
    const isEdit = this.state.mode() === 'edit' && !!this.state.agentId();
    const call = isEdit
      ? this.service.updateFull(this.state.agentId()!, payload)
      : this.service.createFull(payload);

    call.subscribe({
      next: (resp) => {
        const photoFile = this.state.photoFile();
        if (photoFile) {
          this.service.uploadProfilePicture(resp.id, photoFile).subscribe({
            next: () => {
              this.saving = false;
              ToastHelper.showSuccess(this.toast, isEdit ? this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.MSG_UPDATED') : this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.MSG_CREATED_PHOTO'));
              this.finishSubmit();
            },
            error: (err) => {
              this.saving = false;
              ToastHelper.showWarn(this.toast, this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.WARN_PHOTO'));
              console.error('Erreur upload photo:', err);
              this.finishSubmit();
            },
          });
        } else {
          this.saving = false;
          ToastHelper.showSuccess(this.toast, isEdit ? this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.MSG_UPDATED') : this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.MSG_CREATED'));
          this.finishSubmit();
        }
      },
      error: (err) => {
        this.saving = false;
        ToastHelper.showError(this.toast, this.extractErrorMessage(err));
        console.error('Submit Error:', err);
      },
    });
  }

  private extractErrorMessage(err: any): string {
    if (err?.error?.message) return err.error.message;
    const body = err?.error;
    if (body && typeof body === 'object') {
      const errors = body.errors;
      if (Array.isArray(errors) && errors.length) {
        return errors.map((e: any) => e.defaultMessage || e.message || JSON.stringify(e)).join(' • ');
      }
    }
    return this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.ERR_SAVE');
  }

  cancel(): void {
    this.confirm.confirm({
      header: this.translateService.instant('GLOBAL.ANNULER'),
      message: this.translateService.instant('GESTION_PERSONNELLE.AGENT_WIZARD.CONFIRM_CANCEL'),
      accept: () => {
        this.state.reset();
        this.router.navigate(['/GestionUtilisateurs']);
      },
    });
  }
}
