import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SituationActuelle } from '../../../../models/situationActuelle.model';
import { PageResponse } from '../../../../models/PageResponse.model';
import { environment } from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class SituationActuelleService {

  private readonly baseUrl = `${environment.apiUrl}/situation-actuelle`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 200): Observable<PageResponse<SituationActuelle>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<SituationActuelle>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<SituationActuelle> {
    return this.http.get<SituationActuelle>(`${this.baseUrl}/${id}`);
  }

  add(payload: Partial<SituationActuelle>): Observable<SituationActuelle> {
    return this.http.post<SituationActuelle>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<SituationActuelle>): Observable<SituationActuelle> {
    return this.http.put<SituationActuelle>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
