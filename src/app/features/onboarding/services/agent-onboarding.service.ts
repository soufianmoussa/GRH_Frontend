import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { OnboardingDetail } from '../../../models/onboarding.model';
import { AgentCreateRequest } from '../../../models/agent-full.model';
import { Diplome } from '../../documents/models/diplomes/diplome.model';
import { Formation } from '../../../models/formation.model';
import { AgentDocument } from '../../../models/agent-document.model';

export interface OnboardingCinRequest {
  numero: string;
  dateDelivrance?: string | null;
  dateExpiration?: string | null;
  lieuDelivrance?: string | null;
}

export interface OnboardingDiplomeRequest {
  dateObtention?: string | null;
  niveau?: string | null;
  etablissement?: string | null;
  specialite?: string | null;
  codePays?: string | null;
  mention?: string | null;
  moyenne?: number | null;
}

export interface OnboardingFormationRequest {
  intituleFormation?: string | null;
  intituleStage?: string | null;
  dateDebut?: string | null;
  dateFin?: string | null;
}

export interface OnboardingDocumentsBundle {
  cin?: AgentDocument | null;
  diplomes: Diplome[];
  formations: Formation[];
}

@Injectable({ providedIn: 'root' })
export class AgentOnboardingService {
  private readonly baseUrl = `${environment.apiUrl}/me/onboarding`;

  constructor(private http: HttpClient) {}

  getMine(): Observable<OnboardingDetail> {
    return this.http.get<OnboardingDetail>(this.baseUrl);
  }

  updateProfile(payload: Partial<AgentCreateRequest>): Observable<OnboardingDetail> {
    return this.http.put<OnboardingDetail>(`${this.baseUrl}/profile`, payload);
  }

  submit(): Observable<OnboardingDetail> {
    return this.http.post<OnboardingDetail>(`${this.baseUrl}/submit`, {});
  }

  // ---- Documents wizard ----

  getMyDocuments(): Observable<OnboardingDocumentsBundle> {
    return this.http.get<OnboardingDocumentsBundle>(`${this.baseUrl}/my-documents`);
  }

  saveCin(payload: OnboardingCinRequest): Observable<AgentDocument> {
    return this.http.post<AgentDocument>(`${this.baseUrl}/cin`, payload);
  }

  uploadCinScan(file: File): Observable<AgentDocument> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<AgentDocument>(`${this.baseUrl}/cin/scan`, fd);
  }

  createDiplome(payload: OnboardingDiplomeRequest): Observable<Diplome> {
    return this.http.post<Diplome>(`${this.baseUrl}/diplomes`, payload);
  }

  updateDiplome(id: number, payload: OnboardingDiplomeRequest): Observable<Diplome> {
    return this.http.put<Diplome>(`${this.baseUrl}/diplomes/${id}`, payload);
  }

  uploadDiplomeScan(id: number, file: File): Observable<Diplome> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<Diplome>(`${this.baseUrl}/diplomes/${id}/scan`, fd);
  }

  deleteDiplome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/diplomes/${id}`);
  }

  createFormation(payload: OnboardingFormationRequest): Observable<Formation> {
    return this.http.post<Formation>(`${this.baseUrl}/formations`, payload);
  }

  updateFormation(id: number, payload: OnboardingFormationRequest): Observable<Formation> {
    return this.http.put<Formation>(`${this.baseUrl}/formations/${id}`, payload);
  }

  uploadFormationCertificate(id: number, file: File): Observable<Formation> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<Formation>(`${this.baseUrl}/formations/${id}/certificate`, fd);
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/formations/${id}`);
  }
}
