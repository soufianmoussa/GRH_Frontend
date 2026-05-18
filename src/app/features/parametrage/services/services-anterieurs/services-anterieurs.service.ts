import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ServiceAnterieur} from '../../../../models/services-anterieurs.model';
import {PageResponse} from '../../../../models/PageResponse.model';
import {environment} from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ServicesAnterieursService {


  private readonly baseUrl = `${environment.apiUrl}/services-anterieurs`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, global?: string): Observable<PageResponse<ServiceAnterieur>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    if (global && global.trim().length) {
      params = params.set('matricule', global.trim());
    }

    return this.http.get<PageResponse<ServiceAnterieur>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ServiceAnterieur> {
    return this.http.get<ServiceAnterieur>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<ServiceAnterieur>): Observable<ServiceAnterieur> {
    return this.http.post<ServiceAnterieur>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<ServiceAnterieur>): Observable<ServiceAnterieur> {
    return this.http.put<ServiceAnterieur>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
