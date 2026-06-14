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
  TransferAffectationRequest,
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

  /** Historique des affectations d'un agent (la plus récente / active en tête côté backend). */
  getByAgent(agentId: number): Observable<AffectationAgentPosteDto[]> {
    return this.http.get<AffectationAgentPosteDto[]>(`${this.baseUrl}/agent/${agentId}`);
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

  /** Transfert atomique d'un agent vers un autre poste (clôture + nouvelle affectation côté backend). */
  transfer(payload: TransferAffectationRequest): Observable<AffectationAgentPosteDto> {
    return this.http.post<AffectationAgentPosteDto>(`${this.baseUrl}/transfer`, payload);
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

  /** Exporte l'historique des affectations (xlsx) en réutilisant les filtres serveur. */
  exportExcel(filters: {
    global?: string;
    statut?: string;
    posteLibelle?: string;
    agentNom?: string;
    dateDebutFrom?: string;
    dateDebutTo?: string;
  } = {}): Observable<Blob> {
    let params = new HttpParams();
    if (filters.global && filters.global.trim().length) params = params.set('global', filters.global.trim());
    if (filters.statut && filters.statut.trim().length) params = params.set('statut', filters.statut.trim());
    if (filters.posteLibelle && filters.posteLibelle.trim().length) params = params.set('posteLibelle', filters.posteLibelle.trim());
    if (filters.agentNom && filters.agentNom.trim().length) params = params.set('agentNom', filters.agentNom.trim());
    if (filters.dateDebutFrom) params = params.set('dateDebutFrom', filters.dateDebutFrom);
    if (filters.dateDebutTo) params = params.set('dateDebutTo', filters.dateDebutTo);

    return this.http.get(`${this.baseUrl}/export`, { params, responseType: 'blob' });
  }


  getPostes(): Observable<PosteOption[]> {
    return this.http.get<PosteOption[]>(`${this.baseUrl}/available-postes`);
  }

  getAgents(): Observable<AgentOption[]> {
    return this.http.get<AgentOption[]>(`${this.baseUrl}/available-agents`);
  }
}
