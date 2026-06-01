import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserInfo } from '../../auth/auth.models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

interface RoleOption {
  labelKey: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, TranslateModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {

  @Output() toggleSidebar = new EventEmitter<void>();

  logoProject = "assets/MastechRh-Logo.png";

  currentUser: UserInfo | null = null;
  activeRole: string | null = null;
  availableRoles: RoleOption[] = [];
  dropdownOpen = false;

  private readonly roleLabels: Record<string, RoleOption> = {
    'ADMIN':             { labelKey: 'LAYOUT.TOPBAR.ROLE_ADMIN',              value: 'ADMIN',             icon: 'fa-solid fa-shield-halved' },
    'AGENT':             { labelKey: 'LAYOUT.TOPBAR.ROLE_AGENT',              value: 'AGENT',             icon: 'fa-solid fa-id-card' },
    'RESPONSABLE_UNITE': { labelKey: 'LAYOUT.TOPBAR.ROLE_RESPONSABLE_UNITE',  value: 'RESPONSABLE_UNITE', icon: 'fa-solid fa-user-tie' },
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    public translate: TranslateService,
    private languageService: LanguageService
  ) {}

  get currentLanguage(): string {
    return this.languageService.current();
  }

  get targetLanguage(): string {
    return this.currentLanguage.toLowerCase() === 'fr' ? 'EN' : 'FR';
  }

  /** Two-letter initials derived from the username (handles "first.last", "first_last", "firstlast"). */
  get userInitials(): string {
    const name = this.currentUser?.username?.trim() || '';
    if (!name) return '?';
    const parts = name.split(/[\s._@-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  toggleLanguage() {
    this.languageService.toggle();
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.availableRoles = (user?.roles ?? [])
        .filter(r => this.roleLabels[r])
        .map(r => this.roleLabels[r]);
    });

    this.authService.activeRole$.subscribe(role => {
      this.activeRole = role;
    });
  }

  get activeRoleLabel(): RoleOption | null {
    return this.activeRole ? (this.roleLabels[this.activeRole] ?? null) : null;
  }

  /** Whether the user can switch role (more than one role available). */
  get canSwitchRole(): boolean {
    return this.availableRoles.length > 1;
  }

  private readonly roleDefaultRoutes: Record<string, string> = {
    'ADMIN':             '/dashboard',
    'AGENT':             '/accueil',
    'RESPONSABLE_UNITE': '/DemandesCongeAttestation',
  };

  switchRole(role: string) {
    this.authService.setActiveRole(role);
    this.dropdownOpen = false;
    const route = this.roleDefaultRoutes[role];
    if (route) this.router.navigate([route]);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  /** Close the dropdown on Escape for keyboard accessibility. */
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.dropdownOpen) this.closeDropdown();
  }

  logout() {
    this.authService.logout();
  }
}
