import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageResponse } from '../../../../models/PageResponse.model';
import { FamilleProfessionnelle } from '../../../../models/famille-professionnelle.model';
import { environment } from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FamilleProfessionnelleService {


  private baseUrl = 'http://localhost:8080/api/familles-professionnelles';

  constructor(private http: HttpClient) {}

  getPage(page: number, size: number, global?: string): Observable<PageResponse<FamilleProfessionnelle>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (global && global.trim().length) params = params.set('global', global.trim());
    return this.http.get<PageResponse<FamilleProfessionnelle>>(this.baseUrl, { params });
  }

  getAll(global?: string): Observable<FamilleProfessionnelle[]> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1000)
      .set('global', global?.trim() ?? '');
    return this.http.get<PageResponse<FamilleProfessionnelle>>(this.baseUrl, { params }).pipe(
      map(res => res.content)
    );
  }

  getById(id: number): Observable<FamilleProfessionnelle> {
    return this.http.get<FamilleProfessionnelle>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<FamilleProfessionnelle>): Observable<FamilleProfessionnelle> {
    return this.http.post<FamilleProfessionnelle>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<FamilleProfessionnelle>): Observable<FamilleProfessionnelle> {
    return this.http.put<FamilleProfessionnelle>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
