import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../../../models/PageResponse.model';
import { Poste } from '../../../models/gestionOrganisationelle/poste.model';
import { environment } from '../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class PosteService {


  private readonly baseUrl = `${environment.apiUrl}/gestion-organisationelle/postes`;

  constructor(private http: HttpClient) { }

  getAll(page: number, size: number, global?: string): Observable<PageResponse<Poste>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<Poste>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Poste> {
    return this.http.get<Poste>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Poste>): Observable<Poste> {
    return this.http.post<Poste>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Poste>): Observable<Poste> {
    return this.http.put<Poste>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAllNoPagination(): Observable<Poste[]> {
    return this.http.get<Poste[]>(`${this.baseUrl}/all`);
  }

  /** Archive (soft-delete) le poste. */
  archive(id: number): Observable<Poste> {
    return this.http.patch<Poste>(`${this.baseUrl}/${id}/archive`, {});
  }

  /** Réactive un poste archivé. */
  restore(id: number): Observable<Poste> {
    return this.http.patch<Poste>(`${this.baseUrl}/${id}/restore`, {});
  }
}
