import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../../../../models/PageResponse.model';
import { SousFamille } from '../../../../models/famille-professionnelle.model';
import { environment } from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class SousFamilleService {


  private baseUrl = `${environment.apiUrl}/sous-familles`;

  constructor(private http: HttpClient) {}

  getPage(page: number, size: number, familleProfessionnelleId?: number | null, global?: string): Observable<PageResponse<SousFamille>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (global && global.trim().length) params = params.set('global', global.trim());
    if (familleProfessionnelleId) params = params.set('familleProfessionnelleId', familleProfessionnelleId);
    return this.http.get<PageResponse<SousFamille>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<SousFamille> {
    return this.http.get<SousFamille>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<SousFamille>): Observable<SousFamille> {
    return this.http.post<SousFamille>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<SousFamille>): Observable<SousFamille> {
    return this.http.put<SousFamille>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
