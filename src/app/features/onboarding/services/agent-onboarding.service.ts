import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { OnboardingDetail, OnboardingProfileRequest } from '../../../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class AgentOnboardingService {
  private readonly baseUrl = `${environment.apiUrl}/me/onboarding`;

  constructor(private http: HttpClient) {}

  getMine(): Observable<OnboardingDetail> {
    return this.http.get<OnboardingDetail>(this.baseUrl);
  }

  updateProfile(payload: OnboardingProfileRequest): Observable<OnboardingDetail> {
    return this.http.put<OnboardingDetail>(`${this.baseUrl}/profile`, payload);
  }

  uploadDocument(documentId: number, file: File): Observable<OnboardingDetail> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/documents/${documentId}/file`, formData);
  }

  submit(): Observable<OnboardingDetail> {
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/submit`, {});
  }
}
