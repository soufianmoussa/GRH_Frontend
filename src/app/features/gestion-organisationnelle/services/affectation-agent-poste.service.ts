import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageResponse } from '../../../models/PageResponse.model';
import { environment } from '../../../../../environment';
import { map } from 'rxjs/operators';
import {
  AffectationAgentPosteDto,
  AffectationAgentPosteCreateRequest,
  AffectationAgentPosteUpdateRequest,
  PosteOption
} from '../../../models/gestionOrganisationelle/affectation-agent-poste.model';
import { AgentOption } from '../../../models/gestionOrganisationelle/responsable-unite.model';

@Injectable({
  providedIn: 'root'
})
export class AffectationAgentPosteService {

  private readonly baseUrl = `${environment.apiUrl}/affectations-agent-poste`;

  constructor(private http: HttpClient) { }

  getAll(page: number, size: number, global?: string): Observable<PageResponse<AffectationAgentPosteDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<AffectationAgentPosteDto>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<AffectationAgentPosteDto> {
    return this.http.get<AffectationAgentPosteDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: AffectationAgentPosteCreateRequest): Observable<AffectationAgentPosteDto> {
    return this.http.post<AffectationAgentPosteDto>(this.baseUrl, payload);
  }

  update(id: number, payload: AffectationAgentPosteUpdateRequest): Observable<AffectationAgentPosteDto> {
    return this.http.put<AffectationAgentPosteDto>(`${this.baseUrl}/${id}`, payload);
  }

  close(id: number, payload: { dateFin: string; motif?: string | null }): Observable<AffectationAgentPosteDto> {
    return this.http.patch<AffectationAgentPosteDto>(`${this.baseUrl}/${id}/close`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAllFiltered(page: number, size: number, filters: {
    global?: string;
    statut?: string;
    posteLibelle?: string;
    agentNom?: string;
    dateDebutFrom?: string;
    dateDebutTo?: string;
  }): Observable<PageResponse<AffectationAgentPosteDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (filters.global && filters.global.trim().length) {
      params = params.set('global', filters.global.trim());
    }
    if (filters.statut && filters.statut.trim().length) {
      params = params.set('statut', filters.statut.trim());
    }
    if (filters.posteLibelle && filters.posteLibelle.trim().length) {
      params = params.set('posteLibelle', filters.posteLibelle.trim());
    }
    if (filters.agentNom && filters.agentNom.trim().length) {
      params = params.set('agentNom', filters.agentNom.trim());
    }
    if (filters.dateDebutFrom) {
      params = params.set('dateDebutFrom', filters.dateDebutFrom);
    }
    if (filters.dateDebutTo) {
      params = params.set('dateDebutTo', filters.dateDebutTo);
    }

    return this.http.get<PageResponse<AffectationAgentPosteDto>>(this.baseUrl, { params });
  }

  getByPoste(posteId: number): Observable<AffectationAgentPosteDto[]> {
    return this.http.get<AffectationAgentPosteDto[]>(`${this.baseUrl}/poste/${posteId}`);
  }

  getStats(): Observable<{ total: number; active: number; cloturee: number }> {
    return this.http.get<{ total: number; active: number; cloturee: number }>(`${this.baseUrl}/stats`);
  }


  getPostes(): Observable<PosteOption[]> {
    return this.http.get<PosteOption[]>(`${this.baseUrl}/available-postes`);
  }

  getAgents(): Observable<AgentOption[]> {
    return this.http.get<AgentOption[]>(`${this.baseUrl}/available-agents`);
  }
}
