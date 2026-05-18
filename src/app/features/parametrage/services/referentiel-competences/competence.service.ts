import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Competence} from '../../../../models/ReferentielCompetences.model';
import {PageResponse} from '../../../../models/PageResponse.model';
import {environment} from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {

  private readonly baseUrl = `${environment.apiUrl}/competences`;

  constructor(private http: HttpClient) {}

  getAllByGroupe2(
    page = 0,
    size = 10,
    filters?: { competence?: string; description?: string }
  ): Observable<PageResponse<Competence>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');


    if (filters?.competence?.trim()) {
      params = params.set('competence', filters.competence.trim());
    }
    if (filters?.description?.trim()) {
      params = params.set('description', filters.description.trim());
    }

    return this.http.get<PageResponse<Competence>>(this.baseUrl, { params });
  }


  getAllByGroupe(
    groupeId: number,
    page = 0,
    size = 10,
    filters?: { competence?: string; description?: string }
  ): Observable<PageResponse<Competence>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc')
      .set('groupeId', groupeId);


    if (filters?.competence?.trim()) {
      params = params.set('competence', filters.competence.trim());
    }
    if (filters?.description?.trim()) {
      params = params.set('description', filters.description.trim());
    }

    return this.http.get<PageResponse<Competence>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Competence> {
    return this.http.get<Competence>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Competence>): Observable<Competence> {
    return this.http.post<Competence>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Competence>): Observable<Competence> {
    return this.http.put<Competence>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
