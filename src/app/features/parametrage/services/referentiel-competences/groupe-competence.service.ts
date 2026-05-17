import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GroupeCompetence} from '../../../../models/ReferentielCompetences.model';
import {PageResponse} from '../../../../models/PageResponse.model';
import {environment} from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class GroupeCompetenceService {


  private readonly baseUrl = `${environment.apiUrl}/groupes-competences`;


  constructor(private http: HttpClient) {}












  getAll(page = 0, size = 10, global?: string): Observable<PageResponse<GroupeCompetence>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,asc');

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<GroupeCompetence>>(this.baseUrl, { params });
  }




  getById(id: number): Observable<GroupeCompetence> {
    return this.http.get<GroupeCompetence>(`${this.baseUrl}/${id}`);
  }




  create(payload: Partial<GroupeCompetence>): Observable<GroupeCompetence> {
    return this.http.post<GroupeCompetence>(this.baseUrl, payload);
  }




  update(id: number, payload: Partial<GroupeCompetence>): Observable<GroupeCompetence> {
    return this.http.put<GroupeCompetence>(`${this.baseUrl}/${id}`, payload);
  }




  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
