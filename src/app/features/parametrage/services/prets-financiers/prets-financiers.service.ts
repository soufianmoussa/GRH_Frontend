import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PretFinancier} from '../../../../models/prets-financiers.model';
import {PageResponse} from '../../../../models/PageResponse.model';
import {environment} from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PretsFinanciersService {


  private readonly baseUrl = `${environment.apiUrl}/prets-financiers`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 200,global? : string): Observable<PageResponse<PretFinancier>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    if (global && global.trim().length) {
      params = params.set('matricule', global.trim());
    }


    return this.http.get<PageResponse<PretFinancier>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<PretFinancier> {
    return this.http.get<PretFinancier>(`${this.baseUrl}/${id}`);
  }

  add(payload: Partial<PretFinancier>): Observable<PretFinancier> {
    return this.http.post<PretFinancier>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<PretFinancier>): Observable<PretFinancier> {
    return this.http.put<PretFinancier>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }


}
