import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {CaisseRetraite} from '../../../../models/caisseRetraite.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CaisseService {


  private readonly apiUrl = `${environment.apiUrl}/caisses`;


  constructor(private http: HttpClient) {}


  getCaisses(criteria?: any): Observable<CaisseRetraite[]> {
    let params = new HttpParams();

    if (criteria) {
      Object.keys(criteria).forEach(key => {
        if (criteria[key] !== null && criteria[key] !== undefined) {
          params = params.set(key, criteria[key]);
        }
      });
    }

    return this.http.get<CaisseRetraite[]>(this.apiUrl, { params });
  }


  getCaisseById(id: number): Observable<CaisseRetraite> {
    return this.http.get<CaisseRetraite>(`${this.apiUrl}/${id}`);
  }


  addCaisse(data: CaisseRetraite): Observable<CaisseRetraite> {
    return this.http.post<CaisseRetraite>(this.apiUrl, data);
  }


  updateCaisse(id: number, data: CaisseRetraite): Observable<CaisseRetraite> {
    return this.http.put<CaisseRetraite>(`${this.apiUrl}/${id}`, data);
  }


  deleteCaisse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
