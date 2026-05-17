import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {MouvementModel} from '../../../../models/MouvementModel.model';
import {environment} from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class MouvementService {

  private readonly apiUrlMouvements  = `${environment.apiUrl}/mouvements`;

  constructor(private http: HttpClient) {}

  getMouvements(criteria?: any): Observable<MouvementModel[]> {
    let params = new HttpParams();
    if (criteria) {
      Object.keys(criteria).forEach(key => {
        if (criteria[key] !== null && criteria[key] !== undefined) {
          params = params.set(key, criteria[key]);
        }
      });
    }
    return this.http.get<MouvementModel[]>(this.apiUrlMouvements, { params });
  }

  getMyMouvements(criteria?: any): Observable<MouvementModel[]> {
    let params = new HttpParams();
    if (criteria) {
      Object.keys(criteria).forEach(key => {
        if (criteria[key] !== null && criteria[key] !== undefined) {
          params = params.set(key, criteria[key]);
        }
      });
    }
    return this.http.get<MouvementModel[]>(`${this.apiUrlMouvements}/me`, { params });
  }

  getMouvementById(id: number): Observable<MouvementModel> {
    return this.http.get<MouvementModel>(`${this.apiUrlMouvements}/${id}`);
  }

  addMouvement(data: MouvementModel): Observable<MouvementModel> {
    return this.http.post<MouvementModel>(this.apiUrlMouvements, data);
  }

  updateMouvement(id: number, data: MouvementModel): Observable<MouvementModel> {
    return this.http.put<MouvementModel>(
      `${this.apiUrlMouvements}/${id}`,
      data
    );
  }

  deleteMouvement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlMouvements}/${id}`);
  }
}
