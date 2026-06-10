import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environment';
import { Sanction, SanctionRequest, EnumOption } from '../../../../models/Sanction.model';
import { StoredFileDto } from '../../../../models/StoredFile.model';

/**
 * Accès API aux sanctions disciplinaires : CRUD, transitions de workflow,
 * référentiels (types / statuts) et décision PDF.
 */
@Injectable({ providedIn: 'root' })
export class SanctionService {

  private readonly base = `${environment.apiUrl}/actes/sanctions`;
  private readonly docsBase = `${environment.apiUrl}/actes`;

  constructor(private http: HttpClient) {}

  private toParams(criteria?: any): HttpParams {
    let params = new HttpParams();
    if (criteria) {
      Object.keys(criteria).forEach(key => {
        const v = criteria[key];
        if (v !== null && v !== undefined && v !== '') {
          params = params.set(key, v);
        }
      });
    }
    return params;
  }

  search(criteria?: any): Observable<Sanction[]> {
    return this.http.get<Sanction[]>(this.base, { params: this.toParams(criteria) });
  }

  searchMine(criteria?: any): Observable<Sanction[]> {
    return this.http.get<Sanction[]>(`${this.base}/me`, { params: this.toParams(criteria) });
  }

  getById(id: number): Observable<Sanction> {
    return this.http.get<Sanction>(`${this.base}/${id}`);
  }

  create(data: SanctionRequest): Observable<Sanction> {
    return this.http.post<Sanction>(this.base, data);
  }

  update(id: number, data: SanctionRequest): Observable<Sanction> {
    return this.http.put<Sanction>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // ---- Workflow ----
  submit(id: number): Observable<Sanction> {
    return this.http.post<Sanction>(`${this.base}/${id}/submit`, {});
  }

  validate(id: number): Observable<Sanction> {
    return this.http.post<Sanction>(`${this.base}/${id}/validate`, {});
  }

  reject(id: number, reason: string): Observable<Sanction> {
    return this.http.post<Sanction>(`${this.base}/${id}/reject`, { reason });
  }

  cancel(id: number): Observable<Sanction> {
    return this.http.post<Sanction>(`${this.base}/${id}/cancel`, {});
  }

  apply(id: number): Observable<Sanction> {
    return this.http.post<Sanction>(`${this.base}/${id}/apply`, {});
  }

  // ---- Référentiels ----
  getTypes(): Observable<EnumOption[]> {
    return this.http.get<EnumOption[]>(`${this.base}/types`);
  }

  getStatuses(): Observable<EnumOption[]> {
    return this.http.get<EnumOption[]>(`${this.base}/statuses`);
  }

  // ---- Décision PDF ----
  getDocuments(acteId: number): Observable<StoredFileDto[]> {
    return this.http.get<StoredFileDto[]>(`${this.docsBase}/${acteId}/documents`);
  }

  uploadDocument(acteId: number, file: File): Observable<StoredFileDto> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<StoredFileDto>(`${this.docsBase}/${acteId}/documents`, form);
  }

  deleteDocument(fileId: number): Observable<void> {
    return this.http.delete<void>(`${this.docsBase}/documents/${fileId}`);
  }
}
