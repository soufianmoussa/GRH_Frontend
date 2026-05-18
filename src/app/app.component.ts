import { Component, OnInit } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {TopbarComponent} from './core/layout/topbar/topbar.component';
import {SidebarComponent} from './core/layout/sidebar/sidebar.component';
import {NgIf} from '@angular/common';
import {AuthService} from './core/auth/auth.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopbarComponent, SidebarComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ghrfe';
  sidebarOpened = true;

  constructor(private router: Router, private authService: AuthService, private languageService: LanguageService) {}

  ngOnInit() {
    this.languageService.init();

    if (this.authService.isAuthenticated()) {
      this.authService.fetchMe().subscribe({
        error: () => {
          // Si l'utilisateur n'est plus valide coté serveur, on purge
          this.authService.logout();
        }
      });
    }
  }

  isPublicLayoutPage(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '/login'
      || path === '/register'
      || path === '/onboarding/activate';
  }
}
