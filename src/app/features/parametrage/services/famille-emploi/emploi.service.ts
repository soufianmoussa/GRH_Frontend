import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PageResponse} from '../../../../models/PageResponse.model';
import {Emploi} from '../../../../models/fammile-et-emploi.model';
import {environment} from '../../../../../../environment';


@Injectable({
  providedIn: 'root'
})
export class EmploiService {




  private baseUrl = `${environment.apiUrl}/emplois`;

  constructor(private http: HttpClient) {}

  getPage(page: number, size: number, familleEmploiId?: number | null, global?: string): Observable<PageResponse<Emploi>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (global && global.trim().length) params = params.set('global', global.trim());
    if (familleEmploiId) params = params.set('familleEmploiId', familleEmploiId);
    return this.http.get<PageResponse<Emploi>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Emploi> {
    return this.http.get<Emploi>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Emploi>): Observable<Emploi> {
    return this.http.post<Emploi>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Emploi>): Observable<Emploi> {
    return this.http.put<Emploi>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
