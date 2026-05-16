import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Echelon} from '../../../models/Echelon.model';
import {PageResponse} from '../../../models/PageResponse.model';
import {environment} from '../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EchelonService {


  private readonly baseUrl = `${environment.apiUrl}/echelons`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 50, criteria?: any): Observable<PageResponse<Echelon>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    if (criteria) {
      if (criteria.echelleId) params = params.set('echelleId', criteria.echelleId);
      if (criteria.global) params = params.set('global', criteria.global);
    }

    return this.http.get<PageResponse<Echelon>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Echelon> {
    return this.http.get<Echelon>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Echelon>): Observable<Echelon> {
    return this.http.post<Echelon>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Echelon>): Observable<Echelon> {
    return this.http.put<Echelon>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
