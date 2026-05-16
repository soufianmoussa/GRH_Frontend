import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeConge, TypeCongeCreateUpdateRequest } from '../../../models/typeConge.model';
import { environment } from '../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TypeCongeService {

  private readonly baseUrl = `${environment.apiUrl}/types-conge`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TypeConge[]> {
    return this.http.get<TypeConge[]>(this.baseUrl);
  }

  getActive(): Observable<TypeConge[]> {
    return this.http.get<TypeConge[]>(this.baseUrl, { params: { activeOnly: 'true' } });
  }

  getById(id: number): Observable<TypeConge> {
    return this.http.get<TypeConge>(`${this.baseUrl}/${id}`);
  }

  getByCode(code: string): Observable<TypeConge> {
    return this.http.get<TypeConge>(`${this.baseUrl}/code/${code}`);
  }

  create(payload: TypeCongeCreateUpdateRequest): Observable<TypeConge> {
    return this.http.post<TypeConge>(this.baseUrl, payload);
  }

  update(id: number, payload: TypeCongeCreateUpdateRequest): Observable<TypeConge> {
    return this.http.put<TypeConge>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
