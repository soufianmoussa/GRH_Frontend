import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import {
  InvitationStatusDto,
  OnboardingDetail,
  OnboardingInitializeRequest,
  OnboardingPage,
  OnboardingProfileRequest
} from '../../../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class AdminOnboardingService {
  private readonly baseUrl = `${environment.apiUrl}/admin/onboardings`;

  constructor(private http: HttpClient) {}

  initialize(payload: OnboardingInitializeRequest): Observable<OnboardingDetail> {
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/initialize`, payload);
  }

  list(page = 0, size = 10, criteria?: Record<string, unknown>): Observable<OnboardingPage> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    Object.entries(criteria ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<OnboardingPage>(this.baseUrl, { params });
  }

  getById(id: number): Observable<OnboardingDetail> {
    return this.http.get<OnboardingDetail>(`${this.baseUrl}/${id}`);
  }

  startAssisted(id: number): Observable<OnboardingDetail> {
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/${id}/start-assisted`, {});
  }

  updateProfile(id: number, payload: OnboardingProfileRequest): Observable<OnboardingDetail> {
    return this.http.put<OnboardingDetail>(`${this.baseUrl}/${id}/profile`, payload);
  }

  submit(id: number): Observable<OnboardingDetail> {
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/${id}/submit`, {});
  }

  uploadDocument(id: number, documentId: number, file: File): Observable<OnboardingDetail> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/${id}/documents/${documentId}/file`, formData);
  }

  validateDocument(id: number, documentId: number): Observable<OnboardingDetail> {
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/${id}/documents/${documentId}/validate`, {});
  }

  rejectDocument(id: number, documentId: number, reason: string): Observable<OnboardingDetail> {
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/${id}/documents/${documentId}/reject`, { reason });
  }

  validateDossier(id: number): Observable<OnboardingDetail> {
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/${id}/validate`, {});
  }

  rejectDossier(id: number, reason: string): Observable<OnboardingDetail> {
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  resendInvitation(id: number): Observable<InvitationStatusDto> {
    return this.http.post<InvitationStatusDto>(`${this.baseUrl}/${id}/resend-invitation`, {});
  }

  getInvitationStatus(id: number): Observable<InvitationStatusDto> {
    return this.http.get<InvitationStatusDto>(`${this.baseUrl}/${id}/invitation-status`);
  }
}
