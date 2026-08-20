import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MesCompetences } from '../../../../models/mesCompetences.model';
import { PageResponse } from '../../../../models/PageResponse.model';
import { environment } from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class MesCompetencesService {

  private readonly baseUrl = `${environment.apiUrl}/mes-competences`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 200): Observable<PageResponse<MesCompetences>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<MesCompetences>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<MesCompetences> {
    return this.http.get<MesCompetences>(`${this.baseUrl}/${id}`);
  }

  add(payload: Partial<MesCompetences>): Observable<MesCompetences> {
    return this.http.post<MesCompetences>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<MesCompetences>): Observable<MesCompetences> {
    return this.http.put<MesCompetences>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
