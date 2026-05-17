import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormationInitiale, FormationInitialeCreateUpdateRequest } from '../../models/diplomes/formation-initiale.model';
import { PageResponse } from '../../../../models/PageResponse.model';
import { environment } from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class FormationInitialeService {

  private readonly baseUrl = `${environment.apiUrl}/formations-initiales`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, globalSearch?: string): Observable<PageResponse<FormationInitiale>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (globalSearch && globalSearch.trim().length) {
      params = params.set('global', globalSearch.trim());
    }

    return this.http.get<PageResponse<FormationInitiale>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<FormationInitiale> {
    return this.http.get<FormationInitiale>(`${this.baseUrl}/${id}`);
  }

  add(payload: FormationInitialeCreateUpdateRequest): Observable<FormationInitiale> {
    return this.http.post<FormationInitiale>(this.baseUrl, payload);
  }

  update(id: number, payload: FormationInitialeCreateUpdateRequest): Observable<FormationInitiale> {
    return this.http.put<FormationInitiale>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
