import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IndemniteComplementaire, IndemnitePermanente} from '../../../../models/indemnitesModel.model';
import {environment} from '../../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class IndemnitesService {


  private readonly apiUrlComplementaires  = `${environment.apiUrl}/indemnites-complementaires`;


  private readonly apiUrlPermanentes  = `${environment.apiUrl}/indemnites-permanentes`;

  constructor(private http: HttpClient) { }







  getIndemnitesComplementaires(): Observable<IndemniteComplementaire[]> {
    return this.http.get<IndemniteComplementaire[]>(this.apiUrlComplementaires);
  }

  addIndemniteComplementaire(
    data: IndemniteComplementaire
  ): Observable<IndemniteComplementaire> {
    return this.http.post<IndemniteComplementaire>(
      this.apiUrlComplementaires,
      data
    );
  }

  updateIndemniteComplementaire(
    id: number,
    data: IndemniteComplementaire
  ): Observable<IndemniteComplementaire> {
    return this.http.put<IndemniteComplementaire>(
      `${this.apiUrlComplementaires}/${id}`,
      data
    );
  }

  deleteIndemniteComplementaire(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrlComplementaires}/${id}`
    );
  }








  getIndemnitesPermanentes(): Observable<IndemnitePermanente[]> {
    return this.http.get<IndemnitePermanente[]>(this.apiUrlPermanentes);
  }


  addIndemnitePermanente(
    data: IndemnitePermanente
  ): Observable<IndemnitePermanente> {
    return this.http.post<IndemnitePermanente>(this.apiUrlPermanentes, data);
  }


  updateIndemnitePermanente(
    id: number,
    data: IndemnitePermanente
  ): Observable<IndemnitePermanente> {
    return this.http.put<IndemnitePermanente>(`${this.apiUrlPermanentes}/${id}`, data);
  }


  deleteIndemnitePermanente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlPermanentes}/${id}`);
  }




}
