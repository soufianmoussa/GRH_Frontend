import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import {
  AccountDTO,
  AccountCreationRequest,
  RoleUpdateRequest,
  PasswordResetRequest,
  LinkAgentRequest,
  PageResponse,
  AccountSearchParams,
  AuthAuditLogDTO,
  AuthAuditSearchParams
} from '../../../auth/auth.models';

@Injectable({
  providedIn: 'root'
})
export class GestionComptesService {
  private readonly API_URL = `${environment.apiUrl}/api/admin/accounts`;

  constructor(private http: HttpClient) {}

  getAllAccounts(): Observable<AccountDTO[]> {
    return this.http.get<AccountDTO[]>(this.API_URL);
  }

  searchAccounts(params: AccountSearchParams): Observable<PageResponse<AccountDTO>> {
    return this.http.get<PageResponse<AccountDTO>>(`${this.API_URL}/search`, {
      params: this.toHttpParams(params)
    });
  }

  createAccount(data: AccountCreationRequest): Observable<AccountDTO> {
    return this.http.post<AccountDTO>(this.API_URL, data);
  }

  updateRoles(id: number, data: RoleUpdateRequest): Observable<AccountDTO> {
    return this.http.put<AccountDTO>(`${this.API_URL}/${id}/roles`, data);
  }

  toggleStatus(id: number, enabled: boolean): Observable<AccountDTO> {
    return this.http.put<AccountDTO>(`${this.API_URL}/${id}/status?enabled=${enabled}`, {});
  }

  unlockAccount(id: number): Observable<AccountDTO> {
    return this.http.post<AccountDTO>(`${this.API_URL}/${id}/unlock`, {});
  }

  resetPassword(id: number, data: PasswordResetRequest): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/password`, data);
  }

  linkAgent(id: number, data: LinkAgentRequest): Observable<AccountDTO> {
    return this.http.put<AccountDTO>(`${this.API_URL}/${id}/link`, data);
  }

  searchAuditLogs(params: AuthAuditSearchParams): Observable<PageResponse<AuthAuditLogDTO>> {
    return this.http.get<PageResponse<AuthAuditLogDTO>>(`${environment.apiUrl}/api/admin/auth-audit`, {
      params: this.toHttpParams(params)
    });
  }

  private toHttpParams<T extends object>(params: T): Record<string, string> {
    return Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {});
  }
}
