import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Anciennete} from '../../../models/anciennete.model';
import {PageResponse} from '../../../models/PageResponse.model';
import {environment} from '../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AncienneteService {


  private readonly baseUrl = `${environment.apiUrl}/anciennetes`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20,global?:string): Observable<PageResponse<Anciennete>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,desc');

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<Anciennete>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Anciennete> {
    return this.http.get<Anciennete>(`${this.baseUrl}/${id}`);
  }

  add(payload: Partial<Anciennete>): Observable<Anciennete> {
    return this.http.post<Anciennete>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Anciennete>): Observable<Anciennete> {
    return this.http.put<Anciennete>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
