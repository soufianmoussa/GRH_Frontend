import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment.prod';
import {
  AdjustSoldeRequest,
  AgentSoldeSummary,
  HistoriqueSoldeConge,
  InitializeSoldeRequest,
  LeaveType,
  SoldeConge,
  SoldeCongeCreateUpdateRequest,
  SoldeInitializationResult
} from '../../../models/soldeConge.model';

@Injectable({ providedIn: 'root' })
export class SoldeCongeService {

  private readonly baseUrl = `${environment.apiUrl}/soldes-conges`;

  constructor(private http: HttpClient) {}

  getSummary(annee?: number, search?: string, uniteId?: number | null): Observable<AgentSoldeSummary[]> {
    let params = new HttpParams();
    if (annee != null) params = params.set('annee', annee);
    if (search && search.trim().length) params = params.set('search', search.trim());
    if (uniteId != null) params = params.set('uniteId', uniteId);
    return this.http.get<AgentSoldeSummary[]>(`${this.baseUrl}/summary`, { params });
  }

  getById(id: number): Observable<SoldeConge> {
    return this.http.get<SoldeConge>(`${this.baseUrl}/${id}`);
  }

  getByAgent(agentId: number): Observable<SoldeConge[]> {
    return this.http.get<SoldeConge[]>(`${this.baseUrl}/agent/${agentId}`);
  }

  getByAgentAndYear(agentId: number, annee: number): Observable<SoldeConge[]> {
    return this.http.get<SoldeConge[]>(`${this.baseUrl}/agent/${agentId}/year/${annee}`);
  }

  getByAgentYearType(agentId: number, annee: number, typeConge: LeaveType): Observable<SoldeConge> {
    return this.http.get<SoldeConge>(`${this.baseUrl}/agent/${agentId}/year/${annee}/type/${typeConge}`);
  }

  create(payload: SoldeCongeCreateUpdateRequest): Observable<SoldeConge> {
    return this.http.post<SoldeConge>(this.baseUrl, payload);
  }

  update(id: number, payload: SoldeCongeCreateUpdateRequest): Observable<SoldeConge> {
    return this.http.put<SoldeConge>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  initialize(payload: InitializeSoldeRequest): Observable<SoldeConge> {
    return this.http.post<SoldeConge>(`${this.baseUrl}/initialize`, payload);
  }

  /**
   * Ré-initialise les soldes de tous les agents pour l'année donnée.
   * Si {@code force=true}, les jours de base existants sont recalés ;
   * sinon seuls les soldes manquants sont créés.
   */
  initializeAll(annee: number, force = true): Observable<SoldeInitializationResult> {
    let params = new HttpParams()
      .set('annee', annee)
      .set('force', force);
    return this.http.post<SoldeInitializationResult>(`${this.baseUrl}/initialize-all`, null, { params });
  }

  /**
   * Ré-initialise les soldes d'un seul agent pour l'année donnée.
   */
  initializeForAgent(agentId: number, annee: number, force = true): Observable<SoldeInitializationResult> {
    const params = new HttpParams()
      .set('annee', annee)
      .set('force', force);
    return this.http.post<SoldeInitializationResult>(
      `${this.baseUrl}/initialize-agent/${agentId}`, null, { params });
  }

  adjust(payload: AdjustSoldeRequest): Observable<SoldeConge> {
    return this.http.post<SoldeConge>(`${this.baseUrl}/adjust`, payload);
  }

  getHistoryByAgent(agentId: number, annee?: number): Observable<HistoriqueSoldeConge[]> {
    let params = new HttpParams();
    if (annee != null) params = params.set('annee', annee);
    return this.http.get<HistoriqueSoldeConge[]>(`${this.baseUrl}/agent/${agentId}/history`, { params });
  }
}
