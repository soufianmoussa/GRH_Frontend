import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NgIf } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { ToastHelper } from '../shared/toast-helper';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    FormsModule,
    MessageModule,
    PasswordModule,
    ButtonModule,
    InputTextModule,
    RouterLink,
    NgIf
  ]
})
export class LoginComponent {
  username = '';
  password = '';
  message = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  onSubmit(): void {
    if (!this.username) {
      this.message = "Veuillez entrer votre nom d'utilisateur !";
      return;
    }

    if (!this.password) {
      this.message = 'Veuillez entrer un mot de passe !';
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.redirectByRole();
      },
      error: (err) => {
        this.loading = false;
        this.message = ToastHelper.extractErrorMessage(err, 'Erreur de connexion. Veuillez réessayer.');
      }
    });
  }

  private redirectByRole(): void {
    const roles = this.authService.getRoles();
    if (roles.includes('ADMIN')) {
      this.router.navigate(['/dashboard']);
    } else if (roles.includes('RESPONSABLE_UNITE')) {
      this.router.navigate(['/DemandesCongeAttestation']);
    } else {
      this.router.navigate(['/accueil']);
    }
  }
}
