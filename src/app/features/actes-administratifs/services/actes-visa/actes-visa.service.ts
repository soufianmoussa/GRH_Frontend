import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ActeVisa} from '../../../../models/actesVisa.model';
import {PageResponse} from '../../../../models/PageResponse.model';
import {environment} from '../../../../../../environment.prod';


@Injectable({
  providedIn: 'root'
})
export class ActesVisaService {


  private readonly baseUrl = `${environment.apiUrl}/actes-visa`;


  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 200): Observable<PageResponse<ActeVisa>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ActeVisa>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ActeVisa> {
    return this.http.get<ActeVisa>(`${this.baseUrl}/${id}`);
  }

  add(payload: Partial<ActeVisa>): Observable<ActeVisa> {
    return this.http.post<ActeVisa>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<ActeVisa>): Observable<ActeVisa> {
    return this.http.put<ActeVisa>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
