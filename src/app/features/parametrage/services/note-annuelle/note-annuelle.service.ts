import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {NoteAnnuelle, PageResponse} from '../../../../models/noteAnnuelle.models';
import {environment} from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class NoteAnnuelleService {

  private baseUrl = `${environment.apiUrl}/notes-annuelles`;


  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, global?: string): Observable<PageResponse<NoteAnnuelle>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    return this.http.get<PageResponse<NoteAnnuelle>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<NoteAnnuelle> {
    return this.http.get<NoteAnnuelle>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<NoteAnnuelle>): Observable<NoteAnnuelle> {
    return this.http.post<NoteAnnuelle>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<NoteAnnuelle>): Observable<NoteAnnuelle> {
    return this.http.put<NoteAnnuelle>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
