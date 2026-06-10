import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, ChangePasswordRequest, LoginRequest, UserInfo } from './auth.models';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';
  private readonly ACTIVE_ROLE_KEY = 'auth_active_role';

  // Stratégie de stockage : sessionStorage. Contrairement à localStorage, la session est
  // effacée à la fermeture de l'onglet/navigateur — la fermeture de l'application déconnecte
  // donc l'utilisateur et empêche toute restauration silencieuse au redémarrage.
  private readonly storage: Storage = sessionStorage;

  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.loadStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private activeRoleSubject = new BehaviorSubject<string | null>(this.storage.getItem(this.ACTIVE_ROLE_KEY));
  activeRole$ = this.activeRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.storeAuthResponse(response))
    );
  }

  storeAuthResponse(response: AuthResponse): void {
    this.storage.setItem(this.TOKEN_KEY, response.token);
    if (response.refreshToken) {
      this.storage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    }

    const user: UserInfo = {
      id: 0,
      username: response.username,
      roles: response.roles,
      matricule: response.matricule,
      agentId: response.agentId ?? null,
      onboardingStatus: response.onboardingStatus ?? null
    };
    this.storage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.setDefaultActiveRole(response.roles);
  }

  logout(): void {
    const clearLocalState = () => {
      this.clearAuthStorage();
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
    return this.storage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storage.getItem(this.REFRESH_TOKEN_KEY);
  }

  refreshTokens(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.storage.setItem(this.TOKEN_KEY, response.token);
        if (response.refreshToken) {
          this.storage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        }
      })
    );
  }

  isAuthenticated(): boolean {
    // Token d'accès encore valide : authentifié sans ambiguïté.
    if (this.hasValidAccessToken()) return true;
    // Token d'accès expiré mais un refresh token est présent : on autorise (de façon optimiste)
    // et l'intercepteur tentera un rafraîchissement au prochain appel API. Le serveur reste
    // l'autorité : si le refresh est invalide/expiré/révoqué, la 401 entraînera la déconnexion.
    return !!this.getRefreshToken();
  }

  /** Vrai uniquement si un token d'accès non expiré est présent (validation locale du `exp`). */
  hasValidAccessToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }

  /** Supprime toutes les clés d'authentification du stockage de session. */
  private clearAuthStorage(): void {
    this.storage.removeItem(this.TOKEN_KEY);
    this.storage.removeItem(this.REFRESH_TOKEN_KEY);
    this.storage.removeItem(this.USER_KEY);
    this.storage.removeItem(this.ACTIVE_ROLE_KEY);
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
        this.storage.setItem(this.USER_KEY, JSON.stringify(user));
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

  getActiveRole(): string | null {
    return this.activeRoleSubject.value;
  }

  setActiveRole(role: string): void {
    if (this.hasRole(role)) {
      this.storage.setItem(this.ACTIVE_ROLE_KEY, role);
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
    // Ne restaure une session au démarrage que s'il existe un token d'accès valide OU un refresh
    // token (l'intercepteur pourra rafraîchir). Sinon on purge tout état résiduel : pas de
    // restauration d'une session « connectée » à partir de données expirées/incohérentes.
    const hasUsableSession = this.hasValidAccessToken() || !!this.getRefreshToken();
    if (!hasUsableSession) {
      this.clearAuthStorage();
      return null;
    }

    const stored = this.storage.getItem(this.USER_KEY);
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
             agentId: payload.agentId ?? null,
             onboardingStatus: null
           };
        }
      } catch {}
    }

    return null;
  }
}
