import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActiviteDTO, ActiviteCreateUpdateRequest, PosteTravailDTO } from '../../../models/postesActivites.model';
import { environment } from '../../../../../environment.prod';
import { PageResponse } from '../../../models/PageResponse.model';

@Injectable({
  providedIn: 'root'
})
export class PostesactivitesService {

  private apiUrlActivites = `${environment.apiUrl}/activites`;
  private apiUrlPostes = `${environment.apiUrl}/postes`;

  constructor(private http: HttpClient) {}





  getFamillesProfessionnelle(): Observable<PageResponse<any>> {
    return this.http.get<PageResponse<any>>(`${environment.apiUrl}/familles-professionnelles`, {
      params: { page: 0, size: 1000 }
    });
  }

  getFamillesEmploi(): Observable<PageResponse<any>> {
    return this.http.get<PageResponse<any>>(`${environment.apiUrl}/familles-emploi`, {
      params: { page: 0, size: 1000 }
    });
  }

  getEmploisByFamille(familleEmploiId: number): Observable<PageResponse<any>> {
    return this.http.get<PageResponse<any>>(`${environment.apiUrl}/emplois`, {
      params: { page: 0, size: 1000, familleEmploiId }
    });
  }





  getActivites(): Observable<ActiviteDTO[]> {
    return this.http.get<ActiviteDTO[]>(this.apiUrlActivites);
  }

  getActiviteById(id: number): Observable<ActiviteDTO> {
    return this.http.get<ActiviteDTO>(`${this.apiUrlActivites}/${id}`);
  }

  getActivitesByPosteTravail(posteTravailId: number): Observable<ActiviteDTO[]> {
    return this.http.get<ActiviteDTO[]>(`${this.apiUrlActivites}/by-poste-travail/${posteTravailId}`);
  }

  addActivite(data: ActiviteCreateUpdateRequest): Observable<ActiviteDTO> {
    return this.http.post<ActiviteDTO>(this.apiUrlActivites, data);
  }

  updateActivite(id: number, data: ActiviteCreateUpdateRequest): Observable<ActiviteDTO> {
    return this.http.put<ActiviteDTO>(`${this.apiUrlActivites}/${id}`, data);
  }

  deleteActivite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlActivites}/${id}`);
  }





  getPostes(): Observable<PosteTravailDTO[]> {
    return this.http.get<PosteTravailDTO[]>(this.apiUrlPostes);
  }

  getPosteById(id: number): Observable<PosteTravailDTO> {
    return this.http.get<PosteTravailDTO>(`${this.apiUrlPostes}/${id}`);
  }

  addPoste(data: PosteTravailDTO): Observable<PosteTravailDTO> {
    return this.http.post<PosteTravailDTO>(this.apiUrlPostes, data);
  }

  updatePoste(id: number, data: PosteTravailDTO): Observable<PosteTravailDTO> {
    return this.http.put<PosteTravailDTO>(`${this.apiUrlPostes}/${id}`, data);
  }

  deletePoste(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlPostes}/${id}`);
  }
}
