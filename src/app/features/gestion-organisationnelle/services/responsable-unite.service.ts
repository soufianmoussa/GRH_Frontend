import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageResponse } from '../../../models/PageResponse.model';
import { environment } from '../../../../../environment.prod';
import { map } from 'rxjs/operators';
import {
  ResponsableUniteDto,
  ResponsableUniteCreateUpdateRequest,
  UniteStructurelleOption,
  AgentOption
} from '../../../models/gestionOrganisationelle/responsable-unite.model';

@Injectable({
  providedIn: 'root'
})
export class ResponsableUniteService {

  private readonly baseUrl = `${environment.apiUrl}/gestion-organisationelle/responsables-unite`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, global?: string, typeUnite?: string): Observable<PageResponse<ResponsableUniteDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (global && global.trim().length) {
      params = params.set('global', global.trim());
    }

    if (typeUnite && typeUnite.trim().length) {
      params = params.set('typeUnite', typeUnite.trim());
    }

    return this.http.get<PageResponse<ResponsableUniteDto>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ResponsableUniteDto> {
    return this.http.get<ResponsableUniteDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: ResponsableUniteCreateUpdateRequest): Observable<ResponsableUniteDto> {
    return this.http.post<ResponsableUniteDto>(this.baseUrl, payload);
  }

  update(id: number, payload: ResponsableUniteCreateUpdateRequest): Observable<ResponsableUniteDto> {
    return this.http.put<ResponsableUniteDto>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }



  getUnites(): Observable<UniteStructurelleOption[]> {


    return this.http.get<PageResponse<UniteStructurelleOption>>(`${environment.apiUrl}/gestion-organisationelle/unites-structurelles?page=0&size=1000`)
      .pipe(map(res => res.content || []));
  }

  getAgentsByUnite(uniteId: number): Observable<AgentOption[]> {
    return this.http.get<AgentOption[]>(`${environment.apiUrl}/agents/unite/${uniteId}`);
  }
}
