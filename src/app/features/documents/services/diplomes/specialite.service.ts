import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Specialite, SpecialiteCreateUpdateRequest } from '../../models/diplomes/specialite.model';
import { PageResponse } from '../../../../models/PageResponse.model';
import { environment } from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class SpecialiteService {

  private readonly baseUrl = `${environment.apiUrl}/specialites`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, globalSearch?: string): Observable<PageResponse<Specialite>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (globalSearch && globalSearch.trim().length) {
      params = params.set('global', globalSearch.trim());
    }

    return this.http.get<PageResponse<Specialite>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Specialite> {
    return this.http.get<Specialite>(`${this.baseUrl}/${id}`);
  }

  add(payload: SpecialiteCreateUpdateRequest): Observable<Specialite> {
    return this.http.post<Specialite>(this.baseUrl, payload);
  }

  update(id: number, payload: SpecialiteCreateUpdateRequest): Observable<Specialite> {
    return this.http.put<Specialite>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
