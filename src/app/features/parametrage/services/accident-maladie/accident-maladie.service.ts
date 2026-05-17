import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AccidentMaladie} from '../../../../models/AccidentMaladie.model';
import {PageResponse} from '../../../../models/PageResponse.model';
import {environment} from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class AccidentMaladieService {


  private readonly baseUrl = `${environment.apiUrl}/accidents-maladie`;

  constructor(private http: HttpClient) {}

  getAll(
    page: number,
    size: number,
    global?: string
  ): Observable<PageResponse<AccidentMaladie>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<AccidentMaladie>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<AccidentMaladie> {
    return this.http.get<AccidentMaladie>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<AccidentMaladie>): Observable<AccidentMaladie> {
    return this.http.post<AccidentMaladie>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<AccidentMaladie>): Observable<AccidentMaladie> {
    return this.http.put<AccidentMaladie>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
