import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import {
  InvitationActivationResponse,
  InvitationValidationResponse
} from '../../../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class OnboardingInvitationService {
  private readonly baseUrl = `${environment.apiUrl}/onboarding-invitations`;

  constructor(private http: HttpClient) {}

  validate(token: string): Observable<InvitationValidationResponse> {
    return this.http.post<InvitationValidationResponse>(`${this.baseUrl}/validate`, { token });
  }

  activate(token: string, password: string, confirmPassword: string): Observable<InvitationActivationResponse> {
    return this.http.post<InvitationActivationResponse>(`${this.baseUrl}/activate`, {
      token,
      password,
      confirmPassword
    });
  }
}
