import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Fonction} from '../../../models/gestionOrganisationelle/fonction.model';
import {PageResponse} from '../../../models/PageResponse.model';
import {environment} from '../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FonctionService {


  private readonly baseUrl = `${environment.apiUrl}/fonctions`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, global?: string): Observable<PageResponse<Fonction>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<Fonction>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Fonction> {
    return this.http.get<Fonction>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Fonction>): Observable<Fonction> {
    return this.http.post<Fonction>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Fonction>): Observable<Fonction> {
    return this.http.put<Fonction>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPostesByFonction(fonctionId: number): Observable<PageResponse<any>> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1000)
      .set('fonctionId', fonctionId);

    return this.http.get<PageResponse<any>>(
      `${environment.apiUrl}/gestion-organisationelle/postes`,
      { params }
    );
  }
}
