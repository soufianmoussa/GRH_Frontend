import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';


import { UniteStructurelle, UniteStructurelleCreateUpdateRequest } from '../../../models/gestionOrganisationelle/unite-structurelle.model';
import { TypeUniteStructurelle } from '../../../enums/type-unite-structurelle.enum';

import { PageResponse } from '../../../models/PageResponse.model';
import { environment } from '../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UniteStructurelleService {

  private readonly baseUrl = `${environment.apiUrl}/gestion-organisationelle/unites-structurelles`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, type?: TypeUniteStructurelle, globalSearch?: string, parentId?: number): Observable<PageResponse<UniteStructurelle>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (type) {
      params = params.set('type', type);
    }

    if (globalSearch && globalSearch.trim().length) {
      params = params.set('global', globalSearch.trim());
    }

    if (parentId) {
      params = params.set('parentId', parentId);
    }

    return this.http.get<PageResponse<UniteStructurelle>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<UniteStructurelle> {
    return this.http.get<UniteStructurelle>(`${this.baseUrl}/${id}`);
  }

  add(payload: UniteStructurelleCreateUpdateRequest): Observable<UniteStructurelle> {
    return this.http.post<UniteStructurelle>(this.baseUrl, payload);
  }

  update(id: number, payload: UniteStructurelleCreateUpdateRequest): Observable<UniteStructurelle> {
    return this.http.put<UniteStructurelle>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
