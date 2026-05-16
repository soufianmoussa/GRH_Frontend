import { Component, OnInit } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {TopbarComponent} from './topbar/topbar.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {NgIf} from '@angular/common';
import {AuthService} from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopbarComponent, SidebarComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ghrfe';
  sidebarOpened = true;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.authService.fetchMe().subscribe({
        error: () => {
          // Si l'utilisateur n'est plus valide coté serveur, on purge
          this.authService.logout();
        }
      });
    }
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isRegisterPage(): boolean {
    return this.router.url === '/register';
  }
}
