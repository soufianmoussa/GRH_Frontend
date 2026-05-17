import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Etablissement, EtablissementCreateUpdateRequest } from '../../models/diplomes/etablissement.model';
import { PageResponse } from '../../../../models/PageResponse.model';
import { environment } from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EtablissementService {

  private readonly baseUrl = `${environment.apiUrl}/etablissements`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, globalSearch?: string): Observable<PageResponse<Etablissement>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (globalSearch && globalSearch.trim().length) {
      params = params.set('global', globalSearch.trim());
    }

    return this.http.get<PageResponse<Etablissement>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Etablissement> {
    return this.http.get<Etablissement>(`${this.baseUrl}/${id}`);
  }

  add(payload: EtablissementCreateUpdateRequest): Observable<Etablissement> {
    return this.http.post<Etablissement>(this.baseUrl, payload);
  }

  update(id: number, payload: EtablissementCreateUpdateRequest): Observable<Etablissement> {
    return this.http.put<Etablissement>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
