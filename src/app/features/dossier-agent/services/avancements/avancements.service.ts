import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Avancement} from '../../../../models/avancements.model';
import {PageResponse} from '../../../../models/PageResponse.model';
import {environment} from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AvancementsService {


  private readonly baseUrl = `${environment.apiUrl}/avancements`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, global?: string): Observable<PageResponse<Avancement>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<Avancement>>(this.baseUrl, { params });
  }

  getMine(page = 0, size = 10): Observable<PageResponse<Avancement>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    return this.http.get<PageResponse<Avancement>>(`${this.baseUrl}/me`, { params });
  }



  getById(id: number): Observable<Avancement> {
    return this.http.get<Avancement>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Avancement>): Observable<Avancement> {
    return this.http.post<Avancement>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Avancement>): Observable<Avancement> {
    return this.http.put<Avancement>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
