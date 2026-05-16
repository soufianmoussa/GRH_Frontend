import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formation } from '../../../models/formation.model';
import { PageResponse } from '../../../models/PageResponse.model';
import { environment } from '../../../../../environment.prod';

@Injectable({
    providedIn: 'root'
})
export class FormationService {


    private readonly baseUrl = `${environment.apiUrl}/formations`;

    constructor(private http: HttpClient) { }

    getAll(page = 0, size = 200): Observable<PageResponse<Formation>> {
        const params = new HttpParams()
            .set('page', page)
            .set('size', size)
            .set('sort', 'id,desc');

        return this.http.get<PageResponse<Formation>>(this.baseUrl, { params });
    }

    getById(id: number): Observable<Formation> {
        return this.http.get<Formation>(`${this.baseUrl}/${id}`);
    }

    getByMatricule(matricule: string): Observable<Formation[]> {
        return this.http.get<Formation[]>(`${this.baseUrl}/by-matricule/${encodeURIComponent(matricule)}`);
    }

    add(payload: Partial<Formation>): Observable<Formation> {
        return this.http.post<Formation>(this.baseUrl, payload);
    }

    update(id: number, payload: Partial<Formation>): Observable<Formation> {
        return this.http.put<Formation>(`${this.baseUrl}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    uploadCertificate(id: number, file: File): Observable<Formation> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<Formation>(`${this.baseUrl}/${id}/certificate`, formData);
    }

    deleteCertificate(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}/certificate`);
    }
}
