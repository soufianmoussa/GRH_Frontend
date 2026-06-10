import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environment';
import { PageResponse } from '../../../models/PageResponse.model';
import {
  AuditCenterStats,
  HistoriqueAffectationDto,
  HistoriqueAffectationFilters,
  HistoriqueAffectationTimelineDto
} from '../../../models/gestionOrganisationelle/historique-affectation.model';

@Injectable({ providedIn: 'root' })
export class HistoriqueAffectationService {

  private readonly baseUrl = `${environment.apiUrl}/historique-affectations`;

  constructor(private http: HttpClient) {}

  search(page: number, size: number, filters: HistoriqueAffectationFilters = {}): Observable<PageResponse<HistoriqueAffectationDto>> {
    const params = this.buildParams(filters)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<HistoriqueAffectationDto>>(this.baseUrl, { params });
  }

  getStats(filters: HistoriqueAffectationFilters = {}): Observable<AuditCenterStats> {
    const params = this.buildParams(filters);
    return this.http.get<AuditCenterStats>(`${this.baseUrl}/stats`, { params });
  }

  getAgentTimeline(agentId: number): Observable<HistoriqueAffectationTimelineDto[]> {
    return this.http.get<HistoriqueAffectationTimelineDto[]>(`${this.baseUrl}/agent/${agentId}/timeline`);
  }

  exportExcel(filters: HistoriqueAffectationFilters = {}): Observable<Blob> {
    const params = this.buildParams(filters);
    return this.http.get(`${this.baseUrl}/export`, { params, responseType: 'blob' });
  }

  private buildParams(filters: HistoriqueAffectationFilters): HttpParams {
    let params = new HttpParams();
    const append = (key: string, value: unknown) => {
      if (value === undefined || value === null) return;
      const str = typeof value === 'string' ? value.trim() : String(value);
      if (!str.length) return;
      params = params.set(key, str);
    };

    append('global', filters.global);
    append('agentId', filters.agentId);
    append('matricule', filters.matricule);
    append('uniteId', filters.uniteId);
    append('posteId', filters.posteId);
    append('type', filters.type);
    append('statut', filters.statut);
    append('performedBy', filters.performedBy);
    append('dateEffetFrom', filters.dateEffetFrom);
    append('dateEffetTo', filters.dateEffetTo);

    return params;
  }
}
