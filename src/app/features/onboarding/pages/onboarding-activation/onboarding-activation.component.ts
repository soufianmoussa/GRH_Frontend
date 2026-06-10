import { DatePipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize, Subject, takeUntil } from 'rxjs';
import { OnboardingInvitationService } from '../../services/onboarding-invitation.service';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { AuthService } from '../../../../core/auth/auth.service';

type ActivationState = 'loading' | 'valid' | 'invalid' | 'success';

@Component({
  selector: 'app-onboarding-activation',
  imports: [
    NgIf,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    ProgressSpinnerModule
  ],
  templateUrl: './onboarding-activation.component.html',
  styleUrl: './onboarding-activation.component.scss'
})
export class OnboardingActivationComponent implements OnInit, OnDestroy {
  state: ActivationState = 'loading';
  message = '';
  email = '';
  expiresAt?: string;
  loading = false;

  private token = '';
  private destroy$ = new Subject<void>();

  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private invitationService: OnboardingInvitationService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!token) {
      this.state = 'invalid';
      this.message = 'Lien d activation invalide ou incomplet.';
      return;
    }

    this.token = token;
    this.validateToken();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.token = '';
  }

  activate(): void {
    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      this.message = !this.passwordsMatch()
        ? 'Les mots de passe ne correspondent pas.'
        : 'Veuillez renseigner un mot de passe valide.';
      return;
    }

    const password = this.form.value.password ?? '';
    const confirmPassword = this.form.value.confirmPassword ?? '';

    this.loading = true;
    this.message = '';

    this.invitationService.activate(this.token, password, confirmPassword)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.auth) {
            this.authService.storeAuthResponse(response.auth);
          }
          this.token = '';
          this.form.reset();
          this.state = 'success';
          this.message = 'Votre compte est active. Vous allez etre redirige vers votre tableau de bord onboarding.';
          // Redirection vers le HUB onboarding (et non l'etape 4 du wizard) : le tableau de bord
          // affiche la progression et permet de reprendre l'etape en cours enregistree.
          setTimeout(() => this.router.navigate(['/mon-onboarding']), 1200);
        },
        error: (error) => {
          this.message = ToastHelper.extractErrorMessage(error, 'Activation impossible. Le lien est peut-etre expire ou deja utilise.');
        }
      });
  }

  passwordsMatch(): boolean {
    return (this.form.value.password ?? '') === (this.form.value.confirmPassword ?? '');
  }

  private validateToken(): void {
    this.state = 'loading';
    this.invitationService.validate(this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.valid) {
            this.state = 'invalid';
            this.message = response.message || 'Ce lien d activation n est plus valide.';
            return;
          }

          this.email = response.email ?? '';
          this.expiresAt = response.expiresAt;
          this.state = 'valid';
        },
        error: (error) => {
          this.state = 'invalid';
          this.message = ToastHelper.extractErrorMessage(error, 'Ce lien d activation n est plus valide.');
        }
      });
  }
}
