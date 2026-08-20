import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { DemandeModificationDto, TypeModification } from '../../../models/demande-modification.model';
import { AdresseDto, CoordonneesProfessionnellesDto } from '../../../models/agent-full.model';

@Injectable({ providedIn: 'root' })
export class DemandeModificationService {

  private readonly apiBase = `${environment.apiUrl}/demandes-modifications`;
  private readonly apiAgents = `${environment.apiUrl}/agents`;

  constructor(private http: HttpClient) {}

  // ── Agent: submit a change request with file ──────────────────────────
  submit(type: TypeModification, payload: string, file: File): Observable<DemandeModificationDto> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('payload', payload);
    formData.append('file', file);
    return this.http.post<DemandeModificationDto>(this.apiBase, formData);
  }

  // ── Agent: my requests ────────────────────────────────────────────────
  myRequests(): Observable<DemandeModificationDto[]> {
    return this.http.get<DemandeModificationDto[]>(`${this.apiBase}/me`);
  }

  // ── Admin: pending requests ───────────────────────────────────────────
  pending(): Observable<DemandeModificationDto[]> {
    return this.http.get<DemandeModificationDto[]>(`${this.apiBase}/pending`);
  }

  // ── Admin: all requests ───────────────────────────────────────────────
  all(): Observable<DemandeModificationDto[]> {
    return this.http.get<DemandeModificationDto[]>(`${this.apiBase}`);
  }

  // ── Admin: get one ────────────────────────────────────────────────────
  getById(id: number): Observable<DemandeModificationDto> {
    return this.http.get<DemandeModificationDto>(`${this.apiBase}/${id}`);
  }

  // ── Admin: relancer la verification OCR du justificatif ───────────────
  verify(id: number): Observable<DemandeModificationDto> {
    return this.http.post<DemandeModificationDto>(`${this.apiBase}/${id}/verify`, {});
  }

  // ── Admin: approve ────────────────────────────────────────────────────
  approve(id: number, commentaire?: string): Observable<DemandeModificationDto> {
    return this.http.put<DemandeModificationDto>(`${this.apiBase}/${id}/approve`, { commentaire });
  }

  // ── Admin: reject ─────────────────────────────────────────────────────
  reject(id: number, commentaire?: string): Observable<DemandeModificationDto> {
    return this.http.put<DemandeModificationDto>(`${this.apiBase}/${id}/reject`, { commentaire });
  }

  // ── Agent self-edit: adresses (direct, no approval) ───────────────────
  updateMyAdresses(adresses: AdresseDto[]): Observable<AdresseDto[]> {
    return this.http.put<AdresseDto[]>(`${this.apiAgents}/me/adresses`, adresses);
  }

  // ── Agent self-edit: coordonnees professionnelles (direct) ────────────
  updateMyCoordonneesPro(dto: CoordonneesProfessionnellesDto): Observable<CoordonneesProfessionnellesDto> {
    return this.http.put<CoordonneesProfessionnellesDto>(`${this.apiAgents}/me/coordonnees-professionnelles`, dto);
  }
}
