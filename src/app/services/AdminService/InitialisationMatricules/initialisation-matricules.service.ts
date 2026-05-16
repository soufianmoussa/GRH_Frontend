import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Matricule } from '../../../models/initialisation-matricules.model';
import { PageResponse } from '../../../models/PageResponse.model';
import { environment } from '../../../../../environment.prod';


@Injectable({
  providedIn: 'root'
})
export class InitialisationMatriculesService {

  private readonly baseUrl = `${environment.apiUrl}/matricules`;

  constructor(private http: HttpClient) { }


  getAll(page = 0, size = 100, criteria?: any): Observable<PageResponse<Matricule>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (criteria) {
      Object.keys(criteria).forEach(key => {
        if (criteria[key] !== null && criteria[key] !== undefined && criteria[key] !== '') {
          params = params.set(key, criteria[key]);
        }
      });
    }

    return this.http.get<PageResponse<Matricule>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Matricule> {
    return this.http.get<Matricule>(`${this.baseUrl}/${id}`);
  }

  add(payload: Partial<Matricule>): Observable<Matricule> {
    return this.http.post<Matricule>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Matricule>): Observable<Matricule> {
    return this.http.put<Matricule>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
