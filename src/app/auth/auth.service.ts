import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, ChangePasswordRequest, LoginRequest, UserInfo } from './auth.models';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';
  private readonly ACTIVE_ROLE_KEY = 'auth_active_role';

  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.loadStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private activeRoleSubject = new BehaviorSubject<string | null>(localStorage.getItem(this.ACTIVE_ROLE_KEY));
  activeRole$ = this.activeRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        if (response.refreshToken) {
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        }

        const user: UserInfo = {
          id: 0,
          username: response.username,
          roles: response.roles,
          matricule: response.matricule,
          agentId: response.agentId ?? null
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.setDefaultActiveRole(response.roles);
      })
    );
  }

  logout(): void {
    const clearLocalState = () => {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.ACTIVE_ROLE_KEY);
      this.currentUserSubject.next(null);
      this.activeRoleSubject.next(null);
      this.router.navigate(['/login']);
    };

    if (this.getToken()) {
      this.http.post(`${this.API_URL}/logout`, {}, { responseType: 'text' }).subscribe({
        next: () => clearLocalState(),
        error: () => clearLocalState()
      });
    } else {
      clearLocalState();
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  refreshTokens(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        if (response.refreshToken) {
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        }
      })
    );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  getRoles(): string[] {
    return this.getCurrentUser()?.roles ?? [];
  }

  getAgentId(): number | null {
    return this.getCurrentUser()?.agentId ?? null;
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyRole(...roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some(role => userRoles.includes(role));
  }

  fetchMe(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.API_URL}/me`).pipe(
      tap(user => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);

        const currentActive = this.activeRoleSubject.value;
        if (!currentActive || !user.roles.includes(currentActive)) {
          this.setDefaultActiveRole(user.roles);
        }
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<string> {
    return this.http.put(`${this.API_URL}/password`, request, { responseType: 'text' });
  }

  setActiveRole(role: string): void {
    if (this.hasRole(role)) {
      localStorage.setItem(this.ACTIVE_ROLE_KEY, role);
      this.activeRoleSubject.next(role);
    }
  }

  private setDefaultActiveRole(roles: string[]): void {
    if (!roles || roles.length === 0) return;

    let defaultRole = roles[0];
    if (roles.includes('ADMIN')) defaultRole = 'ADMIN';
    else if (roles.includes('RESPONSABLE_UNITE')) defaultRole = 'RESPONSABLE_UNITE';
    else if (roles.includes('AGENT')) defaultRole = 'AGENT';

    this.setActiveRole(defaultRole);
  }

  private loadStoredUser(): UserInfo | null {
    const stored = localStorage.getItem(this.USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }

    // Fallback: try to rebuild core user info from the active token
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (Date.now() < payload.exp * 1000) {
           return {
             id: 0,
             username: payload.sub,
             roles: payload.roles || [],
             matricule: payload.matricule,
             agentId: payload.agentId ?? null
           };
        }
      } catch {}
    }

    return null;
  }
}
