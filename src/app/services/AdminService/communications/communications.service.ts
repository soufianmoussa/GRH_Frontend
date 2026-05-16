import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Communication} from '../../../models/communications.model';
import {PageResponse} from '../../../models/PageResponse.model';
import {environment} from '../../../../../environment.prod';


@Injectable({
  providedIn: 'root'
})
export class CommunicationsService {


  private readonly baseUrl = `${environment.apiUrl}/communications`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 100,global?: string): Observable<PageResponse<Communication>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<Communication>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Communication> {
    return this.http.get<Communication>(`${this.baseUrl}/${id}`);
  }

  add(payload: Partial<Communication>): Observable<Communication> {
    return this.http.post<Communication>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Communication>): Observable<Communication> {
    return this.http.put<Communication>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
