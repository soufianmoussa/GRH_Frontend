import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NiveauDiplome, NiveauDiplomeCreateUpdateRequest } from '../../../models/diplomes/niveau-diplome.model';
import { PageResponse } from '../../../models/PageResponse.model';
import { environment } from '../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class NiveauDiplomeService {

  private readonly baseUrl = `${environment.apiUrl}/niveaux-diplome`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, globalSearch?: string): Observable<PageResponse<NiveauDiplome>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (globalSearch && globalSearch.trim().length) {
      params = params.set('global', globalSearch.trim());
    }

    return this.http.get<PageResponse<NiveauDiplome>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<NiveauDiplome> {
    return this.http.get<NiveauDiplome>(`${this.baseUrl}/${id}`);
  }

  add(payload: NiveauDiplomeCreateUpdateRequest): Observable<NiveauDiplome> {
    return this.http.post<NiveauDiplome>(this.baseUrl, payload);
  }

  update(id: number, payload: NiveauDiplomeCreateUpdateRequest): Observable<NiveauDiplome> {
    return this.http.put<NiveauDiplome>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
