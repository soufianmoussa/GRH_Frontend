import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TypeEtablissement, TypeEtablissementCreateUpdateRequest } from '../../models/diplomes/type-etablissement.model';
import { PageResponse } from '../../../../models/PageResponse.model';
import { environment } from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TypeEtablissementService {

  private readonly baseUrl = `${environment.apiUrl}/types-etablissement`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, globalSearch?: string): Observable<PageResponse<TypeEtablissement>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (globalSearch && globalSearch.trim().length) {
      params = params.set('global', globalSearch.trim());
    }

    return this.http.get<PageResponse<TypeEtablissement>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<TypeEtablissement> {
    return this.http.get<TypeEtablissement>(`${this.baseUrl}/${id}`);
  }

  add(payload: TypeEtablissementCreateUpdateRequest): Observable<TypeEtablissement> {
    return this.http.post<TypeEtablissement>(this.baseUrl, payload);
  }

  update(id: number, payload: TypeEtablissementCreateUpdateRequest): Observable<TypeEtablissement> {
    return this.http.put<TypeEtablissement>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
