import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DemandeConge, PageResponse} from '../../../../models/demandes.model';
import {environment} from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class DemandesCongeService {



  private readonly baseUrl = `${environment.apiUrl}/demandes-conges`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, global?: string): Observable<PageResponse<DemandeConge>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<DemandeConge>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<DemandeConge> {
    return this.http.get<DemandeConge>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<DemandeConge>): Observable<DemandeConge> {
    return this.http.post<DemandeConge>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<DemandeConge>): Observable<DemandeConge> {
    return this.http.put<DemandeConge>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
