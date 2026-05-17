import { Injectable } from '@angular/core';
import {DemandeAttestation, PageResponse} from '../../../../models/demandes.model';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class DemandesAttestationService {



  private readonly baseUrl = `${environment.apiUrl}/demandes-attestations`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, global?: string): Observable<PageResponse<DemandeAttestation>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<DemandeAttestation>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<DemandeAttestation> {
    return this.http.get<DemandeAttestation>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<DemandeAttestation>): Observable<DemandeAttestation> {
    return this.http.post<DemandeAttestation>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<DemandeAttestation>): Observable<DemandeAttestation> {
    return this.http.put<DemandeAttestation>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
