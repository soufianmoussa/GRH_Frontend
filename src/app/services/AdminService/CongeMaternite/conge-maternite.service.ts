import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CongeMaternite} from '../../../models/congeMaternite.model';
import {PageResponse} from '../../../models/PageResponse.model';
import {environment} from '../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CongeMaterniteService {



  private readonly baseUrl = `${environment.apiUrl}/conges-maternite`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, global?: string): Observable<PageResponse<CongeMaternite>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<CongeMaternite>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<CongeMaternite> {
    return this.http.get<CongeMaternite>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<CongeMaternite>): Observable<CongeMaternite> {
    return this.http.post<CongeMaternite>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<CongeMaternite>): Observable<CongeMaternite> {
    return this.http.put<CongeMaternite>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
