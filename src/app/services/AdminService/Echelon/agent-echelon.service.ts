import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AgentEchelon} from '../../../models/AgentEchelon.model';
import {PageResponse} from '../../../models/PageResponse.model';
import {environment} from '../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AgentEchelonService {

  private readonly baseUrl = `${environment.apiUrl}/agent-echelons`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 50, criteria?: any): Observable<PageResponse<AgentEchelon>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    if (criteria) {
      if (criteria.matricule) params = params.set('matricule', criteria.matricule);
      if (criteria.echelonId) params = params.set('echelonId', criteria.echelonId);
      if (criteria.global) params = params.set('global', criteria.global);
    }

    return this.http.get<PageResponse<AgentEchelon>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<AgentEchelon> {
    return this.http.get<AgentEchelon>(`${this.baseUrl}/${id}`);
  }

  create(payload: any): Observable<AgentEchelon> {
    return this.http.post<AgentEchelon>(this.baseUrl, payload);
  }

  update(id: number, payload: any): Observable<AgentEchelon> {
    return this.http.put<AgentEchelon>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
