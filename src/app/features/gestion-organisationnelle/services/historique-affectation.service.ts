import { Injectable } from '@angular/core';
import {environment} from '../../../../../environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PageResponse} from '../../../models/PageResponse.model';
import {HistoriqueAffectation} from '../../../models/gestionOrganisationelle/historique-affectation.model';

@Injectable({
  providedIn: 'root'
})
export class HistoriqueAffectationService {

  private baseUrl = `${environment.apiUrl}/historique-affectations`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, global?: string): Observable<PageResponse<HistoriqueAffectation>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<HistoriqueAffectation>>(this.baseUrl, { params });
  }

  create(payload: Partial<HistoriqueAffectation>) {
    return this.http.post<HistoriqueAffectation>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<HistoriqueAffectation>) {
    return this.http.put<HistoriqueAffectation>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getById(id: number) {
    return this.http.get<HistoriqueAffectation>(`${this.baseUrl}/${id}`);
  }

}
