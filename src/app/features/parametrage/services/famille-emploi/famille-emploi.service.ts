import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FamilleEmploi} from '../../../../models/fammile-et-emploi.model';
import {PageResponse} from '../../../../models/PageResponse.model';
import {environment} from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FamilleEmploiService {



  private baseUrl = 'http://localhost:8080/api/familles-emploi';

  constructor(private http: HttpClient) {}

  getPage(page: number, size: number, global?: string): Observable<PageResponse<FamilleEmploi>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (global && global.trim().length) params = params.set('global', global.trim());
    return this.http.get<PageResponse<FamilleEmploi>>(this.baseUrl, { params });
  }

  getAll(global?: string): Observable<FamilleEmploi[]> {

    const params = new HttpParams().set('page', 0).set('size', 1000).set('global', global?.trim() ?? '');
    return this.http.get<PageResponse<FamilleEmploi>>(this.baseUrl, { params }) as any;
  }

  getById(id: number): Observable<FamilleEmploi> {
    return this.http.get<FamilleEmploi>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<FamilleEmploi>): Observable<FamilleEmploi> {
    return this.http.post<FamilleEmploi>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<FamilleEmploi>): Observable<FamilleEmploi> {
    return this.http.put<FamilleEmploi>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
