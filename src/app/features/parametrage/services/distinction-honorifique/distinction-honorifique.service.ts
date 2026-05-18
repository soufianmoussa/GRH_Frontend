import { Injectable } from '@angular/core';
import {DistinctionHonorifique} from '../../../../models/DistinctionHonorifique.model';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class DistinctionHonorifiqueService {


  private readonly apiUrl  = `${environment.apiUrl}/distinctions`;

  constructor(private http: HttpClient) {}


  getDistinctions(criteria?: any): Observable<DistinctionHonorifique[]> {
    let params = new HttpParams();

    if (criteria) {
      Object.keys(criteria).forEach(key => {
        if (criteria[key] !== null && criteria[key] !== undefined) {
          params = params.set(key, criteria[key]);
        }
      });
    }

    return this.http.get<DistinctionHonorifique[]>(this.apiUrl, { params });
  }


  getDistinctionById(id: number): Observable<DistinctionHonorifique> {
    return this.http.get<DistinctionHonorifique>(`${this.apiUrl}/${id}`);
  }


  addDistinction(data: DistinctionHonorifique): Observable<DistinctionHonorifique> {
    return this.http.post<DistinctionHonorifique>(this.apiUrl, data);
  }


  updateDistinction(id: number, data: DistinctionHonorifique): Observable<DistinctionHonorifique> {
    return this.http.put<DistinctionHonorifique>(`${this.apiUrl}/${id}`, data);
  }


  deleteDistinction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
