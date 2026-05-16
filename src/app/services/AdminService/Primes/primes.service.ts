import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Prime} from '../../../models/primes.model';
import {PageResponse} from '../../../models/PageResponse.model';
import {environment} from '../../../../../environment.prod';


@Injectable({
  providedIn: 'root'
})
export class PrimesService {


  private readonly baseUrl = `${environment.apiUrl}/primes`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 200): Observable<PageResponse<Prime>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Prime>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Prime> {
    return this.http.get<Prime>(`${this.baseUrl}/${id}`);
  }

  add(payload: Partial<Prime>): Observable<Prime> {
    return this.http.post<Prime>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Prime>): Observable<Prime> {
    return this.http.put<Prime>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
