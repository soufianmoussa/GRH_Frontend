import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Diplome, DiplomeCreateUpdateRequest} from '../../../models/diplomes/diplome.model';
import {PageResponse} from '../../../models/PageResponse.model';
import {environment} from '../../../../../environment.prod';


@Injectable({
  providedIn: 'root'
})
export class DiplomesService {


  private readonly baseUrl = `${environment.apiUrl}/diplomes`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 200): Observable<PageResponse<Diplome>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Diplome>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Diplome> {
    return this.http.get<Diplome>(`${this.baseUrl}/${id}`);
  }

  getByMatricule(matricule: string): Observable<Diplome[]> {
    return this.http.get<Diplome[]>(`${this.baseUrl}/by-matricule/${encodeURIComponent(matricule)}`);
  }

  add(payload: DiplomeCreateUpdateRequest): Observable<Diplome> {
    return this.http.post<Diplome>(this.baseUrl, payload);
  }

  update(id: number, payload: DiplomeCreateUpdateRequest): Observable<Diplome> {
    return this.http.put<Diplome>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadScan(id: number, file: File): Observable<Diplome> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Diplome>(`${this.baseUrl}/${id}/scan`, formData);
  }

  deleteScan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/scan`);
  }
}
