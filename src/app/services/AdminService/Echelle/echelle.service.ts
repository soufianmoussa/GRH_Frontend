import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Echelle} from '../../../models/Echelle.model';
import {PageResponse} from '../../../models/PageResponse.model';
import {environment} from '../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EchelleService {


  private readonly baseUrl = `${environment.apiUrl}/echelles`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 50): Observable<PageResponse<Echelle>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    return this.http.get<PageResponse<Echelle>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Echelle> {
    return this.http.get<Echelle>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Echelle>): Observable<Echelle> {
    return this.http.post<Echelle>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Echelle>): Observable<Echelle> {
    return this.http.put<Echelle>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
