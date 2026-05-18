import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    RouterLink
  ]
})
export class RegisterComponent {

  email = '';
  password = '';
  confirmPassword = '';
  message = '';

  constructor(private router: Router) {}

  onRegister() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.message = 'Tous les champs sont obligatoires';
      return;
    }

    if (!this.email.includes('@gmail.com')) {
      this.message = 'Veuillez utiliser un email Gmail';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = 'Les mots de passe ne correspondent pas';
      return;
    }

    console.log('Compte créé :', this.email);

    this.router.navigate(['/login']);
  }
}
